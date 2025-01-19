import { ControlledWorksheet } from "../../classes/controlled-worksheet";
import { QuasiEventObject } from "../../classes/quasi-event-object";
import { Session } from "../../classes/session";
import { AddressObject } from "../../interfaces/interfaces";
import { colNumToLetter } from "../excel-col-conversion";
import { accessExcelContext, interpretEventAddress, parseChangeEventObjectType } from "../helperFunctions";
import { deleteWorksheetRangeDown, getWorksheetUsedRange, setExcelRangeValue } from "../worksheet";
import { resetToPreviousValues } from "../worksheet-editing/ws-range-editing";
/*global Excel */

export const handleControlledSheetChange = async (
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
      const { sheet, addressObj } = parseControlledSheetChangeEventDetails(session, e, wsName);
      if (!isRangeEdited && !(e instanceof QuasiEventObject)) {
        handleOtherControlledSheetChange(context, e, wsName, sheet, addressObj);
        return;
      }
      isRangeEdited && (await testControlledSheetChangesForRejection(e, sheet, addressObj));
      if (sheet.dataCorrupted) await resetToPreviousValues(wsName, sheet);
      sheet.usedRange = await getWorksheetUsedRange(context, wsName);
      session.options.autoFillOverride = false;
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
};

export const parseControlledSheetChangeEventDetails = (
  session: Session,
  e: Excel.WorksheetChangedEventArgs | QuasiEventObject,
  wsName: string
) => {
  const sheet = session.controlledSheets.find((ws) => ws.name === wsName);
  const addressObj = interpretEventAddress(e);
  return { sheet, addressObj };
};

export const testControlledSheetChangesForRejection = async (
  e: Excel.WorksheetChangedEventArgs | QuasiEventObject,
  sheet: ControlledWorksheet,
  addressObj: AddressObject
) => {
  const wsName = sheet.name;
  const { firstRow, firstCol } = addressObj;
  const eRowNumber = firstRow;
  const eColNumber = firstCol;
  const mapping = sheet.sheetMapping.find(
    (map) =>
      sheet.getCurrentColNumbers(map.colNumbers).includes(eColNumber) &&
      sheet.getCurrentRow(map.rowNumberOrig) === eRowNumber
  );
  const withinProtectedRange = mapping ? true : false;
  if (!withinProtectedRange) sheet.edited = true;
  if (withinProtectedRange && e.triggerSource !== "ThisLocalAddin") {
    const range = `${e.address}:${e.address}`;
    await setExcelRangeValue(wsName, range, e.details.valueBefore);
  }
};

export const handleOtherControlledSheetChange = async (
  context: Excel.RequestContext,
  e: Excel.WorksheetChangedEventArgs,
  wsName: string,
  sheet: ControlledWorksheet,
  addressObj: AddressObject
) => {
  if (e.changeType === "ColumnInserted") {
    await handleColumnInsertion(sheet, addressObj);
  } else if (e.changeType === "ColumnDeleted") {
    await handleColumnDeletion(sheet, addressObj);
  } else if (e.changeType === "RowInserted") {
    await handleRowInsertion(sheet, addressObj);
  } else if (e.changeType === "RowDeleted") {
    await handleRowDeletion(sheet, addressObj);
  } else if (e.changeType === "CellDeleted" && e.changeDirectionState.deleteShiftDirection === "Up") {
    await handleCellDeletionUp(sheet, addressObj);
  } else if (e.changeType === "CellDeleted" && e.changeDirectionState.deleteShiftDirection === "Left") {
    await handleCellDeletionLeft(sheet, addressObj);
  } else if (e.changeType === "CellInserted" && e.changeDirectionState.insertShiftDirection === "Down") {
    handleCellInsertionDown(context, wsName, sheet, addressObj);
  } else if (e.changeType === "CellInserted" && e.changeDirectionState.insertShiftDirection === "Right") {
    handleCellInsertionRight(sheet, addressObj);
  }
};

