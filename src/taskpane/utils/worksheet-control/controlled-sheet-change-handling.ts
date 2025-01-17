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
  console.log(eRowNumber);
  console.log(eColNumber);
  const mapping = sheet.sheetMapping.find((map) => map.colNumber === eColNumber && map.rowNumber === eRowNumber);
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
  if (firstCol <= sheet.protectedRange.firstCol) {
    sheet.protectedRange.firstCol += colsInserted;
    sheet.protectedRange.lastCol += colsInserted;
  } else if (firstCol <= sheet.protectedRange.lastCol) {
    sheet.protectedRange.lastCol += colsInserted;
  }
  sheet.controlledCols.forEach((col) => {
    if (col.colNumber >= firstCol) col.colNumber += colsInserted;
  });
  sheet.sheetMapping.forEach((map) => {
    if (map.colNumber >= firstCol) map.colNumber += colsInserted;
  });
  return;
};

const handleColumnDeletion = async (sheet: ControlledWorksheet, addressObj: AddressObject) => {
  const { firstCol, lastCol } = addressObj;
  const colsDeleted = lastCol - firstCol + 1;
  if (lastCol < sheet.protectedRange.firstCol) {
    sheet.protectedRange.firstCol -= colsDeleted;
    sheet.protectedRange.lastCol -= colsDeleted;
  } else if (
    firstCol <= sheet.protectedRange.firstCol &&
    lastCol >= sheet.protectedRange.firstCol &&
    lastCol < sheet.protectedRange.lastCol
  ) {
    sheet.protectedRange.firstCol -= lastCol - sheet.protectedRange.firstCol;
    sheet.protectedRange.lastCol -= colsDeleted;
  } else if (firstCol > sheet.protectedRange.firstCol && lastCol < sheet.protectedRange.lastCol) {
    sheet.protectedRange.lastCol -= colsDeleted;
  } else if (
    firstCol > sheet.protectedRange.firstCol &&
    firstCol <= sheet.protectedRange.lastCol &&
    lastCol >= sheet.protectedRange.lastCol
  ) {
    sheet.protectedRange.lastCol -= sheet.protectedRange.lastCol - (firstCol - 1);
  } else if (firstCol <= sheet.protectedRange.firstCol && lastCol >= sheet.protectedRange.lastCol) {
    sheet.protectedRangeDeleted = true;
  }
  sheet.controlledCols.forEach((col) => {
    if (col.colNumber > lastCol) {
      col.colNumber -= colsDeleted;
    } else if (col.colNumber >= firstCol && col.colNumber <= lastCol) {
      sheet.controlledCols = sheet.controlledCols.filter((i) => i !== col);
    }
  });
  sheet.sheetMapping.forEach((map) => {
    if (map.colNumber > lastCol) {
      map.colNumber -= colsDeleted;
    } else if (map.colNumber >= firstCol && map.colNumber <= lastCol) {
      sheet.sheetMapping = sheet.sheetMapping.filter((i) => i !== map);
    }
  });
  return;
};

const handleRowInsertion = async (sheet: ControlledWorksheet, addressObj: AddressObject) => {
  const { firstRow, lastRow } = addressObj;
  const rowsInserted = lastRow - firstRow + 1;
  if (firstRow <= sheet.protectedRange.firstRow) {
    sheet.protectedRange.firstRow += rowsInserted;
    sheet.protectedRange.lastRow += rowsInserted;
  } else if (firstRow <= sheet.protectedRange.lastRow) {
    sheet.protectedRange.lastRow += rowsInserted;
  }
  //sheet.editButtonStatus === "hide" && cancelAutoFill(wsName, e.address);
  sheet.sheetMapping.forEach((map) => {
    if (map.rowNumber >= firstRow) map.rowNumber += rowsInserted;
  });
};

const handleRowDeletion = async (sheet: ControlledWorksheet, addressObj: AddressObject) => {
  const { firstRow, lastRow } = addressObj;
  const rowsDeleted = lastRow - firstRow + 1;
  if (lastRow < sheet.protectedRange.firstRow) {
    sheet.protectedRange.firstRow -= rowsDeleted;
    sheet.protectedRange.lastRow -= rowsDeleted;
  } else if (
    firstRow <= sheet.protectedRange.firstRow &&
    lastRow >= sheet.protectedRange.firstRow &&
    lastRow < sheet.protectedRange.lastRow
  ) {
    sheet.protectedRange.firstRow -= lastRow - sheet.protectedRange.firstRow;
    sheet.protectedRange.lastRow -= rowsDeleted;
  } else if (firstRow > sheet.protectedRange.firstRow && lastRow < sheet.protectedRange.lastRow) {
    sheet.protectedRange.lastRow -= rowsDeleted;
  } else if (
    firstRow > sheet.protectedRange.firstRow &&
    firstRow <= sheet.protectedRange.lastRow &&
    lastRow >= sheet.protectedRange.lastRow
  ) {
    sheet.protectedRange.lastRow -= sheet.protectedRange.lastRow - (firstRow - 1);
  } else if (firstRow <= sheet.protectedRange.firstRow && lastRow >= sheet.protectedRange.lastRow) {
    sheet.protectedRangeDeleted = true;
  }
  sheet.sheetMapping.forEach((map) => {
    if (map.rowNumber > lastRow) {
      map.rowNumber -= rowsDeleted;
    } else if (map.rowNumber >= firstRow && map.rowNumber <= lastRow) {
      sheet.sheetMapping = sheet.sheetMapping.filter((i) => i !== map);
    }
  });
};

