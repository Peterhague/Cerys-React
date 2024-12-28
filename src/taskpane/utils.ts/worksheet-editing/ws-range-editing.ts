import { createEditableCell } from "../../classes/editable-cell";
import { colLetterToNum, colNumToLetter } from "../excel-col-conversion";
import {
  checkEditMode,
  convertExcelDate,
  getTransRowNumber,
  getUpdatedTransactions,
  interpretExcelAddress,
  setNextViewButOne,
} from "../helperFunctions";
import { recalculateCharge, updateAssetNarrative } from "../transactions/asset-reg-generation";
import {
  getWorksheetRangeValues,
  highlightRanges,
  setExcelRangeValue,
  setManyWorksheetRangeValues,
} from "../worksheet";
import { handleWorksheetEdit } from "./ws-editing";
/* global Excel */

export const handleRangeEdit = async (context, session, e, sheet, addressObj, definedCol) => {
  session.activeEditableCell = createEditableCell(null, null, null);
  let handledSuccessfully = false;
  const isEditModeEnabled = checkEditMode(sheet);
  const autoFillObj = !session.options.autoFillOverride && checkForAutoFill(e); // returns false if autoFillOverride is true
  if (!autoFillObj.isAutoFill)
    await testChangesForRejection(context, e, sheet, addressObj, definedCol, isEditModeEnabled); // runs even if autoFillObj === false
  if (autoFillObj.isAutoFill) {
    await simulateAutoFillChanges(context, session, sheet, autoFillObj);
  } else {
    handledSuccessfully =
      isEditModeEnabled && (await captureReanalysis(context, session, e, sheet, addressObj, definedCol));
  }
  return handledSuccessfully;
};

export const testChangesForRejection = async (context, e, sheet, addressObj, definedCol, editModeEnabled) => {
  const wsName = sheet.name;
  const { firstRow } = addressObj;
  const eRowNumber = firstRow;
  let withinProtectedRange = false;
  if ((definedCol && !editModeEnabled) || (definedCol && !definedCol.isMutable)) {
    sheet.editableRowRanges.forEach((range) => {
      if (eRowNumber >= range.firstRow && eRowNumber <= range.lastRow) withinProtectedRange = true;
    });
  }
  if (!withinProtectedRange) sheet.edited = true;
  if (withinProtectedRange && e.triggerSource !== "ThisLocalAddin") {
    const range = `${e.address}:${e.address}`;
    await setExcelRangeValue(context, wsName, range, e.details.valueBefore);
  }
};

export const checkForAutoFill = (e) => {
  const autoFillObj = { isAutoFill: false };
  const addressSplit = e.address.split(":");
  if (!addressSplit[1]) return autoFillObj;
  autoFillObj.isAutoFill = true;
  autoFillObj["firstColLetter"] = parseInt(addressSplit[0][1])
    ? addressSplit[0].substr(0, 1)
    : addressSplit[0].substr(0, 2);
  autoFillObj["firstColNumber"] = colLetterToNum(autoFillObj["firstColLetter"]);
  autoFillObj["lastColLetter"] = parseInt(addressSplit[1][1])
    ? addressSplit[1].substr(0, 1)
    : addressSplit[1].substr(0, 2);
  autoFillObj["lastColNumber"] = colLetterToNum(autoFillObj["lastColLetter"]);
  autoFillObj["autoFillCols"] = autoFillObj["firstColLetter"] === autoFillObj["lastColLetter"] ? false : true;
  autoFillObj["firstRow"] = parseInt(addressSplit[0][1])
    ? parseInt(addressSplit[0].substr(1))
    : parseInt(addressSplit[0].substr(2));
  autoFillObj["lastRow"] = parseInt(addressSplit[1][1])
    ? parseInt(addressSplit[1].substr(1))
    : parseInt(addressSplit[1].substr(2));
  autoFillObj["autoFillRows"] = autoFillObj["firstRow"] === autoFillObj["lastRow"] ? false : true;
  let repRange = `${autoFillObj["firstColLetter"]}${autoFillObj["firstRow"]}`;
  autoFillObj["repRange"] = repRange;
  return autoFillObj;
};

