import { ControlledWorksheet } from "../../classes/controlled-worksheet";
import { DefinedCol } from "../../classes/defined-col";
import { createEditableCell } from "../../classes/editable-cell";
import { EditableWorksheet } from "../../classes/editable-worksheet";
import { QuasiEventObject } from "../../classes/quasi-event-object";
import { Session } from "../../classes/session";
import { Transaction } from "../../classes/transaction";
import { TransactionUpdate } from "../../classes/transaction-update";
import {
  AddressObject,
  AutoFillObject,
  FATransaction,
  TranUpdateFinalValidation,
  TranUpdatePrimaryValidation,
} from "../../interfaces/interfaces";
import { colNumToLetter } from "../excel-col-conversion";
import {
  checkEditMode,
  convertExcelDate,
  getTransRowNumber,
  getUpdatedTransactions,
  interpretExcelAddress,
  setNextViewButOne,
} from "../helper-functions";
import { recalculateCharge, updateAssetNarrative } from "../transactions/asset-reg-generation";
import {
  getWorksheetRangeValues,
  getWorksheetUsedRange,
  highlightRanges,
  setExcelRangeValue,
  setManyWorksheetRangeValues,
} from "../worksheet";
import { handleEditableSheetChange } from "./ed-sheet-change-handling";
/* global Excel */

export const handleEdSheetRangeEdit = async (
  context: Excel.RequestContext,
  session: Session,
  e: Excel.WorksheetChangedEventArgs | QuasiEventObject,
  sheet: EditableWorksheet,
  addressObj: AddressObject,
  definedCol: DefinedCol
) => {
  session.activeEditableCell = createEditableCell(null, null, null);
  let handledSuccessfully = false;
  const isEditModeEnabled = checkEditMode(sheet);
  const autoFillObj: AutoFillObject = !session.options.autoFillOverride && checkForAutoFill(e); // returns false if autoFillOverride is true
  if (!autoFillObj.isAutoFill)
    await testEdSheetChangesForRejection(e, sheet, addressObj, definedCol, isEditModeEnabled); // runs even if autoFillObj === false
  if (autoFillObj.isAutoFill) {
    await simulateAutoFillChanges(context, session, sheet, autoFillObj);
  } else {
    handledSuccessfully =
      isEditModeEnabled && (await captureReanalysis(context, session, e, sheet, addressObj, definedCol));
  }
  return handledSuccessfully;
};

export const testEdSheetChangesForRejection = async (
  e: Excel.WorksheetChangedEventArgs | QuasiEventObject,
  sheet: EditableWorksheet,
  addressObj: AddressObject,
  definedCol: DefinedCol,
  editModeEnabled: boolean
) => {
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
    await setExcelRangeValue(wsName, range, e.details.valueBefore);
  }
};

export const checkForAutoFill = (e: Excel.WorksheetChangedEventArgs | QuasiEventObject) => {
  const addressObj: AddressObject = interpretExcelAddress(e.address);
  const { firstRow, firstCol, lastRow, lastCol } = addressObj;
  const isAutoFill = firstRow !== lastRow || firstCol !== lastCol ? true : false;
  const firstColLetter = colNumToLetter(firstCol);
  const lastColLetter = colNumToLetter(lastCol);
  const autoFillCols = firstCol === lastCol ? false : true;
  const autoFillRows = firstRow === lastRow ? false : true;
  const repRange = `${firstColLetter}${firstRow}`;
  const autoFillObj: AutoFillObject = {
    isAutoFill,
    firstCol,
    firstColLetter,
    lastCol,
    lastColLetter,
    autoFillCols,
    firstRow,
    lastRow,
    autoFillRows,
    repRange,
  };
  return autoFillObj;
};