const handleCellDeletionUp = async (sheet: ControlledWorksheet, addressObj: AddressObject) => {
  const { firstCol, firstRow, lastCol, lastRow } = addressObj;
  const rowsDeleted = lastRow - firstRow + 1;
  if (sheet.protectedRange.firstCol >= firstCol && sheet.protectedRange.lastCol <= lastCol) {
    if (lastRow < sheet.protectedRange.firstRow) {
      sheet.protectedRange.firstRow -= rowsDeleted;
      sheet.protectedRange.lastRow -= rowsDeleted;
    } else if (
      firstRow <= sheet.protectedRange.firstRow &&
      lastRow >= sheet.protectedRange.firstRow &&
      lastRow < sheet.protectedRange.lastRow
    ) {
      sheet.protectedRange.firstRow -= lastRow - sheet.protectedRange.firstRow;
      sheet.protectedRange.lastRow -= rowsDeleted;
    } else if (firstRow > sheet.protectedRange.firstRow && lastRow < sheet.protectedRange.lastRow) {
      sheet.protectedRange.lastRow -= rowsDeleted;
    } else if (
      firstRow > sheet.protectedRange.firstRow &&
      firstRow <= sheet.protectedRange.lastRow &&
      lastRow >= sheet.protectedRange.lastRow
    ) {
      sheet.protectedRange.lastRow -= sheet.protectedRange.lastRow - (firstRow - 1);
    } else if (firstRow <= sheet.protectedRange.firstRow && lastRow >= sheet.protectedRange.lastRow) {
      sheet.protectedRangeDeleted = true;
    }
    sheet.sheetMapping.forEach((map) => {
      if (map.rowNumber > lastRow && map.colNumber >= firstCol && map.colNumber <= lastCol) {
        map.rowNumber -= rowsDeleted;
      } else if (
        map.rowNumber >= firstRow &&
        map.rowNumber <= lastRow &&
        map.colNumber >= firstCol &&
        map.colNumber <= lastCol
      ) {
        sheet.sheetMapping = sheet.sheetMapping.filter((i) => i !== map);
      }
    });
    return;
  } else if (
    (firstCol > sheet.protectedRange.firstCol &&
      firstCol <= sheet.protectedRange.lastCol &&
      firstRow <= sheet.protectedRange.lastRow &&
      firstRow >= sheet.protectedRange.firstRow) ||
    (lastCol < sheet.protectedRange.lastCol &&
      lastCol >= sheet.protectedRange.firstCol &&
      firstRow <= sheet.protectedRange.lastRow &&
      firstRow >= sheet.protectedRange.firstRow)
  ) {
    console.log("DATA CORRUPTED!!!!");
    sheet.dataCorrupted = true;
  }
};

