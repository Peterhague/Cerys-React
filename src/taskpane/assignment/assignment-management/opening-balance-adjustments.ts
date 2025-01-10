import { Assignment } from "../../classes/assignment";
import { createEditableWorksheet } from "../../classes/editable-worksheet";
import { Session } from "../../classes/session";
import { TransactionMap } from "../../classes/transaction-map";
import { TransactionUpdate } from "../../classes/transaction-update";
import { updateCerysCodeMappingUrl } from "../../fetching/apiEndpoints";
import { fetchOptionsUpdateCerysCodeMapping } from "../../fetching/generateOptions";
import { BLANK_VIEW_OPTIONS } from "../../static-values/view-options";
import {
  callNextView,
  getUpdatedDate,
  getUpdatedNarrative,
  handleEditButtonClick,
} from "../../utils.ts/helperFunctions";
import { getClientCodeMappingMessage } from "../../utils.ts/messages";
import { addOneWorksheet, setExcelRangeValue } from "../../utils.ts/worksheet";
import { updateEdSheetClientCodeMapping } from "../../utils.ts/worksheet-editing/ws-editing";
/* global Excel */

export const getOBARelTrans = (session: Session) => {
  return session.assignment.transactions.filter((tran) => tran.getCerysCodeObj(session).clientAdj);
};