const handleColumnInsertion = async (sheet: ControlledWorksheet, addressObj: AddressObject) => {
  const { firstCol, lastCol } = addressObj;
  const colsInserted = lastCol - firstCol + 1;
  sheet.mappingObject.columns.forEach((colObj) => {
    if (colObj.current >= firstCol) colObj.current += colsInserted;
  });
  if (sheet.uniqueColumn >= firstCol) sheet.uniqueColumn += colsInserted;
  return;
};

const handleColumnDeletion = async (sheet: ControlledWorksheet, addressObj: AddressObject) => {
  const { firstCol, lastCol } = addressObj;
  const colsDeleted = lastCol - firstCol + 1;
  sheet.mappingObject.columns.forEach((colObj) => {
    if (colObj.current > lastCol) colObj.current -= colsDeleted;
    if (colObj.current >= firstCol && colObj.current <= lastCol) colObj.current = 0;
  });
  if (sheet.uniqueColumn > lastCol) {
    sheet.uniqueColumn -= colsDeleted;
  } else if (sheet.uniqueColumn >= firstCol && sheet.uniqueColumn <= lastCol) {
    sheet.uniqueColumn = 0;
  }
  return;
};

const handleRowInsertion = async (sheet: ControlledWorksheet, addressObj: AddressObject) => {
  const { firstRow, lastRow } = addressObj;
  const rowsInserted = lastRow - firstRow + 1;
  sheet.mappingObject.rows.forEach((rowObj) => {
    if (rowObj.current >= firstRow) rowObj.current += rowsInserted;
  });
};

const handleRowDeletion = async (sheet: ControlledWorksheet, addressObj: AddressObject) => {
  const { firstRow, lastRow } = addressObj;
  const rowsDeleted = lastRow - firstRow + 1;
  sheet.mappingObject.rows.forEach((rowObj) => {
    if (rowObj.current > lastRow) rowObj.current -= rowsDeleted;
    if (rowObj.current >= firstRow && rowObj.current <= lastRow) rowObj.current = 0;
  });
};

const handleCellDeletionUp = async (sheet: ControlledWorksheet, addressObj: AddressObject) => {
  const { firstCol, firstRow, lastCol, lastRow } = addressObj;
  const rowsDeleted = lastRow - firstRow + 1;
  const { protectedFirstCol, protectedLastCol, protectedFirstRow, protectedLastRow } = sheet.getCurrentProtectedRange();
  if (protectedFirstCol >= firstCol && protectedLastCol <= lastCol) {
    sheet.mappingObject.rows.forEach((rowObj) => {
      if (rowObj.current > lastRow) rowObj.current -= rowsDeleted;
      if (rowObj.current >= firstRow && rowObj.current <= lastRow) rowObj.current = 0;
    });
    return;
  } else if (
    (firstCol > protectedFirstCol &&
      firstCol <= protectedLastCol &&
      firstRow <= protectedLastRow &&
      firstRow >= protectedFirstRow) ||
    (lastCol < protectedLastCol &&
      lastCol >= protectedFirstCol &&
      firstRow <= protectedLastRow &&
      firstRow >= protectedFirstRow)
  ) {
    console.log("DATA CORRUPTED!!!!");
    sheet.dataCorrupted = true;
  }
};