export const captureReanalysis = async (
  context: Excel.RequestContext,
  session: Session,
  e: Excel.WorksheetChangedEventArgs | QuasiEventObject,
  sheet: EditableWorksheet,
  addressObj: AddressObject,
  definedCol: DefinedCol
) => {
  const wsName = sheet.name;
  let handledSuccessfully = false;
  const newValue = e.details.valueAfter;
  const { firstRow } = addressObj;
  const eRowNumber = firstRow;
  const tests: TranUpdatePrimaryValidation = {
    changeRejected: false,
    isValid: false,
    isNotNegation: true,
    updated: false,
  };
  const map = sheet.sheetMapping.find((m) => sheet.getCurrentRow(m.rowNumberOrig) === eRowNumber);
  const tran = map.getTran(sheet.transactions);
  const validationObj: TranUpdateFinalValidation = validateChange(session, tran, definedCol, e);
  const { isNegation } = validationObj;
  tests.isNotNegation = !isNegation;
  const isValidTransactionUpdate: boolean = combineAllValidation(definedCol, validationObj);
  const range = `${e.address}:${e.address}`;
  if (isValidTransactionUpdate) {
    processTransactionUpdate(session, tran, tests, definedCol, validationObj, e, newValue, sheet);
  } else {
    if (definedCol.isQuasiMutable) {
      tests.isValid = true;
    } else {
      await setExcelRangeValue(wsName, range, e.details.valueBefore);
      return handledSuccessfully;
    }
  }
  if (tests.changeRejected) {
    await setExcelRangeValue(wsName, range, e.details.valueBefore);
    return handledSuccessfully;
  }
  if (tests.isValid) {
    processTransUpdateEffects(context, session, sheet, definedCol, range, tests);
    handledSuccessfully = true;
  }
  return handledSuccessfully;
};

export const combineAllValidation = (definedCol: DefinedCol, validationObj: TranUpdateFinalValidation) => {
  const { isError, isInvalid } = validationObj;
  if (!isError && !isInvalid && !definedCol.isQuasiMutable) {
    return true;
  } else return false;
};

export const processTransactionUpdate = (
  session: Session,
  tran: Transaction | FATransaction,
  tests: TranUpdatePrimaryValidation,
  definedCol: DefinedCol,
  validationObj: TranUpdateFinalValidation,
  e: Excel.WorksheetChangedEventArgs | QuasiEventObject,
  newValue: string | number,
  sheet: EditableWorksheet
) => {
  deleteExistingUpdate(tran, tests, definedCol);
  if (!validationObj.isNegation) {
    createNewTransactionUpdate(session, tran, newValue, sheet, definedCol);
    tests.isValid = true;
  }
  if (
    definedCol.type === "date" &&
    (sheet.type === "IFARPreview" || sheet.type === "TFARPreview") &&
    "depnRate" in tran
  )
    recalculateCharge(session, sheet, tran, e);
  if (definedCol.type === "cerysNarrative" && (sheet.type === "IFARPreview" || sheet.type === "TFARPreview"))
    updateAssetNarrative(session, sheet, tran, e);
};

export const processTransUpdateEffects = (
  context: Excel.RequestContext,
  session: Session,
  sheet: EditableWorksheet,
  definedCol: DefinedCol,
  range: string,
  tests: TranUpdatePrimaryValidation
) => {
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
  const view = updatedTrans.length > 0 ? "handleTransUpdates" : session.nextView;
  session.handleView(view);
  if (updatedTrans.length > 0) {
    session.setEditButton("off");
  } else {
    session.setEditButton("hide");
  }
};

export const validateChange = (
  session: Session,
  tran: Transaction,
  definedCol: DefinedCol,
  e: Excel.WorksheetChangedEventArgs | QuasiEventObject
) => {
  const finalValidationObj: TranUpdateFinalValidation = { isNegation: false, isInvalid: false, isError: false };
  if (definedCol.type === "cerysCode") {
    validateCerysCode(session, tran, e, finalValidationObj);
  } else if (definedCol.type === "date") {
    validateTransactionDate(session, tran, e, finalValidationObj);
  } else if (definedCol.type === "cerysNarrative") {
    if (e.details.valueAfter === tran.narrative) finalValidationObj.isNegation = true;
  } else if (definedCol.type === "clientCodeMapping") {
    validateClientCode(session, tran, e, finalValidationObj);
  } else if (definedCol.type === "cerysName") {
    finalValidationObj.isError = false;
  } else finalValidationObj.isError = true;
  return finalValidationObj;
};

export const validateCerysCode = (
  session: Session,
  tran: Transaction,
  e: Excel.WorksheetChangedEventArgs | QuasiEventObject,
  finalValidationObj: TranUpdateFinalValidation
) => {
  if (e.details.valueAfter === tran.cerysCode) finalValidationObj.isNegation = true;
  let inValidCode = true;
  session.chart.forEach((code) => {
    if (code.cerysCode === e.details.valueAfter) inValidCode = false;
  });
  finalValidationObj.isInvalid = inValidCode;
};

