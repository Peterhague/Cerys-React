import { createEditableCell } from "../../classes/editable-cell";
import {
  getDefinedCol,
  getExcelContext,
  interpretEventAddress,
  interpretExcelAddress,
  simulateEditButtonClick,
} from ".././helperFunctions";
import { getWorksheetUsedRange, setExcelRangeValue, setManyExcelRangeValues } from ".././worksheet";
import { colNumToLetter } from "../excel-col-conversion";
import { handleOtherChange } from "./ws-col-row-manipulation";
import {
  completeCerysCodeUpdate,
  completeCerysNameUpdate,
  completeClientCodeMappingUpdate,
  handleEdSheetCallback,
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
  if (session.options.allowEffects > 0) {
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
  handleEdSheetCallback(session, definedCol);
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

export const updateEdSheetTransValues = async (session, sheet, affectedTransactions) => {
  console.log(sheet);
  console.log(affectedTransactions);
  const updates = [];
  sheet.transactions.forEach((sheetTran) => {
    affectedTransactions.forEach((affectedTran) => {
      if (sheetTran._id === affectedTran._id) {
        affectedTran.updates.forEach((updatedItem) => {
          sheet.definedCols.forEach((definedCol) => {
            const col = colNumToLetter(definedCol.colNumber);
            const row = sheetTran.rowNumber;
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
  setManyExcelRangeValues(sheet.name, updates);
};