export const captureReanalysis = async (context, session, e, sheet, addressObj, definedCol) => {
  const wsName = sheet.name;
  let handledSuccessfully = false;
  const newValue = e.details.valueAfter;
  const { firstRow } = addressObj;
  const eRowNumber = firstRow;
  const tests = { changeRejected: false, isValid: false, isNotNegation: true, updated: false };
  const map = sheet.sheetMapping.find((m) => m.rowNumber === eRowNumber);
  const tran = map.getTran(sheet.transactions);
  const validationObj = validateChange(session, tran, definedCol, e);
  console.log(validationObj);
  const { isNegation } = validationObj;
  tests.isNotNegation = !isNegation;
  const isValidTransactionUpdate = combineAllValidation(definedCol, validationObj);
  console.log(isValidTransactionUpdate);
  const range = `${e.address}:${e.address}`;
  if (isValidTransactionUpdate) {
    processTransactionUpdate(context, session, tran, tests, definedCol, validationObj, e, newValue, sheet);
  } else {
    if (definedCol.isQuasiMutable) {
      tests.isValid = true;
    } else {
      setExcelRangeValue(context, wsName, range, e.details.valueBefore);
      return handledSuccessfully;
    }
  }
  if (tests.changeRejected) {
    setExcelRangeValue(context, wsName, range, e.details.valueBefore);
    return handledSuccessfully;
  }
  if (tests.isValid) {
    processTransUpdateEffects(context, session, sheet, definedCol, range, tests);
    handledSuccessfully = true;
  }
  return handledSuccessfully;
};

export const combineAllValidation = (definedCol, validationObj) => {
  const { isError, isInvalid } = validationObj;
  if (!isError && !isInvalid && !definedCol.isQuasiMutable) {
    return true;
  } else return false;
};

export const processTransactionUpdate = (
  context,
  session,
  tran,
  tests,
  definedCol,
  validationObj,
  e,
  newValue,
  sheet
) => {
  deleteExistingUpdate(tran, tests, definedCol);
  if (!validationObj.isNegation) {
    createNewTransactionUpdate(session, tran, newValue, sheet, definedCol);
    tests.isValid = true;
  }
  if (definedCol.type === "date" && (sheet.type === "IFARPreview" || sheet.type === "TFARPreview"))
    recalculateCharge(context, session, sheet, tran, e);
  if (definedCol.type === "cerysNarrative" && (sheet.type === "IFARPreview" || sheet.type === "TFARPreview"))
    updateAssetNarrative(session, sheet, tran, e);
};

export const processTransUpdateEffects = (context, session, sheet, definedCol, range, tests) => {
  const updatedTrans = getUpdatedTransactions(session);
  sheet.editButtonStatus = updatedTrans.length > 0 ? "inProgress" : "hide";
  const color = tests.isNotNegation ? "lightGreen" : "yellow";
  !definedCol.isQuasiMutable && highlightRanges(context, sheet.name, [range], color);
  if (
    session.currentView === "promptIFARCreation" ||
    session.currentView === "promptTFARCreation" ||
    session.currentView === "propmptIPRCreation"
  )
    setNextViewButOne(session);
  console.log(updatedTrans);
  const view = updatedTrans.length > 0 ? "handleTransUpdates" : session.nextView;
  session.handleView(view);
  if (updatedTrans.length > 0) {
    session.setEditButton("off");
  } else {
    session.setEditButton("hide");
  }
};

export const validateChange = (session, tran, change, e) => {
  const obj = { isNegation: false, isInvalid: false, isError: false };
  if (change.type === "cerysCode") {
    validateCerysCode(session, tran, e, obj);
  } else if (change.type === "date") {
    validateTransactionDate(session, tran, e, obj);
  } else if (change.type === "cerysNarrative") {
    if (e.details.valueAfter === tran.narrative) obj.isNegation = true;
  } else if (change.type === "clientCodeMapping") {
    validateClientCode(session, tran, e, obj);
  } else if (change.type === "cerysName") {
    obj.isError = false;
  } else obj.isError = true;
  console.log(obj);
  return obj;
};

export const validateCerysCode = (session, tran, e, obj) => {
  if (e.details.valueAfter === tran.cerysCode) obj.isNegation = true;
  let inValidCode = true;
  session.chart.forEach((code) => {
    if (code.cerysCode === e.details.valueAfter) inValidCode = false;
  });
  console.log(inValidCode);
  obj.isInvalid = inValidCode;
};

export const validateTransactionDate = (session, tran, e, obj) => {
  if (typeof e.details.valueAfter !== "number") obj.isInvalid = true;
  if (e.details.valueAfter === tran.transactionDateExcel) obj.isNegation = true;
  if (e.details.valueAfter > session.activeAssignment.reportingPeriod.reportingDateExcel) {
    obj.isInvalid = true;
  } else if (
    e.details.valueAfter <=
    session.activeAssignment.reportingPeriod.reportingDateExcel - session.activeAssignment.reportingPeriod.noOfDays
  ) {
    obj.isInvalid = true;
  }
};

