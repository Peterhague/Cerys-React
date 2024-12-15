import { updateCerysCodeMappingUrl } from "../../fetching/apiEndpoints";
import { fetchOptionsUpdateCerysCodeMapping } from "../../fetching/generateOptions";
import { colNumToLetter } from "../../utils.ts/excel-col-conversion";
import {
  callNextView,
  createEditableWs,
  getExcelContext,
  handleEditButtonClick,
  hasDefinedColOf,
} from "../../utils.ts/helperFunctions";
import { getClientCodeMappingMessage } from "../../utils.ts/messages";
import { addWorksheet, setExcelRangeValue } from "../../utils.ts/worksheet";
import { updateEdSheetTransValues } from "../../utils.ts/worksheet-editing/ws-editing";
import { handleEdSheetCallback } from "../../utils.ts/worksheet-editing/ws-range-editing";

export async function oBARelevantTransView(session) {
  const relTrans = session.activeAssignment.transactions.filter((tran) => {
    return tran.clientAdj;
  });
  const context = await getExcelContext();
  let sheetInMidEdit = false;
  session.updatedTransactions.forEach((update) => {
    relTrans.forEach((tran) => {
      if (update.transactionId === tran._id) {
        sheetInMidEdit = true;
        tran.cerysCodeUpdated = update.updatedCode && update.updatedCode;
        tran.transactionDateExcelUpdated = update.updatedDate && update.updatedDate;
        tran.narrativeUpdated = update.updatedNarrative && update.updatedNarrative;
        update.rowNumber = update.rowNumberOrig;
      }
    });
  });
  const wsName = "OBA relevant transactions";
  const ws = addWorksheet(context, wsName);
  ws.load(["id", "name"]);
  await context.sync();
  const range = ws.getRange(`A1:I${relTrans.length + 2}`);
  const valuesToPost = [
    [
      "Transaction",
      "Transaction",
      "Transaction",
      "Cerys",
      "Cerys",
      "Transaction",
      "Value",
      "Mapped Client",
      "Mapped Client",
    ],
    ["Number", "Date", "Type", "Nominal Code", "Nominal Name", "Narrative", "DR/(CR)", "Nominal Code", "Nominal Name"],
  ];
  let rowNumber = 3;
  relTrans.forEach((line) => {
    let arr = [];
    arr.push(line.transactionNumber);
    if (line.transactionDateExcelUpdated) {
      arr.push(line.transactionDateExcelUpdated);
      delete line.transactionDateExcelUpdated;
    } else {
      arr.push(line.transactionDateExcel);
    }
    arr.push(line.transactionType);
    if (line.cerysCodeUpdated) {
      arr.push(line.cerysCodeUpdated);
      delete line.cerysCodeUpdated;
    } else {
      arr.push(line.cerysCode);
    }
    arr.push(line.cerysShortName);
    if (line.narrativeUpdated) {
      arr.push(line.narrativeUpdated);
      delete line.narrativeUpdated;
    } else {
      arr.push(line.narrative);
    }
    arr.push(line.value / 100);
    arr.push(line.clientMappingOverride ? line.customClientMapping.clientCode : line.defaultClientMapping.clientCode);
    arr.push(
      line.clientMappingOverride ? line.customClientMapping.clientCodeName : line.defaultClientMapping.clientCodeName
    );
    valuesToPost.push(arr);
    line.rowNumber = rowNumber;
    line.rowNumberOrig = rowNumber;
    rowNumber += 1;
  });
  range.values = valuesToPost;
  const headerRange = ws.getRange("A1:I2");
  headerRange.format.font.bold = true;
  const columnA = ws.getRange("B:B");
  columnA.numberFormat = "dd/mm/yyyy";
  const columnsRange = ws.getRange("A:I");
  const columnG = ws.getRange("G:G");
  columnG.numberFormat = "#,##0.00;(#,##0.00);-";
  const definedCols = [
    {
      type: "transNo",
      colNumber: 1,
      mutable: false,
      isQuasiMutable: false,
      format: "0",
      deleted: false,
      unique: true,
    },
    {
      type: "date",
      colNumber: 2,
      mutable: true,
      isQuasiMutable: false,
      format: "dd/mm/yyyy",
      deleted: false,
      updateKey: "updatedDate",
      unique: false,
    },
    {
      type: "transType",
      colNumber: 3,
      mutable: false,
      isQuasiMutable: false,
      format: "",
      deleted: false,
      unique: false,
    },
    {
      type: "cerysCode",
      colNumber: 4,
      mutable: true,
      isQuasiMutable: false,
      format: "0",
      deleted: false,
      updateKey: "updatedCode",
      unique: false,
    },
    {
      type: "cerysName",
      colNumber: 5,
      mutable: false,
      isQuasiMutable: true,
      format: "",
      deleted: false,
      unique: false,
    },
    {
      type: "cerysNarrative",
      colNumber: 6,
      mutable: true,
      isQuasiMutable: false,
      format: "",
      deleted: false,
      updateKey: "updatedNarrative",
      unique: false,
    },
    {
      type: "value",
      colNumber: 7,
      mutable: false,
      isQuasiMutable: false,
      format: "#,##0.00;(#,##0.00);-",
      deleted: false,
      unique: false,
    },
    {
      type: "clientCodeMapping",
      colNumber: 8,
      mutable: true,
      isQuasiMutable: false,
      format: "0",
      deleted: false,
      updateKey: "updatedClientCodeMapping",
      unique: false,
    },
    {
      type: "clientCodeNameMapping",
      colNumber: 9,
      mutable: false,
      isQuasiMutable: true,
      format: "",
      deleted: false,
      unique: false,
    },
  ];
  createEditableWs(session, relTrans, ws, definedCols, valuesToPost, "OBARelevantAdjustments");
  columnsRange.format.autofitColumns();
  ws.activate();
  if (sheetInMidEdit) handleEditButtonClick(session);
  await context.sync();
}

