import { createEditableCell } from "../../classes/editable-cell";
import { EditableWorksheet } from "../../classes/editable-worksheet";
import { Session } from "../../classes/session";
import { Transaction } from "../../classes/transaction";
import { NOM_CODE_SELECTION } from "../../static-values/views";
import {
  getDefinedCol,
  interpretEventAddress,
  parseChangeEventObjectType,
  postEditableSheetEffects,
  simulateEditButtonClick,
} from "../helper-functions";
import { getWorksheetUsedRange } from "../worksheet";
import { colNumToLetter } from "../excel-col-conversion";
import { handleOtherEdSheetChange } from "./ws-col-row-manipulation";
import {
  completeCerysCodeUpdate,
  completeCerysNameUpdate,
  completeClientCodeMappingUpdate,
  handleEdSheetRangeEdit,
  resetToPreviousValues,
} from "./ws-range-editing";
import { QuasiEventObject } from "../../classes/quasi-event-object";
/* global Excel */

export const handleWorksheetSelection = async (session: Session, e, wsName: string) => {
  const addressObj = interpretEventAddress(e);
  const ws = session.editableSheets.find((sheet) => sheet.name === wsName);
  if (addressObj.firstRow !== addressObj.lastRow || addressObj.firstCol !== addressObj.lastCol) return;
  let withinEditableRange = false;
  ws.editableRowRanges.forEach((range) => {
    if (addressObj.firstRow >= range.firstRow && addressObj.firstRow <= range.lastRow) withinEditableRange = true;
  });
  if (!withinEditableRange) return;
  let cerysCodeCol: number;
  ws.definedCols.forEach((col) => {
    if (col.type === "cerysCode") {
      cerysCodeCol = ws.getCurrentColumn(col.colNumberOrig);
    }
  });
  if (cerysCodeCol === addressObj.firstCol) {
    session.handleOverlayView(NOM_CODE_SELECTION);
    session.activeEditableCell = createEditableCell(addressObj, wsName, null);
  }
};

export const handleEditableSheetChange = async (
  session: Session,
  e: Excel.WorksheetChangedEventArgs | QuasiEventObject,
  wsName: string
) => {
  console.log(e);
  if (session.options.allowEffects > 0) {
    console.log("EFFECTS ALLOWED ONLY");
    session.options.allowEffects -= 1;
    return;
  }
  console.log("change registered");
  const isRangeEdited = parseChangeEventObjectType(e);
  console.log(isRangeEdited);
  const { sheet, addressObj, definedCol } = parseEdSheetChangeEventDetails(session, e, wsName);
  if (!isRangeEdited && !(e instanceof QuasiEventObject)) {
    handleOtherEdSheetChange(session, e, wsName, sheet, addressObj);
    return;
  }
  const handledSuccessfully =
    isRangeEdited && (await handleEdSheetRangeEdit(session, e, sheet, addressObj, definedCol));
  await handleSheetDataCorruption(session, wsName, sheet);
  sheet.usedRange = await getWorksheetUsedRange(wsName);
  session.options.autoFillOverride = false;
  console.log(handledSuccessfully);
  if (handledSuccessfully && definedCol.type === "cerysCode") {
    await completeCerysCodeUpdate(session, e, sheet, addressObj);
  } else if (handledSuccessfully && definedCol.type === "cerysName") {
    await completeCerysNameUpdate(session, e, sheet, addressObj);
  } else if (handledSuccessfully && definedCol.type === "clientCodeMapping") {
    await completeClientCodeMappingUpdate(session, e, sheet, addressObj);
  }
};

export const parseEdSheetChangeEventDetails = (
  session: Session,
  e: Excel.WorksheetChangedEventArgs | QuasiEventObject,
  wsName: string
) => {
  const sheet = session.editableSheets.find((ws) => ws.name === wsName);
  const addressObj = interpretEventAddress(e);
  const definedCol = getDefinedCol(sheet, addressObj.firstCol);
  return { sheet, addressObj, definedCol };
};

export const handleSheetDataCorruption = async (session: Session, wsName: string, sheet: EditableWorksheet) => {
  if (sheet.dataCorrupted) {
    if (sheet.editButtonStatus === "hide" || sheet.editButtonStatus === "inProgress") {
      simulateEditButtonClick(session);
    }
    session.options.autoFillOverride = true;
    await resetToPreviousValues(wsName, sheet);
  }
};

export const updateEdSheetClientCodeMapping = async (
  session: Session,
  wsName: string,
  affectedTransactions: Transaction[]
) => {
  const sheet = session.editableSheets.find((ws) => ws.name === wsName);
  const updates = [];
  sheet.sheetMapping.forEach((map) => {
    affectedTransactions.forEach((affectedTran) => {
      if (map.transactionId === affectedTran.cerysTransactionId) {
        affectedTran.updates.forEach((updatedItem) => {
          sheet.definedCols.forEach((definedCol) => {
            const col = colNumToLetter(sheet.getCurrentColumn(definedCol.colNumberOrig));
            const row = sheet.getCurrentRow(map.index);
            let update: { address: string; value?: string | number } = {
              address: `${col}${row}:${col}${row}`,
            };
            if (definedCol.type === updatedItem.type) {
              update.value = updatedItem.value;
              update.value && updates.push(update);
            }
          });
        });
      }
    });
  });
  postEditableSheetEffects(session, sheet.name, updates);
};

export const renewEdSheetsTransRefs = async (session: Session) => {
  let promptSheetDeletion = false;
  for (let i = 0; i < session.editableSheets.length; i++) {
    await session.editableSheets[i].renewTransactions(session, session.assignment.transactions);
    if (session.editableSheets[i].transactions.length === 0) {
      session.editableSheets[i].promptDeletion = true;
      promptSheetDeletion = true;
    }
  }
  return promptSheetDeletion;
};
