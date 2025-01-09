import { Assignment } from "../../classes/assignment";
import { createEditableWorksheet } from "../../classes/editable-worksheet";
import { Session } from "../../classes/session";
import { TransactionMap } from "../../classes/transaction-map";
import { TransactionUpdate } from "../../classes/transaction-update";
import { updateCerysCodeMappingUrl } from "../../fetching/apiEndpoints";
import { fetchOptionsUpdateCerysCodeMapping } from "../../fetching/generateOptions";
import {
  callNextView,
  getActiveClientCodeMapping,
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
        const date = getUpdatedDate(line) ? getUpdatedDate(line).value : line.transactionDateExcel;
        const hasUpdatedCerysCode = line.updates.find((update) => update.type === "cerysCode");
        const cerysCode = hasUpdatedCerysCode ? hasUpdatedCerysCode.value : line.cerysCode;
        const shortName = hasUpdatedCerysCode
          ? hasUpdatedCerysCode.cerysCodeObject.cerysShortName
          : line.getCerysCodeObj(session).cerysShortName;
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
  const cerysCode = tran.cerysCode;
  const wsName = session.activeEditableCell.wsName;
  const range = session.activeEditableCell.getRange();
  const options = {
    handleYes: () => updateCerysCodeMapping(session, nominalCode, nominalCodeName, cerysCode, wsName),
    handleNo: async () => await setExcelRangeValue(wsName, range, nominalCode),
    message: getClientCodeMappingMessage(nominalCode, nominalCodeName),
    yesButtonText: "All transactions",
    noButtonText: "This transaction only",
  };
  session.handleDynamicView("userConfirmPrompt", options);
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
  relTrans.forEach(
    (tran) =>
      (tran.updates = [
        new TransactionUpdate(
          session,
          wsName,
          ws.worksheetId,
          "clientCodeMapping",
          nominalCode,
          tran.activeClientMapping.clientCode,
          null
        ),
        new TransactionUpdate(
          session,
          wsName,
          ws.worksheetId,
          "clientCodeNameMapping",
          nominalCodeName,
          tran.activeClientMapping.clientCodeName,
          null
        ),
      ])
  );
  updateEdSheetClientCodeMapping(session, wsName, relTrans);
  const options = fetchOptionsUpdateCerysCodeMapping(session, nominalCode, nominalCodeName, cerysCode);
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