export const validateClientCode = (session, tran, e, obj) => {
  const valueAfter = e.details.valueAfter;
  if (valueAfter === tran.defaultClientMapping.clientCode) obj.isNegation = true;
  let inValidCode = true;
  session.clientChart.forEach((code) => {
    if (code.clientCode === e.details.valueAfter) inValidCode = false;
  });
  obj.isInvalid = inValidCode;
};

export const deleteExistingUpdate = (tran, tests, definedCol) => {
  console.log(tran);
  // getUpdatedTransactions(session).forEach((updatedTran) => {
  //   const existingUpdate = updatedTran.updates.find((update) => update.type === definedCol.type);
  //   if (existingUpdate) {
  //     tests.isValid = true;
  //     updatedTran.updates = updatedTran.updates.filter((update) => update.type !== existingUpdate.type);
  //   }
  // });
  const existingUpdate = tran.updates.find((update) => update.type === definedCol.type);
  if (existingUpdate) {
    tests.isValid = true;
    tran.updates = tran.updates.filter((update) => update.type !== existingUpdate.type);
  }
};

export const createNewTransactionUpdate = (session, tran, newValue, sheet, definedCol) => {
  let reversion;
  if (definedCol.type === "date") {
    reversion = tran.transactionDateExcel;
  } else if (definedCol.type === "cerysCode") {
    reversion = tran.cerysCode;
  } else if (definedCol.type === "cerysNarrative") {
    reversion = tran.narrative;
  } else if (definedCol.type === "clientCodeMapping") {
    if (tran.clientMappingOverride) {
      reversion = tran.customClientMapping.clientCode;
    } else {
      reversion = tran.defaultClientMapping.clientCode;
    }
  }
  const update: {
    worksheetName: string;
    worksheetId: string;
    type: string;
    value: string | number;
    reversion: string | number;
    mongoDate: string | null;
    cerysCodeObject?: {} | null;
  } = {
    worksheetName: sheet.name,
    worksheetId: sheet.worksheetId,
    type: definedCol.type,
    value: newValue,
    reversion,
    mongoDate: definedCol.type === "date" ? convertExcelDate(newValue) : null,
    cerysCodeObject: definedCol.type === "cerysCode" ? session.chart.find((code) => code.cerysCode === newValue) : null,
  };
  tran.updates.push(update);
  return update;
};