const handleCellDeletionLeft = async (sheet: ControlledWorksheet, addressObj: AddressObject) => {
  const { firstCol, firstRow, lastCol, lastRow } = addressObj;
  const colsDeleted = lastCol - firstCol + 1;
  const { protectedFirstCol, protectedLastCol, protectedFirstRow, protectedLastRow } = sheet.getCurrentProtectedRange();
  if (protectedFirstRow >= firstRow && protectedLastRow <= lastRow) {
    sheet.mappingObject.columns.forEach((colObj) => {
      if (colObj.current > lastCol) colObj.current -= colsDeleted;
      if (colObj.current >= firstCol && colObj.current <= lastCol) colObj.current = 0;
    });
    if (sheet.uniqueColumn > lastCol) {
      sheet.uniqueColumn -= colsDeleted;
    } else if (sheet.uniqueColumn >= firstCol && sheet.uniqueColumn <= lastCol) {
      sheet.uniqueColumn = 0;
    }
    return;
  } else if (
    (firstRow > protectedFirstRow &&
      firstRow <= protectedLastRow &&
      firstCol <= protectedLastCol &&
      firstCol >= protectedFirstCol) ||
    (lastRow < protectedLastRow &&
      lastRow >= protectedFirstRow &&
      firstCol <= protectedLastCol &&
      firstCol >= protectedFirstCol)
  ) {
    console.log("DATA CORRUPPTED!!!!");
    sheet.dataCorrupted = true;
  }
};

const handleCellInsertionDown = (
  context: Excel.RequestContext,
  wsName: string,
  sheet: ControlledWorksheet,
  addressObj: AddressObject
) => {
  const { firstCol, firstRow, lastCol, lastRow } = addressObj;
  const { protectedFirstCol, protectedLastCol } = sheet.getCurrentProtectedRange();
  const rowsInserted = lastRow - firstRow + 1;
  if (protectedFirstCol >= firstCol && protectedLastCol <= lastCol) {
    sheet.mappingObject.rows.forEach((rowObj) => {
      if (rowObj.current >= firstRow) rowObj.current += rowsInserted;
    });
    return;
  } else if (firstCol < protectedLastCol || lastCol > protectedFirstCol) {
    if (!sheet.dataCorrupted) {
      const range = `${colNumToLetter(firstCol)}${firstRow}:${colNumToLetter(lastCol)}${lastRow}`;
      deleteWorksheetRangeDown(context, wsName, range);
    }
  }
};

const handleCellInsertionRight = (sheet: ControlledWorksheet, addressObj: AddressObject) => {
  const { firstCol, firstRow, lastCol, lastRow } = addressObj;
  const colsInserted = lastCol - firstCol + 1;
  const { protectedFirstCol, protectedLastCol, protectedFirstRow, protectedLastRow } = sheet.getCurrentProtectedRange();
  if (protectedFirstRow >= firstRow && protectedLastRow <= lastRow) {
    sheet.mappingObject.columns.forEach((colObj) => {
      if (colObj.current >= firstCol) colObj.current += colsInserted;
    });
    if (sheet.uniqueColumn >= firstCol) sheet.uniqueColumn += colsInserted;
    //sheet.editButtonStatus === "hide" && cancelAutoFill(wsName, e.address);
    return;
  } else if (
    (firstRow > protectedFirstRow &&
      firstRow <= protectedLastRow &&
      firstCol <= protectedLastCol &&
      firstCol >= protectedFirstCol) ||
    (lastRow < protectedLastRow &&
      lastRow >= protectedFirstRow &&
      firstCol <= protectedLastCol &&
      firstCol >= protectedFirstCol)
  ) {
    console.log("DATA CORRUPPTED!!!!");
    sheet.dataCorrupted = true;
  }
};

export const handleControlledSheetRowSort = async (session: Session, wsName: string) => {
  const usedRange: any[][] = await accessExcelContext(getWorksheetUsedRange, [wsName]);
  console.log(usedRange);
  const sheet = session.controlledSheets.find((ws) => ws.name === wsName);
  const uniqueCol = sheet.uniqueColumn;
  if (!uniqueCol) return;
  // sheet.sheetMapping.forEach((map) => {
  //   const controlledInput = map.getControlledInput(sheet.controlledInputs);
  //   usedRange.forEach((row, index) => {
  //     if (row[uniqueCol - 1] === controlledInput[sheet.uniqueValue]) {
  //       map.rowNumber = index + 1;
  //     }
  //   });
  // });
};