const handleCellDeletionLeft = async (sheet: ControlledWorksheet, addressObj: AddressObject) => {
  const { firstCol, firstRow, lastCol, lastRow } = addressObj;
  const colsDeleted = lastCol - firstCol + 1;
  if (sheet.protectedRange.firstRow >= firstRow && sheet.protectedRange.lastRow <= lastRow) {
    if (lastCol < sheet.protectedRange.firstCol) {
      sheet.protectedRange.firstCol -= colsDeleted;
      sheet.protectedRange.lastCol -= colsDeleted;
    } else if (
      firstCol <= sheet.protectedRange.firstCol &&
      lastCol >= sheet.protectedRange.firstCol &&
      lastCol < sheet.protectedRange.lastCol
    ) {
      sheet.protectedRange.firstCol -= lastCol - sheet.protectedRange.firstCol;
      sheet.protectedRange.lastCol -= colsDeleted;
    } else if (firstCol > sheet.protectedRange.firstCol && lastCol < sheet.protectedRange.lastCol) {
      sheet.protectedRange.lastCol -= colsDeleted;
    } else if (
      firstCol > sheet.protectedRange.firstCol &&
      firstCol <= sheet.protectedRange.lastCol &&
      lastCol >= sheet.protectedRange.lastCol
    ) {
      sheet.protectedRange.lastCol -= sheet.protectedRange.lastCol - (firstCol - 1);
    } else if (firstCol <= sheet.protectedRange.firstCol && lastCol >= sheet.protectedRange.lastCol) {
      sheet.protectedRangeDeleted = true;
    }
    sheet.controlledCols.forEach((col) => {
      if (
        col.colNumber > lastCol &&
        firstRow <= sheet.protectedRange.firstRow &&
        lastRow >= sheet.protectedRange.lastRow
      ) {
        col.colNumber -= colsDeleted;
      } else if (
        col.colNumber >= firstCol &&
        col.colNumber <= lastCol &&
        firstRow <= sheet.protectedRange.firstRow &&
        lastRow >= sheet.protectedRange.lastRow
      ) {
        sheet.controlledCols = sheet.controlledCols.filter((i) => i !== col);
      }
    });
    sheet.sheetMapping.forEach((map) => {
      if (map.colNumber > lastCol && map.rowNumber >= firstRow && map.rowNumber <= lastRow) {
        map.colNumber -= colsDeleted;
      } else if (
        map.rowNumber >= firstRow &&
        map.rowNumber <= lastRow &&
        map.colNumber >= firstCol &&
        map.colNumber <= lastCol
      ) {
        sheet.sheetMapping = sheet.sheetMapping.filter((i) => i !== map);
      }
    });
    return;
  } else if (
    (firstRow > sheet.protectedRange.firstRow &&
      firstRow <= sheet.protectedRange.lastRow &&
      firstCol <= sheet.protectedRange.lastCol &&
      firstCol >= sheet.protectedRange.firstCol) ||
    (lastRow < sheet.protectedRange.lastRow &&
      lastRow >= sheet.protectedRange.firstRow &&
      firstCol <= sheet.protectedRange.lastCol &&
      firstCol >= sheet.protectedRange.firstCol)
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
  const rowsInserted = lastRow - firstRow + 1;
  if (sheet.protectedRange.firstCol >= firstCol && sheet.protectedRange.lastCol <= lastCol) {
    if (firstRow <= sheet.protectedRange.firstRow) {
      sheet.protectedRange.firstRow += rowsInserted;
      sheet.protectedRange.lastRow += rowsInserted;
    } else if (firstRow <= sheet.protectedRange.lastRow) {
      sheet.protectedRange.lastRow += rowsInserted;
    }
    //sheet.editButtonStatus === "hide" && cancelAutoFill(wsName, e.address);
    sheet.sheetMapping.forEach((map) => {
      if (map.rowNumber >= firstRow && map.colNumber >= firstCol && map.colNumber <= lastCol)
        map.rowNumber += rowsInserted;
    });
    return;
  } else if (firstCol < sheet.protectedRange.lastCol || lastCol > sheet.protectedRange.firstCol) {
    if (!sheet.dataCorrupted) {
      const range = `${colNumToLetter(firstCol)}${firstRow}:${colNumToLetter(lastCol)}${lastRow}`;
      deleteWorksheetRangeDown(context, wsName, range);
    }
  }
};

const handleCellInsertionRight = (sheet: ControlledWorksheet, addressObj: AddressObject) => {
  const { firstCol, firstRow, lastCol, lastRow } = addressObj;
  const colsInserted = lastCol - firstCol + 1;
  if (sheet.protectedRange.firstRow >= firstRow && sheet.protectedRange.lastRow <= lastRow) {
    if (firstCol <= sheet.protectedRange.firstCol) {
      sheet.protectedRange.firstCol += colsInserted;
      sheet.protectedRange.lastCol += colsInserted;
    } else if (firstCol <= sheet.protectedRange.lastCol) {
      sheet.protectedRange.lastCol += colsInserted;
    }
    sheet.controlledCols.forEach((col) => {
      if (col.colNumber >= firstCol) col.colNumber += colsInserted;
    });
    sheet.sheetMapping.forEach((map) => {
      if (map.colNumber >= firstCol) map.colNumber += colsInserted;
    });
    //sheet.editButtonStatus === "hide" && cancelAutoFill(wsName, e.address);
    return;
  } else if (
    (firstRow > sheet.protectedRange.firstRow &&
      firstRow <= sheet.protectedRange.lastRow &&
      firstCol <= sheet.protectedRange.lastCol &&
      firstCol >= sheet.protectedRange.firstCol) ||
    (lastRow < sheet.protectedRange.lastRow &&
      lastRow >= sheet.protectedRange.firstRow &&
      firstCol <= sheet.protectedRange.lastCol &&
      firstCol >= sheet.protectedRange.firstCol)
  ) {
    console.log("DATA CORRUPPTED!!!!");
    sheet.dataCorrupted = true;
  }
};

export const handleControlledSheetRowSort = async (session: Session, wsName: string) => {
  const usedRange: any[][] = await accessExcelContext(getWorksheetUsedRange, [wsName]);
  const sheet = session.controlledSheets.find((ws) => ws.name === wsName);
  const uniqueCol = sheet.getUniqueColumn();
  if (!uniqueCol) return;
  sheet.sheetMapping.forEach((map) => {
    const controlledInput = map.getControlledInput(sheet.controlledInputs);
    usedRange.forEach((row, index) => {
      if (row[uniqueCol - 1] === controlledInput[sheet.uniqueValue]) {
        map.rowNumber = index + 1;
      }
    });
  });
};