export const handleClientCodeMapping = (session, nominalCode, nominalCodeName) => {
  const tran = session.activeEditableCell.getActiveTransaction(session);
  const cerysCode = tran.cerysCode;
  const wsName = session.activeEditableCell.wsName;
  const range = session.activeEditableCell.getRange();
  const options = {
    handleYes: () => updateCerysCodeMapping(session, nominalCode, nominalCodeName, cerysCode),
    handleNo: () => setExcelRangeValue(wsName, range, nominalCode),
    message: getClientCodeMappingMessage(nominalCode, nominalCodeName),
    yesButtonText: "All transactions",
    noButtonText: "This transaction only",
  };
  session["handleDynamicView"]("userConfirmPrompt", options);
};

export const updateCerysCodeMapping = async (session, nominalCode, nominalCodeName, cerysCode) => {
  const relTrans = session.activeAssignment.transactions.filter((tran) => tran.cerysCode === cerysCode);
  relTrans.forEach(
    (tran) =>
      (tran.updates = [
        { updateType: "clientCodeMapping", value: nominalCode },
        { updateType: "clientCodeNameMapping", value: nominalCodeName },
      ])
  );
  updateEdSheetTransValues(session, session.editableSheets[0], relTrans);
  const options = fetchOptionsUpdateCerysCodeMapping(session, nominalCode, nominalCodeName, cerysCode);
  const updatedClientDb = await fetch(updateCerysCodeMappingUrl, options);
  const { customer, assignment } = await updatedClientDb.json();
  session.customer = customer;
  session.activeAssignment = assignment;
  callNextView(session);
};

export const updateOpenSheetsForCerysMapping = async (session, cerysCode, nominalCode) => {
  session.editableSheets.forEach((sheet) => {
    const definedCol = hasDefinedColOf(sheet, "clientCodeMapping");
    if (definedCol) {
      const colLetter = colNumToLetter(definedCol.colNumber);
      sheet.transactions.forEach((tran) => {
        if (tran.cerysCode === cerysCode) {
          const range = `${colLetter}${tran.rowNumber}:${colLetter}${tran.rowNumber}`;
          const args = [sheet.name, range, nominalCode];
          session.options.editableSheetCallback.args.push(args);
        }
      });
    }
  });
  if (session.options.editableSheetCallback.args.length > 0)
    session.options.editableSheetCallback.function = setExcelRangeValue;
  console.log(session.options);
  //fudge:
  handleEdSheetCallback(session, { isQuasiMutable: true });
};