export const cancelAutoFill = async (wsName, address) => {
  try {
    await Excel.run(async (context) => {
      //Appropriate
      const sheet = context.workbook.worksheets.getItem(wsName);
      const range = sheet.getRange(address);
      range.format.fill.clear();
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
};

export const reverseTransactionUpdates = async (context, session) => {
  const reversals = [];
  const updatedTrans = getUpdatedTransactions(session);
  updatedTrans.forEach((tran) => {
    tran.updates.forEach((update) => {
      const wsName = update.worksheetName;
      const sheet = session.editableSheets.find((ws) => ws.name === wsName);
      sheet.editButtonStatus = "hide";
      const rowNumber = getTransRowNumber(tran, sheet);
      const definedCol = sheet.definedCols.find((col) => col.type === update.type);
      const definedColLetter = colNumToLetter(definedCol.colNumber);
      const address = `${definedColLetter}${rowNumber}:${definedColLetter}${rowNumber}`;
      const reversal = { wsName, address, value: update.reversion };
      reversals.push(reversal);
    });
  });
  await setManyWorksheetRangeValues(context, reversals);
  session.setEditButton("hide");
};

export const simulateAutoFillChanges = async (context, session, sheet, autoFillObj) => {
  const wsName = sheet.name;
  const ranges = [];
  if (autoFillObj.autoFillCols) {
    for (let i = autoFillObj.firstColNumber; i < autoFillObj.lastColNumber + 1; i++) {
      const rangeObj = { colNumber: i, rowNumber: autoFillObj.firstRow };
      ranges.push(rangeObj);
    }
  } else if (autoFillObj.autoFillRows) {
    for (let i = autoFillObj.firstRow; i < autoFillObj.lastRow + 1; i++) {
      const rangeObj = { colNumber: autoFillObj.firstColNumber, rowNumber: i };
      ranges.push(rangeObj);
    }
  }
  ranges.forEach((range) => {
    if (sheet.usedRange.length < range.rowNumber || sheet.usedRange[0].length < range.colNumber) {
      range.valueBefore = "";
    } else {
      range.valueBefore = sheet.usedRange[range.rowNumber - 1][range.colNumber - 1];
    }
  });
  for (let i = 0; i < ranges.length; i++) {
    const valueAfterRange = `${colNumToLetter(ranges[i].colNumber)}${ranges[i].rowNumber}`;
    const valueAfter = await getWorksheetRangeValues(context, wsName, valueAfterRange);
    const event = {
      address: `${colNumToLetter(ranges[i].colNumber)}${ranges[i].rowNumber}`,
      details: { valueBefore: ranges[i].valueBefore, valueAfter: valueAfter[0][0] },
      changeType: "RangeEdited",
    };
    await handleWorksheetEdit(session, event, wsName);
  }
};

export const resetToPreviousValues = async (wsName, sheet) => {
  try {
    await Excel.run(async (context) => {
      //Appropriate
      const ws = context.workbook.worksheets.getItem(wsName);
      const usedRange = ws.getUsedRange();
      usedRange.load("address");
      await context.sync();
      const fullAddress = usedRange.address;
      const fullAddressSplit = fullAddress.split("!");
      const addressObj = interpretExcelAddress(fullAddressSplit[1]);
      const blankValues = [];
      for (let rows = 0; rows < addressObj.lastRow - addressObj.firstRow + 1; rows++) {
        const row = [];
        for (let cols = 0; cols < addressObj.lastCol - addressObj.firstCol + 1; cols++) {
          row.push("");
        }
        blankValues.push(row);
      }
      usedRange.values = blankValues;
      const newRange = `A1:${colNumToLetter(sheet.usedRange[0].length)}${sheet.usedRange.length}`;
      const wsNewRange = ws.getRange(newRange);
      wsNewRange.values = sheet.usedRange;
      sheet.dataCorrupted = false;
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
};

export const reinstateNumberFormats = async (sheet) => {
  try {
    await Excel.run(async (context) => {
      //Appropriate
      const ws = context.workbook.worksheets.getItem(sheet.name);
      sheet.definedCols.forEach((col) => {
        const colLetter = colNumToLetter(col.colNumber);
        const range = ws.getRange(`${colLetter}:${colLetter}`);
        range.numberFormat = col.format;
      });
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
};

export const completeCerysCodeUpdate = async (context, session, e, sheet, addressObj) => {
  const { firstRow } = addressObj;
  let cerysNameCol = 0;
  sheet.definedCols.forEach((col) => {
    if (col.type === "cerysName") {
      cerysNameCol = col.colNumber;
    }
  });
  if (cerysNameCol > 0) {
    const nomCodeObj = session.chart.find((code) => code.cerysCode === e.details.valueAfter);
    const colLetter = colNumToLetter(cerysNameCol);
    const range = `${colLetter}${firstRow}:${colLetter}${firstRow}`;
    setExcelRangeValue(context, sheet.name, range, nomCodeObj.cerysShortName);
  }
};

export const completeCerysNameUpdate = async (context, session, e, sheet, addressObj) => {
  const { firstRow } = addressObj;
  let clientCodeMappingCol = 0;
  let clientCodeNameMappingCol = 0;
  sheet.definedCols.forEach((col) => {
    if (col.type === "clientCodeMapping") {
      clientCodeMappingCol = col.colNumber;
    }
    if (col.type === "clientCodeNameMapping") {
      clientCodeNameMappingCol = col.colNumber;
    }
  });
  if (clientCodeMappingCol > 0) {
    const nomCodeObj = session.chart.find((code) => code.cerysShortName === e.details.valueAfter);
    const colLetter = colNumToLetter(clientCodeMappingCol);
    const range = `${colLetter}${firstRow}:${colLetter}${firstRow}`;
    session.options.allowEffects = 1;
    setExcelRangeValue(context, sheet.name, range, nomCodeObj.currentClientMapping.clientCode);
    if (clientCodeNameMappingCol > 0) {
      const colLetter = colNumToLetter(clientCodeNameMappingCol);
      const range = `${colLetter}${firstRow}:${colLetter}${firstRow}`;
      setExcelRangeValue(context, sheet.name, range, nomCodeObj.currentClientMapping.clientCodeName);
    }
  }
};

export const completeClientCodeMappingUpdate = async (context, session, e, sheet, addressObj) => {
  const { firstRow } = addressObj;
  let clientCodeNameMappingCol = 0;
  sheet.definedCols.forEach((col) => {
    if (col.type === "clientCodeNameMapping") {
      clientCodeNameMappingCol = col.colNumber;
    }
  });
  if (clientCodeNameMappingCol > 0) {
    const nomCodeObj = session.clientChart.find((code) => code.clientCode === e.details.valueAfter);
    const colLetter = colNumToLetter(clientCodeNameMappingCol);
    const range = `${colLetter}${firstRow}:${colLetter}${firstRow}`;
    setExcelRangeValue(context, sheet.name, range, nomCodeObj.clientCodeName);
  }
};
