import { ControlledWorksheet } from "../../classes/controlled-worksheet";
import { QuasiEventObject } from "../../classes/quasi-event-object";
import { Session } from "../../classes/session";
import { AddressObject } from "../../interfaces/interfaces";
import { colNumToLetter } from "../excel-col-conversion";
import { interpretEventAddress, parseChangeEventObjectType } from "../helperFunctions";
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
  let withinProtectedRange = false;
  sheet.controlledRowRanges.forEach((range) => {
    if (
      eRowNumber >= range.firstRow &&
      eRowNumber <= range.lastRow &&
      sheet.controlledCols.find((col) => col.colNumber === eColNumber)
    )
      withinProtectedRange = true;
  });
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
    if (col.colNumber > firstCol && col.colNumber > lastCol) {
      col.colNumber -= colsDeleted;
    } else if (!(firstCol > col.colNumber)) {
      sheet.controlledCols = sheet.controlledCols.filter((i) => i !== col);
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
  const newRowRanges = [];
  sheet.controlledRowRanges.forEach((range) => {
    if (firstRow <= range.firstRow) {
      const newRange = { firstRow: range.firstRow + rowsInserted, lastRow: range.lastRow + rowsInserted };
      newRowRanges.push(newRange);
    } else if (firstRow > range.firstRow && firstRow <= range.lastRow) {
      const newRangeOne = { firstRow: range.firstRow, lastRow: firstRow - 1 };
      const newRangeTwo = { firstRow: lastRow + 1, lastRow: range.lastRow + rowsInserted };
      newRowRanges.push(newRangeOne);
      newRowRanges.push(newRangeTwo);
    } else newRowRanges.push(range);
  });
  sheet.controlledRowRanges = newRowRanges;
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
  const newRowRanges = [];
  sheet.controlledRowRanges.forEach((range) => {
    if (lastRow < range.firstRow) {
      const newRange = { firstRow: range.firstRow - rowsDeleted, lastRow: range.lastRow - rowsDeleted };
      newRowRanges.push(newRange);
    } else if (firstRow <= range.firstRow && lastRow >= range.firstRow && lastRow < range.lastRow) {
      const newRange = { firstRow: firstRow, lastRow: range.lastRow - rowsDeleted };
      newRowRanges.push(newRange);
    } else if (firstRow > range.firstRow && lastRow <= range.lastRow) {
      const newRange = { firstRow: range.firstRow, lastRow: range.lastRow - rowsDeleted };
      newRowRanges.push(newRange);
    } else if (firstRow > range.firstRow && firstRow <= range.lastRow && lastRow >= range.lastRow) {
      const newRange = { firstRow: range.firstRow, lastRow: range.lastRow - (firstRow - 1) };
      newRowRanges.push(newRange);
    } else if (firstRow > range.lastRow) {
      newRowRanges.push(range);
    }
  });
  sheet.controlledRowRanges = newRowRanges;
  sheet.sheetMapping.forEach((map) => {
    if (map.rowNumber > lastRow) map.rowNumber -= rowsDeleted;
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
    const newRowRanges = [];
    sheet.controlledRowRanges.forEach((range) => {
      if (lastRow < range.firstRow) {
        const newRange = { firstRow: range.firstRow - rowsDeleted, lastRow: range.lastRow - rowsDeleted };
        newRowRanges.push(newRange);
      } else if (firstRow <= range.firstRow && lastRow >= range.firstRow && lastRow < range.lastRow) {
        const newRange = { firstRow, lastRow: range.lastRow - rowsDeleted };
        newRowRanges.push(newRange);
      } else if (firstRow > range.firstRow && lastRow <= range.lastRow) {
        const newRange = { firstRow: range.firstRow, lastRow: range.lastRow - rowsDeleted };
        newRowRanges.push(newRange);
      } else if (firstRow > range.firstRow && firstRow <= range.lastRow && lastRow >= range.lastRow) {
        const newRange = { firstRow: range.firstRow, lastRow: range.lastRow - (firstRow - 1) };
        newRowRanges.push(newRange);
      } else if (firstRow > range.lastRow) {
        newRowRanges.push(range);
      }
    });
    sheet.controlledRowRanges = newRowRanges;
    sheet.sheetMapping.forEach((map) => {
      if (map.rowNumber > lastRow) map.rowNumber -= rowsDeleted;
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
      if (col.colNumber > firstCol && col.colNumber > lastCol) {
        col.colNumber -= colsDeleted;
      } else if (!(firstCol > col.colNumber)) {
        sheet.controlledCols = sheet.controlledCols.filter((i) => i !== col);
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
    const newRowRanges = [];
    sheet.controlledRowRanges.forEach((range) => {
      if (firstRow <= range.firstRow) {
        const newRange = { firstRow: range.firstRow + rowsInserted, lastRow: range.lastRow + rowsInserted };
        newRowRanges.push(newRange);
      } else if (firstRow > range.firstRow && firstRow <= range.lastRow) {
        const newRangeOne = { firstRow: range.firstRow, lastRow: firstRow - 1 };
        const newRangeTwo = { firstRow: lastRow + 1, lastRow: range.lastRow + rowsInserted };
        newRowRanges.push(newRangeOne);
        newRowRanges.push(newRangeTwo);
      } else newRowRanges.push(range);
    });
    sheet.controlledRowRanges = newRowRanges;
    //sheet.editButtonStatus === "hide" && cancelAutoFill(wsName, e.address);
    sheet.sheetMapping.forEach((map) => {
      if (map.rowNumber >= firstRow) map.rowNumber += rowsInserted;
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