export async function oBARelevantTransView(session: Session) {
  try {
    await Excel.run(async (context) => {
      const relTrans = getOBARelTrans(session);
      let sheetInMidEdit = false;
      relTrans.forEach((tran) => {
        if (tran.updates.length > 0) sheetInMidEdit = true;
      });
      const wsName = "OBA relevant transactions";
      const { ws } = await addOneWorksheet(context, session, { name: wsName, addListeners: undefined });
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
        [
          "Number",
          "Date",
          "Type",
          "Nominal Code",
          "Nominal Name",
          "Narrative",
          "DR/(CR)",
          "Nominal Code",
          "Nominal Name",
        ],
      ];
      let rowNumber = 3;
      const sheetMapping = [];
      relTrans.forEach((line) => {
        const cerysCodeObj = line.getCerysCodeObj(session);
        const date = getUpdatedDate(line) ? getUpdatedDate(line).value : line.transactionDateExcel;
        const hasUpdatedCerysCode = line.updates.find((update) => update.type === "cerysCode");
        const cerysCode = hasUpdatedCerysCode ? hasUpdatedCerysCode.value : line.cerysCode;
        const shortName = hasUpdatedCerysCode
          ? hasUpdatedCerysCode.cerysCodeObject.cerysShortName
          : cerysCodeObj.cerysShortName;
        const narrative = getUpdatedNarrative(line) ? getUpdatedNarrative(line) : line.narrative;
        let arr = [];
        arr.push(line.transactionNumber);
        arr.push(date);
        arr.push(line.transactionType);
        arr.push(cerysCode);
        arr.push(shortName);
        arr.push(narrative);
        arr.push(line.value / 100);
        arr.push(line.getClientMappingObj(session).clientCode);
        arr.push(line.getClientMappingObj(session).clientCodeName);
        valuesToPost.push(arr);
        const map = new TransactionMap(line._id, rowNumber);
        sheetMapping.push(map);
        rowNumber += 1;
      });
      range.values = valuesToPost;
      const headerRange = ws.getRange("A1:I2");
      headerRange.format.font.bold = true;
      const columnA = ws.getRange("B:B");
      columnA.numberFormat = [["dd/mm/yyyy"]];
      const columnsRange = ws.getRange("A:I");
      const columnG = ws.getRange("G:G");
      columnG.numberFormat = [["#,##0.00;(#,##0.00);-"]];
      createEditableWorksheet(session, relTrans, ws, valuesToPost, "OBARelevantAdjustments", sheetMapping);
      columnsRange.format.autofitColumns();
      ws.activate();
      if (sheetInMidEdit) handleEditButtonClick(session);
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
}

export const handleClientCodeMapping = (session: Session, nominalCode: number | string, nominalCodeName: string) => {
  const tran = session.activeEditableCell.getActiveTransaction(session);
  const cerysCodeObj = tran.getCerysCodeObj(session);
  const wsName = session.activeEditableCell.wsName;
  const range = session.activeEditableCell.getRange();
  const options = {
    handleYes: () => checkTransForCustomMapping(session, nominalCode, nominalCodeName, cerysCodeObj.cerysCode, wsName),
    handleNo: async () => await setExcelRangeValue(wsName, range, nominalCode),
    message: getClientCodeMappingMessage(cerysCodeObj.cerysCode, cerysCodeObj.cerysName),
    yesButtonText: "All transactions",
    noButtonText: "This transaction only",
  };
  session.handleDynamicView("userConfirmPrompt", options);
};

export const checkTransForCustomMapping = (
  session: Session,
  nominalCode: number | string,
  nominalCodeName: string,
  cerysCode: number,
  wsName: string
) => {
  const relTrans = session.assignment.transactions.filter((tran) => tran.cerysCode === cerysCode);
  const customRemappedTrans = relTrans.filter((tran) => tran.clientMappingOverridden);
  if (customRemappedTrans.length === 0) {
    updateCerysCodeMapping(session, nominalCode, nominalCodeName, cerysCode, wsName);
  } else {
    const options = BLANK_VIEW_OPTIONS;
    options.nominalCode = nominalCode;
    options.nominalCodeName = nominalCodeName;
    options.cerysCode = cerysCode;
    options.wsName = wsName;
    session.handleDynamicView("reviewCustomMappedTrans", options);
  }
};

export const updateCerysCodeMapping = async (
  session: Session,
  nominalCode: number | string,
  nominalCodeName: string,
  cerysCode: number,
  wsName: string
) => {
  const relTrans = session.assignment.transactions.filter((tran) => tran.cerysCode === cerysCode);
  const ws = session.editableSheets.find((sheet) => sheet.name === wsName);
  relTrans.forEach((tran) => {
    const clientMappingObj = tran.getClientMappingObj(session);
    tran.updates = [
      new TransactionUpdate(
        session,
        wsName,
        ws.worksheetId,
        "clientCodeMapping",
        nominalCode,
        clientMappingObj.clientCode,
        null
      ),
      new TransactionUpdate(
        session,
        wsName,
        ws.worksheetId,
        "clientCodeNameMapping",
        nominalCodeName,
        clientMappingObj.clientCodeName,
        null
      ),
    ];
  });
  updateEdSheetClientCodeMapping(session, wsName, relTrans);
  const cerysCodeObj = session.chart.find((code) => code.cerysCode === cerysCode);
  const options = fetchOptionsUpdateCerysCodeMapping(session, nominalCode, nominalCodeName, cerysCodeObj);
  const updatedClientDb = await fetch(updateCerysCodeMappingUrl, options);
  const { customer, assignment, newMapping } = await updatedClientDb.json();
  console.log(newMapping);
  session.customer = customer;
  session.assignment = new Assignment(assignment);
  session.chart.forEach((code) => {
    if (code.cerysCode === newMapping.cerysCode) {
      code.currentClientMapping = newMapping.currentClientMapping;
      code.previousClientMappings = newMapping.previousClientMappings;
    }
  });
  callNextView(session);
};

export const updateCerysCodeMappingIgnoreCustom = async (
  session: Session,
  nominalCode: number | string,
  nominalCodeName: string,
  cerysCode: number,
  wsName: string
) => {
  const relTrans = session.assignment.transactions.filter((tran) => tran.cerysCode === cerysCode);
  const transNotRemapped = relTrans.filter((tran) => !tran.clientMappingOverridden);
  const ws = session.editableSheets.find((sheet) => sheet.name === wsName);
  transNotRemapped.forEach((tran) => {
    const clientMappingObj = tran.getClientMappingObj(session);
    tran.updates = [
      new TransactionUpdate(
        session,
        wsName,
        ws.worksheetId,
        "clientCodeMapping",
        nominalCode,
        clientMappingObj.clientCode,
        null
      ),
      new TransactionUpdate(
        session,
        wsName,
        ws.worksheetId,
        "clientCodeNameMapping",
        nominalCodeName,
        clientMappingObj.clientCodeName,
        null
      ),
    ];
  });
  updateEdSheetClientCodeMapping(session, wsName, transNotRemapped);
  const cerysCodeObj = session.chart.find((code) => code.cerysCode === cerysCode);
  const options = fetchOptionsUpdateCerysCodeMapping(session, nominalCode, nominalCodeName, cerysCodeObj);
  const updatedClientDb = await fetch(updateCerysCodeMappingUrl, options);
  const { customer, assignment, newMapping } = await updatedClientDb.json();
  console.log(newMapping);
  session.customer = customer;
  session.assignment = new Assignment(assignment);
  session.chart.forEach((code) => {
    if (code.cerysCode === newMapping.cerysCode) {
      code.currentClientMapping = newMapping.currentClientMapping;
      code.previousClientMappings = newMapping.previousClientMappings;
    }
  });
  callNextView(session);
};
