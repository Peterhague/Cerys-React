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
  console.log(e);
  if (session.options.allowEffects > 0) {
    console.log(session.options.allowEffects);
    session.options.allowEffects -= 1;
    return;
  }
  const isRangeEdited = parseChangeEventObjectType(e);
  const { sheet, addressObj, definedCol } = parseChangeEventDetails(session, e, wsName);
  if (!isRangeEdited) {
    handleOtherChange(session, e, wsName, sheet, addressObj);
    return;
  }
  const handledSuccessfully = isRangeEdited && (await handleRangeEdit(session, e, sheet, addressObj, definedCol));
  await handleSheetDataCorruption(session, wsName, sheet);
  const usedRange = await getWorksheetUsedRange(wsName);
  sheet.usedRange = usedRange;
  session.options.autoFillOverride = false;
  if (handledSuccessfully && definedCol.type === "cerysCode") {
    await completeCerysCodeUpdate(session, e, sheet, addressObj);
  } else if (handledSuccessfully && definedCol.type === "cerysName") {
    await completeCerysNameUpdate(session, e, sheet, addressObj);
  } else if (handledSuccessfully && definedCol.type === "clientCodeMapping") {
    await completeClientCodeMappingUpdate(session, e, sheet, addressObj);
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
  console.log("client code mapping");
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
  console.log(session.options.allowEffects);
  setManyExcelRangeValues(sheet.name, updates);
};

// operates on only the editable sheets that didn't call the change
//export const updateEdSheetsTransValues = async (session, updatedTrans) => {
//  console.log(updatedTrans);
//  const sheetUpdateObjects = [];
//  const deletionObjs = [];
//  session.editableSheets.forEach((edSheet) => {
//    console.log("here");
//    const sheetUpdateObj = { wsName: edSheet.name, updates: [] };
//    console.log("here");
//    edSheet.transactions.forEach((edShtTran) => {
//      console.log("here");
//      updatedTrans.forEach((updatedTran) => {
//        console.log("here");
//        if (edShtTran._id === updatedTran._id) {
//          console.log("here");
//          const map = edSheet.sheetMapping.find((map) => map.transactionId === edShtTran._id);
//          if (edShtTran[edSheet.filterObj.target] !== edSheet.filterObj.value) {
//            console.log("here");
//            deletionObjs.push(createDeletionObject(edShtTran, edSheet));
//            console.log("here");
//          } else {
//            updatedTran.updates.forEach((update) => {
//              console.log("here");
//              if (update.worksheetId !== edSheet.worksheetId) {
//                const definedCol = edSheet.definedCols.find((col) => col.type === update.type);
//                console.log("here");
//                const col = colNumToLetter(definedCol.colNumber);
//                console.log("here");
//                const row = map.rowNumber;
//                const sheetUpdate: { address: string; value?: string | number } = {
//                  address: `${col}${row}:${col}${row}`,
//                  value: update.value,
//                };
//                console.log("here");
//                sheetUpdateObj.updates.push(sheetUpdate);
//              }
//            });
//          }
//        }
//      });
//    });
//    sheetUpdateObj.updates.length > 0 && sheetUpdateObjects.push(sheetUpdateObj);
//    console.log("here");
//  });
//  sheetUpdateObjects.forEach((obj) => {
//    setManyExcelRangeValues(obj.wsName, obj.updates);
//    console.log("here");
//  });
//  if (deletionObjs.length > 0) await deleteWorksheetRangesUp(deletionObjs);
//  console.log("here");
//};

// operates on only the editable sheets that didn't call the change
export const updateEdSheetsTransValues = async (session) => {
  const sheetUpdateObjects = [];
  const deletionObjs = [];
  session.editableSheets.forEach((edSheet) => {
    const sheetUpdateObj = { wsName: edSheet.name, updates: [] };
    edSheet.transactions.forEach((edShtTran) => {
      const map = edSheet.sheetMapping.find((map) => map.transactionId === edShtTran._id);
      if (edShtTran[edSheet.filterObj.target] !== edSheet.filterObj.value) {
        deletionObjs.push(createDeletionObject(edShtTran, edSheet));
      } else {
        edShtTran.updates.forEach((update) => {
          if (update.worksheetId !== edSheet.worksheetId) {
            const definedCol = edSheet.definedCols.find((col) => col.type === update.type);
            const col = colNumToLetter(definedCol.colNumber);
            const row = map.rowNumber;
            const sheetUpdate: { address: string; value?: string | number } = {
              address: `${col}${row}:${col}${row}`,
              value: update.value,
            };
            sheetUpdateObj.updates.push(sheetUpdate);
          }
        });
      }
    });
    sheetUpdateObj.updates.length > 0 && sheetUpdateObjects.push(sheetUpdateObj);
  });
  sheetUpdateObjects.forEach((obj) => {
    setManyExcelRangeValues(obj.wsName, obj.updates);
  });
  if (deletionObjs.length > 0) await deleteWorksheetRangesUp(deletionObjs);
};

export const renewEdSheetsTransRefs = (session) => {
  let promptSheetDeletion = false;
  console.log("here");
  session.editableSheets.forEach((sheet) => {
    console.log("here");
    sheet.transactions = sheet.renewTransactions(session.activeAssignment.transactions);
    console.log("here");
    console.log(sheet.transactions);
    if (sheet.transactions.length === 0) {
      console.log("here");
      sheet.promptDeletion = true;
      promptSheetDeletion = true;
    }
  });
  console.log("here");
  console.log(promptSheetDeletion);
  return promptSheetDeletion;
};