export const validateTransactionDate = (
  session: Session,
  tran: Transaction,
  e: Excel.WorksheetChangedEventArgs | QuasiEventObject,
  finalValidationObj: TranUpdateFinalValidation
) => {
  if (typeof e.details.valueAfter !== "number") finalValidationObj.isInvalid = true;
  if (e.details.valueAfter === tran.transactionDateExcel) finalValidationObj.isNegation = true;
  if (e.details.valueAfter > session.assignment.reportingPeriod.reportingDateExcel) {
    finalValidationObj.isInvalid = true;
  } else if (
    e.details.valueAfter <=
    session.assignment.reportingPeriod.reportingDateExcel - session.assignment.reportingPeriod.noOfDays
  ) {
    finalValidationObj.isInvalid = true;
  }
};

export const validateClientCode = (
  session: Session,
  tran: Transaction,
  e: Excel.WorksheetChangedEventArgs | QuasiEventObject,
  finalValidationObj: TranUpdateFinalValidation
) => {
  const valueAfter = e.details.valueAfter;
  if (valueAfter === tran.getClientMappingObj(session).clientCode) finalValidationObj.isNegation = true;
  let inValidCode = true;
  session.clientChart.forEach((code) => {
    if (code.clientCode === e.details.valueAfter) inValidCode = false;
  });
  finalValidationObj.isInvalid = inValidCode;
};

export const deleteExistingUpdate = (
  tran: Transaction,
  primaryValidationObj: TranUpdatePrimaryValidation,
  definedCol: DefinedCol
) => {
  const existingUpdate = tran.updates.find((update) => update.type === definedCol.type);
  if (existingUpdate) {
    primaryValidationObj.isValid = true;
    tran.updates = tran.updates.filter((update) => update.type !== existingUpdate.type);
  }
};

export const createNewTransactionUpdate = (
  session: Session,
  tran: Transaction,
  newValue: string | number,
  sheet: EditableWorksheet,
  definedCol: DefinedCol
) => {
  let reversion;
  if (definedCol.type === "date") {
    reversion = tran.transactionDateExcel;
  } else if (definedCol.type === "cerysCode") {
    reversion = tran.cerysCode;
  } else if (definedCol.type === "cerysNarrative") {
    reversion = tran.narrative;
  } else if (definedCol.type === "clientCodeMapping") {
    reversion = tran.getClientMappingObj(session).clientCode;
  }
  const mongoDate = definedCol.type === "date" ? convertExcelDate(newValue) : null;
  const update = new TransactionUpdate(
    session,
    sheet.name,
    sheet.worksheetId,
    definedCol.type,
    newValue,
    reversion,
    mongoDate
  );
  tran.updates.push(update);
  return update;
};

