import { createEditableCell } from "../../classes/editable-cell";
import { getDefinedCol, interpretEventAddress, simulateEditButtonClick } from ".././helperFunctions";
import { deleteWorksheetRangesUp, getWorksheetUsedRange, setManyExcelRangeValues } from ".././worksheet";
import { colNumToLetter } from "../excel-col-conversion";
import { createDeletionObject } from "../transactions/transactions";
import { handleOtherChange } from "./ws-col-row-manipulation";
import {
  completeCerysCodeUpdate,
  completeCerysNameUpdate,
  completeClientCodeMappingUpdate,
  handleRangeEdit,
  resetToPreviousValues,
} from "./ws-range-editing";
/* global Excel */

export const handleWorksheetSelection = async (session, e, wsName) => {
  const addressObj = interpretEventAddress(e);
  let ws;
  session.editableSheets.forEach((sheet) => {
    if (sheet.name == wsName) {
      ws = sheet;
    }
  });
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
    session.handleView("nomCodeSelection");
    session.activeEditableCell = createEditableCell(addressObj, wsName, null);
  }
};

export const handleWorksheetEdit = async (session, e, wsName) => {
  try {
    await Excel.run(async (context) => {
      console.log(e);
      if (session.options.allowEffects > 0) {
        session.options.allowEffects -= 1;
        return;
      }
      const isRangeEdited = parseChangeEventObjectType(e);
      const { sheet, addressObj, definedCol } = parseChangeEventDetails(session, e, wsName);
      if (!isRangeEdited) {
        handleOtherChange(context, session, e, wsName, sheet, addressObj);
        return;
      }
      const handledSuccessfully =
        isRangeEdited && (await handleRangeEdit(context, session, e, sheet, addressObj, definedCol));
      await handleSheetDataCorruption(session, wsName, sheet);
      const usedRange = await getWorksheetUsedRange(context, wsName);
      sheet.usedRange = usedRange;
      session.options.autoFillOverride = false;
      if (handledSuccessfully && definedCol.type === "cerysCode") {
        await completeCerysCodeUpdate(context, session, e, sheet, addressObj);
      } else if (handledSuccessfully && definedCol.type === "cerysName") {
        await completeCerysNameUpdate(context, session, e, sheet, addressObj);
      } else if (handledSuccessfully && definedCol.type === "clientCodeMapping") {
        await completeClientCodeMappingUpdate(context, session, e, sheet, addressObj);
      }
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
};

export const parseChangeEventObjectType = (e) => {
  return e.changeType === "RangeEdited" ? true : false;
};

export const parseChangeEventDetails = (session, e, wsName) => {
  const sheet = session.editableSheets.find((ws) => ws.name === wsName);
  const addressObj = interpretEventAddress(e);
  const definedCol = getDefinedCol(sheet, addressObj.firstCol);
  return { sheet, addressObj, definedCol };
};

export const handleSheetDataCorruption = async (session, wsName, sheet) => {
  if (sheet.dataCorrupted) {
    if (sheet.editButtonStatus === "hide" || sheet.editButtonStatus === "inProgress") {
      simulateEditButtonClick(session);
    }
    session.options.autoFillOverride = true;
    await resetToPreviousValues(wsName, sheet);
  }
};

export const updateEdSheetClientCodeMapping = async (session, wsName, affectedTransactions) => {
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
                if (definedCol.type === updatedItem.updateType) {
                  update.value = updatedItem.value;
                  update.value && updates.push(update);
                }
              });
            });
          }
        });
      });
      session.options.allowEffects = updates.length;
      setManyExcelRangeValues(context, sheet.name, updates);
    });
  } catch (e) {
    console.error(e);
  }
};

// export const updateEdSheetsTransValues = async (context, session) => {
//   console.log(session);
//   const sheetUpdateObjects = [];
//   const deletionObjs = [];
//   session.editableSheets.forEach((edSheet) => {
//     const sheetUpdateObj = { wsName: edSheet.name, updates: [] };
//     edSheet.transactions.forEach((edShtTran) => {
//       const map = edSheet.sheetMapping.find((map) => map.transactionId === edShtTran._id);
//       console.log(edSheet.filterObj.target);
//       console.log(edShtTran);
//       console.log(edShtTran[edSheet.filterObj.target]);
//       console.log(edSheet.filterObj.value);
//       if (edShtTran[edSheet.filterObj.target] !== edSheet.filterObj.value) {
//         deletionObjs.push(createDeletionObject(edShtTran, edSheet));
//       } else {
//         edShtTran.updates.forEach((update) => {
//           if (update.worksheetId !== edSheet.worksheetId) {
//             const definedCol = edSheet.definedCols.find((col) => col.type === update.type);
//             const col = colNumToLetter(definedCol.colNumber);
//             const row = map.rowNumber;
//             const sheetUpdate: { address: string; value?: string | number } = {
//               address: `${col}${row}:${col}${row}`,
//               value: update.value,
//             };
//             sheetUpdateObj.updates.push(sheetUpdate);
//           }
//         });
//       }
//     });
//     sheetUpdateObj.updates.length > 0 && sheetUpdateObjects.push(sheetUpdateObj);
//   });
//   console.log(sheetUpdateObjects);
//   sheetUpdateObjects.forEach((obj) => {
//     setManyExcelRangeValues(context, obj.wsName, obj.updates);
//   });
//   console.log(deletionObjs);
//   if (deletionObjs.length > 0) await deleteWorksheetRangesUp(context, deletionObjs);
// };

export const updateEdSheetsTransValues = async (context, session) => {
  console.log(session);
  const sheetUpdateObjects = [];
  const deletionObjs = [];
  session.editableSheets.forEach((sheet) => {
    sheet.sheetMapping.forEach((map) => {
      const transaction = sheet.transactions.find((tran) => tran._id === map.transactionId);
      if (transaction) {
        const sheetUpdateObj = { wsName: sheet.name, updates: [] };
        transaction.updates.forEach((update) => {
          if (update.worksheetId !== sheet.worksheetId) {
            const definedCol = sheet.definedCols.find((col) => col.type === update.type);
            const col = colNumToLetter(definedCol.colNumber);
            const row = map.rowNumber;
            const sheetUpdate: { address: string; value?: string | number } = {
              address: `${col}${row}:${col}${row}`,
              value: update.value,
            };
            sheetUpdateObj.updates.push(sheetUpdate);
          }
          sheetUpdateObj.updates.length > 0 && sheetUpdateObjects.push(sheetUpdateObj);
        });
      } else {
        deletionObjs.push(createDeletionObject(map, sheet));
      }
    });
    sheet.sheetMapping = sheet.transactions.map((tran) =>
      sheet.sheetMapping.find((mapping) => mapping.transactionId === tran._id)
    );
  });
  console.log(sheetUpdateObjects);
  sheetUpdateObjects.forEach((obj) => {
    setManyExcelRangeValues(context, obj.wsName, obj.updates);
  });
  console.log(deletionObjs);
  if (deletionObjs.length > 0) await deleteWorksheetRangesUp(context, deletionObjs);
};

export const renewEdSheetsTransRefs = (session) => {
  let promptSheetDeletion = false;
  session.editableSheets.forEach((sheet) => {
    sheet.transactions = sheet.renewTransactions(session.activeAssignment.transactions);
    if (sheet.transactions.length === 0) {
      sheet.promptDeletion = true;
      promptSheetDeletion = true;
    }
  });
  return promptSheetDeletion;
};
