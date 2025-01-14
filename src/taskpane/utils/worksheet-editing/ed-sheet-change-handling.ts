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
} from "../helperFunctions";
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
  let cerysCodeCol;
  ws.definedCols.forEach((col) => {
    if (col.type === "cerysCode") {
      cerysCodeCol = col.colNumber;
    }
  });
  if (cerysCodeCol === addressObj.firstCol) {
    session.handleView(NOM_CODE_SELECTION);
    session.activeEditableCell = createEditableCell(addressObj, wsName, null);
  }
};

export const handleEditableSheetChange = async (
  session: Session,
  e: Excel.WorksheetChangedEventArgs | QuasiEventObject,
  wsName: string
) => {
  try {
    await Excel.run(async (context) => {
      console.log(e);
      if (session.options.allowEffects > 0) {
        session.options.allowEffects -= 1;
        return;
      }
      const isRangeEdited = parseChangeEventObjectType(e);
      const { sheet, addressObj, definedCol } = parseEdSheetChangeEventDetails(session, e, wsName);
      if (!isRangeEdited && !(e instanceof QuasiEventObject)) {
        handleOtherEdSheetChange(context, session, e, wsName, sheet, addressObj);
        return;
      }
      const handledSuccessfully =
        isRangeEdited && (await handleEdSheetRangeEdit(context, session, e, sheet, addressObj, definedCol));
      await handleSheetDataCorruption(session, wsName, sheet);
      sheet.usedRange = await getWorksheetUsedRange(context, wsName);
      session.options.autoFillOverride = false;
      if (handledSuccessfully && definedCol.type === "cerysCode") {
        await completeCerysCodeUpdate(session, e, sheet, addressObj);
      } else if (handledSuccessfully && definedCol.type === "cerysName") {
        await completeCerysNameUpdate(context, session, e, sheet, addressObj);
      } else if (handledSuccessfully && definedCol.type === "clientCodeMapping") {
        await completeClientCodeMappingUpdate(session, e, sheet, addressObj);
      }
      await context.sync();
    });
  } catch (e) {
    console.error(e);
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
  try {
    await Excel.run(async (context) => {
      const sheet = session.editableSheets.find((ws) => ws.name === wsName);
      const updates = [];
      sheet.sheetMapping.forEach((map) => {
        affectedTransactions.forEach((affectedTran) => {
          if (map.transactionId === affectedTran._id) {
            affectedTran.updates.forEach((updatedItem) => {
              sheet.definedCols.forEach((definedCol) => {
                const col = colNumToLetter(definedCol.colNumber);
                const row = map.rowNumber;
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
      postEditableSheetEffects(context, session, sheet.name, updates);
    });
  } catch (e) {
    console.error(e);
  }
};

// export const updateEdSheetsTransValues = async (context, session: Session) => {
//   const sheetUpdateObjects = [];
//   const deletionObjs = [];
//   session.editableSheets.forEach((sheet) => {
//     sheetUpdateObjects.push(...sheet.updateObjects);
//     deletionObjs.push(...sheet.deletionObjects);
//   });
//   console.log(sheetUpdateObjects);
//   console.log(deletionObjs);
//   sheetUpdateObjects.forEach((obj) => {
//     setManyExcelRangeValues(context, obj.wsName, obj.updates);
//   });
//   if (deletionObjs.length > 0) {
//     // needs to be sorted because the row numbers that the deletion objs reference are updated on each deletion,
//     // therefore needs to be done from bottom of page up
//     deletionObjs.sort((a, b) => b.rowNumber - a.rowNumber);
//     console.log(deletionObjs);
//     await deleteWorksheetRangesUp(context, deletionObjs);
//   }
// };

export const renewEdSheetsTransRefs = (context: Excel.RequestContext, session: Session) => {
  let promptSheetDeletion = false;
  session.editableSheets.forEach((sheet) => {
    sheet.renewTransactions(context, session, session.assignment.transactions);
    if (sheet.transactions.length === 0) {
      sheet.promptDeletion = true;
      promptSheetDeletion = true;
    }
  });
  return promptSheetDeletion;
};