export const cancelAutoFill = async (wsName: string, address: string) => {
  try {
    await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getItem(wsName);
      const range = sheet.getRange(address);
      range.format.fill.clear();
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
};

export const reverseTransactionUpdates = async (context: Excel.RequestContext, session: Session) => {
  const reversals = [];
  const updatedTrans = getUpdatedTransactions(session);
  updatedTrans.forEach((tran) => {
    tran.updates.forEach((update) => {
      const wsName = update.worksheetName;
      const sheet = session.editableSheets.find((ws) => ws.name === wsName);
      sheet.editButtonStatus = "hide";
      const rowNumber = getTransRowNumber(tran, sheet);
      const definedCol = sheet.definedCols.find((col) => col.type === update.type);
      const definedColLetter = colNumToLetter(sheet.getCurrentColumn(definedCol.colNumberOrig));
      const address = `${definedColLetter}${rowNumber}:${definedColLetter}${rowNumber}`;
      const reversal = { wsName, address, value: update.reversion };
      reversals.push(reversal);
    });
  });
  await setManyWorksheetRangeValues(context, reversals);
  session.setEditButton("hide");
};

export const simulateAutoFillChanges = async (
  context: Excel.RequestContext,
  session: Session,
  sheet: EditableWorksheet,
  autoFillObj: AutoFillObject
) => {
  const wsName = sheet.name;
  const ranges = [];
  if (autoFillObj.autoFillCols) {
    for (let i = autoFillObj.firstCol; i < autoFillObj.lastCol + 1; i++) {
      const rangeObj = { colNumber: i, rowNumber: autoFillObj.firstRow };
      ranges.push(rangeObj);
    }
  } else if (autoFillObj.autoFillRows) {
    for (let i = autoFillObj.firstRow; i < autoFillObj.lastRow + 1; i++) {
      const rangeObj = { colNumber: autoFillObj.firstCol, rowNumber: i };
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
    const event = new QuasiEventObject({
      address: `${colNumToLetter(ranges[i].colNumber)}${ranges[i].rowNumber}`,
      details: { valueBefore: ranges[i].valueBefore, valueAfter: valueAfter[0][0] },
      changeType: "RangeEdited",
      triggerSource: "",
    });
    await handleEditableSheetChange(session, event, wsName);
  }
};

export const resetToPreviousValues = async (wsName: string, sheet: EditableWorksheet | ControlledWorksheet) => {
  try {
    await Excel.run(async (context) => {
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
      const wsNewRange: Excel.Range = ws.getRange(newRange);
      wsNewRange.values = sheet.usedRange;
      sheet.dataCorrupted = false;
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
};

export const reinstateNumberFormats = async (sheet: EditableWorksheet) => {
  try {
    await Excel.run(async (context) => {
      const ws = context.workbook.worksheets.getItem(sheet.name);
      sheet.definedCols.forEach((col) => {
        const colLetter = colNumToLetter(sheet.getCurrentColumn(col.colNumberOrig));
        const range = ws.getRange(`${colLetter}:${colLetter}`);
        range.numberFormat = col.format;
      });
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
};

export const completeCerysCodeUpdate = async (
  session: Session,
  e: Excel.WorksheetChangedEventArgs | QuasiEventObject,
  sheet: EditableWorksheet,
  addressObj: AddressObject
) => {
  const { firstRow } = addressObj;
  let cerysNameCol = 0;
  sheet.definedCols.forEach((col) => {
    if (col.type === "cerysName") {
      cerysNameCol = sheet.getCurrentColumn(col.colNumberOrig);
    }
  });
  if (cerysNameCol > 0) {
    const nomCodeObj = session.chart.find((code) => code.cerysCode === e.details.valueAfter);
    const colLetter = colNumToLetter(cerysNameCol);
    const range = `${colLetter}${firstRow}:${colLetter}${firstRow}`;
    await setExcelRangeValue(sheet.name, range, nomCodeObj.cerysShortName);
  }
};

export const completeCerysNameUpdate = async (
  context: Excel.RequestContext,
  session: Session,
  e: Excel.WorksheetChangedEventArgs | QuasiEventObject,
  sheet: EditableWorksheet,
  addressObj: AddressObject
) => {
  const { firstRow } = addressObj;
  let clientCodeMappingCol = 0;
  let clientCodeNameMappingCol = 0;
  sheet.definedCols.forEach((col) => {
    if (col.type === "clientCodeMapping") {
      clientCodeMappingCol = sheet.getCurrentColumn(col.colNumberOrig);
    }
    if (col.type === "clientCodeNameMapping") {
      clientCodeNameMappingCol = sheet.getCurrentColumn(col.colNumberOrig);
    }
  });
  if (clientCodeMappingCol > 0) {
    const nomCodeObj = session.chart.find((code) => code.cerysShortName === e.details.valueAfter);
    const colLetter = colNumToLetter(clientCodeMappingCol);
    const range = `${colLetter}${firstRow}:${colLetter}${firstRow}`;
    session.options.allowEffects = 1;
    await setExcelRangeValue(sheet.name, range, nomCodeObj.currentClientMapping.clientCode);
    sheet.usedRange = await getWorksheetUsedRange(context, sheet.name);
    if (clientCodeNameMappingCol > 0) {
      const colLetter = colNumToLetter(clientCodeNameMappingCol);
      const range = `${colLetter}${firstRow}:${colLetter}${firstRow}`;
      await setExcelRangeValue(sheet.name, range, nomCodeObj.currentClientMapping.clientCodeName);
    }
  }
};

export const completeClientCodeMappingUpdate = async (
  session: Session,
  e: Excel.WorksheetChangedEventArgs | QuasiEventObject,
  sheet: EditableWorksheet,
  addressObj: AddressObject
) => {
  const { firstRow } = addressObj;
  let clientCodeNameMappingCol = 0;
  sheet.definedCols.forEach((col) => {
    if (col.type === "clientCodeNameMapping") {
      clientCodeNameMappingCol = sheet.getCurrentColumn(col.colNumberOrig);
    }
  });
  if (clientCodeNameMappingCol > 0) {
    const nomCodeObj = session.clientChart.find((code) => code.clientCode === e.details.valueAfter);
    const colLetter = colNumToLetter(clientCodeNameMappingCol);
    const range = `${colLetter}${firstRow}:${colLetter}${firstRow}`;
    await setExcelRangeValue(sheet.name, range, nomCodeObj.clientCodeName);
  }
};
