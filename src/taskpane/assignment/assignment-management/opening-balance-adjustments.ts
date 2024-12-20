import { createDefinedCols } from "../../classes/defined-col";
import { TransactionMap } from "../../classes/transaction-map";
import { updateCerysCodeMappingUrl } from "../../fetching/apiEndpoints";
import { fetchOptionsUpdateCerysCodeMapping } from "../../fetching/generateOptions";
import {
  callNextView,
  createEditableWs,
  getActiveClientCodeMapping,
  getExcelContext,
  getUpdatedDate,
  getUpdatedNarrative,
  handleEditButtonClick,
} from "../../utils.ts/helperFunctions";
import { getClientCodeMappingMessage } from "../../utils.ts/messages";
import { addWorksheet, setExcelRangeValue } from "../../utils.ts/worksheet";
import { updateEdSheetClientCodeMapping } from "../../utils.ts/worksheet-editing/ws-editing";


export const getOBARelTrans = (transactions) => {
    return transactions.filter(tran => tran.clientAdj);
}
export async function oBARelevantTransView(session) {
  //const relTrans = session.activeAssignment.transactions.filter((tran) => {
  //  return tran.clientAdj;
  //});
  const relTrans = getOBARelTrans(session.activeAssignment.transactions);
  const context = await getExcelContext();
  let sheetInMidEdit = false;
  relTrans.forEach((tran) => {
    if (tran.updates.length > 0) sheetInMidEdit = true;
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
  const sheetMapping = [];
  relTrans.forEach((line) => {
    const date = getUpdatedDate(line) ? getUpdatedDate(line).value : line.transactionDateExcel;
    const hasUpdatedCerysCode = line.updates.find((update) => update.type === "cerysCode");
    const cerysCode = hasUpdatedCerysCode ? hasUpdatedCerysCode.value : line.cerysCode;
    const shortName = hasUpdatedCerysCode ? hasUpdatedCerysCode.cerysCodeObject.cerysShortName : line.cerysShortName;
    const narrative = getUpdatedNarrative(line) ? getUpdatedNarrative(line) : line.narrative;
    const { clientCode, clientCodeName } = getActiveClientCodeMapping(session, line);
    let arr = [];
    arr.push(line.transactionNumber);
    arr.push(date);
    arr.push(line.transactionType);
    arr.push(cerysCode);
    arr.push(shortName);
    arr.push(narrative);
    arr.push(line.value / 100);
    arr.push(clientCode);
    arr.push(clientCodeName);
    valuesToPost.push(arr);
    const map = new TransactionMap(line._id, rowNumber);
    sheetMapping.push(map);
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
  const definedCols = createDefinedCols("OBARelevantAdjustments");
  createEditableWs(session, relTrans, ws, definedCols, valuesToPost, "OBARelevantAdjustments", sheetMapping, getOBARelTrans, null);
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
    handleYes: () => updateCerysCodeMapping(session, nominalCode, nominalCodeName, cerysCode, wsName),
    handleNo: () => setExcelRangeValue(wsName, range, nominalCode),
    message: getClientCodeMappingMessage(nominalCode, nominalCodeName),
    yesButtonText: "All transactions",
    noButtonText: "This transaction only",
  };
  session["handleDynamicView"]("userConfirmPrompt", options);
};

export const updateCerysCodeMapping = async (session, nominalCode, nominalCodeName, cerysCode, wsName) => {
  const relTrans = session.activeAssignment.transactions.filter((tran) => tran.cerysCode === cerysCode);
  relTrans.forEach(
    (tran) =>
      (tran.updates = [
        { updateType: "clientCodeMapping", value: nominalCode },
        { updateType: "clientCodeNameMapping", value: nominalCodeName },
      ])
  );
  updateEdSheetClientCodeMapping(session, wsName, relTrans);
  const options = fetchOptionsUpdateCerysCodeMapping(session, nominalCode, nominalCodeName, cerysCode);
  const updatedClientDb = await fetch(updateCerysCodeMappingUrl, options);
  const { customer, client, assignment } = await updatedClientDb.json();
  session.customer = customer;
  session.activeAssignment = assignment;
  session.chart = client.cerysChart;
  callNextView(session);
};

//export const updateOpenSheetsForCerysMapping = async (session, cerysCode, nominalCode) => {
//  session.editableSheets.forEach((sheet) => {
//    const definedCol = hasDefinedColOf(sheet, "clientCodeMapping");
//    if (definedCol) {
//      const colLetter = colNumToLetter(definedCol.colNumber);
//      sheet.transactions.forEach((tran) => {
//        if (tran.cerysCode === cerysCode) {
//          const range = `${colLetter}${tran.rowNumber}:${colLetter}${tran.rowNumber}`;
//          const args = [sheet.name, range, nominalCode];
//          session.options.editableSheetCallback.args.push(args);
//        }
//      });
//    }
//  });
//  if (session.options.editableSheetCallback.args.length > 0)
//    session.options.editableSheetCallback.function = setExcelRangeValue;
//  console.log(session.options);
//  //fudge:
//  handleEdSheetCallback(session, { isQuasiMutable: true });
//};
