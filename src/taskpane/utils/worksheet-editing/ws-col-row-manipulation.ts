import { createEditableCell } from "../../classes/editable-cell";
import { EditableWorksheet } from "../../classes/editable-worksheet";
import { Session } from "../../classes/session";
import { Transaction } from "../../classes/transaction";
import { AddressObject } from "../../interfaces/interfaces";
import { colNumToLetter } from "../excel-col-conversion";
import {
  accessExcelContext,
  callNextView,
  getActiveEdSheet,
  getUpdatedDate,
  getUpdatedNarrative,
} from "../helper-functions";
import { deleteWorksheetRangeDown, getWorksheetUsedRange } from "../worksheet";
import { cancelAutoFill, reinstateNumberFormats } from "./ws-range-editing";
/* global Excel */

export const handleOtherEdSheetChange = async (
  session: Session,
  e: Excel.WorksheetChangedEventArgs,
  wsName: string,
  sheet: EditableWorksheet,
  addressObj: AddressObject
) => {
  console.log("OTHER CHANGE TYPE DETECTED!!!!");
  if (e.changeType === "ColumnInserted") {
    await handleColumnInsertion(e, wsName, sheet, addressObj);
  } else if (e.changeType === "ColumnDeleted") {
    await handleColumnDeletion(session, sheet, addressObj);
  } else if (e.changeType === "RowInserted") {
    await handleRowInsertion(e, wsName, sheet, addressObj);
  } else if (e.changeType === "RowDeleted") {
    await handleRowDeletion(session, sheet, addressObj);
  } else if (e.changeType === "CellDeleted" && e.changeDirectionState.deleteShiftDirection === "Up") {
    await handleCellDeletionUp(session, sheet, addressObj);
  } else if (e.changeType === "CellDeleted" && e.changeDirectionState.deleteShiftDirection === "Left") {
    await handleCellDeletionLeft(session, sheet, addressObj);
  } else if (e.changeType === "CellInserted" && e.changeDirectionState.insertShiftDirection === "Down") {
    handleCellInsertionDown(e, wsName, sheet, addressObj);
  } else if (e.changeType === "CellInserted" && e.changeDirectionState.insertShiftDirection === "Right") {
    handleCellInsertionRight(e, wsName, sheet, addressObj);
  }
};

export const handleColumnInsertion = async (
  e: Excel.WorksheetChangedEventArgs,
  wsName: string,
  sheet: EditableWorksheet,
  addressObj: AddressObject
) => {
  const { firstCol, lastCol } = addressObj;
  const colsInserted = lastCol - firstCol + 1;
  sheet.mappingObject.columns.forEach((colObj) => {
    if (colObj.current >= firstCol) colObj.current += colsInserted;
  });
  sheet.editButtonStatus === "hide" && cancelAutoFill(wsName, e.address);
  return;
};

export const handleColumnDeletion = async (session: Session, sheet: EditableWorksheet, addressObj: AddressObject) => {
  const { firstCol, lastCol } = addressObj;
  const colsDeleted = lastCol - firstCol + 1;
  if (session.activeEditableCell.wsName === sheet.name) {
    if (
      firstCol <= sheet.getCurrentColumn(session.activeEditableCell.addressObj.firstColOrig) &&
      lastCol >= sheet.getCurrentColumn(session.activeEditableCell.addressObj.firstColOrig)
    ) {
      session.activeEditableCell = createEditableCell(null, null, null);
      callNextView(session);
    }
  }
  sheet.mappingObject.columns.forEach((colObj) => {
    if (colObj.current > lastCol) colObj.current -= colsDeleted;
    if (colObj.current >= firstCol && colObj.current <= lastCol) colObj.current = 0;
  });
  const { protectedFirstCol, protectedLastCol } = sheet.getCurrentProtectedRange();
  if (firstCol <= protectedFirstCol && lastCol >= protectedLastCol) {
    sheet.protectedRangeDeleted = true;
    session.setEditButton("off");
    sheet.editButtonStatus = "off";
  }
  sheet.definedCols.forEach((col) => {
    if (!(firstCol > sheet.getCurrentColumn(col.colNumberOrig))) {
      col.isDeleted = true;
    }
  });
  return;
};

export const handleRowInsertion = async (
  e: Excel.WorksheetChangedEventArgs,
  wsName: string,
  sheet: EditableWorksheet,
  addressObj: AddressObject
) => {
  const { firstRow, lastRow } = addressObj;
  const rowsInserted = lastRow - firstRow + 1;
  const newRowRanges = [];
  sheet.mappingObject.rows.forEach((rowObj) => {
    if (rowObj.current >= firstRow) rowObj.current += rowsInserted;
  });
  sheet.editableRowRanges.forEach((range) => {
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
  sheet.editableRowRanges = newRowRanges;
  sheet.editButtonStatus === "hide" && cancelAutoFill(wsName, e.address);
};

export const handleRowDeletion = async (session: Session, sheet: EditableWorksheet, addressObj: AddressObject) => {
  console.log("row deleted!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  const { firstRow, lastRow } = addressObj;
  const rowsDeleted = lastRow - firstRow + 1;
  if (session.activeEditableCell.wsName === sheet.name) {
    if (
      firstRow <= sheet.getCurrentRow(session.activeEditableCell.addressObj.firstRowOrig) &&
      lastRow >= sheet.getCurrentRow(session.activeEditableCell.addressObj.firstRowOrig)
    ) {
      session.activeEditableCell = createEditableCell(null, null, null);
      callNextView(session);
    }
  }
  sheet.mappingObject.rows.forEach((rowObj) => {
    if (rowObj.current > lastRow) {
      rowObj.current -= rowsDeleted;
    } else if (rowObj.current >= firstRow && rowObj.current <= lastRow) {
      rowObj.current = 0;
    }
  });
  const { protectedFirstRow, protectedLastRow } = sheet.getCurrentProtectedRange();
  if (firstRow <= protectedFirstRow && lastRow >= protectedLastRow) {
    sheet.protectedRangeDeleted = true;
    session.setEditButton("off");
    sheet.editButtonStatus = "off";
  }
  const newRowRanges = [];
  sheet.editableRowRanges.forEach((range) => {
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
  sheet.editableRowRanges = newRowRanges;
};

export const handleCellDeletionUp = (session: Session, sheet: EditableWorksheet, addressObj: AddressObject) => {
  console.log("Cells deleted UP!!!!");
  const { firstCol, firstRow, lastCol, lastRow } = addressObj;
  const rowsDeleted = lastRow - firstRow + 1;
  if (session.activeEditableCell.wsName === sheet.name) {
    const currentRow = sheet.getCurrentRow(session.activeEditableCell.addressObj.firstRowOrig);
    if (
      // ie activeEditableCell range is deleted
      firstRow <= currentRow &&
      lastRow >= currentRow
    ) {
      session.activeEditableCell = createEditableCell(null, null, null);
      callNextView(session);
    }
  }
  const { protectedFirstCol, protectedLastCol, protectedFirstRow, protectedLastRow } = sheet.getCurrentProtectedRange();
  if (protectedFirstCol >= firstCol && protectedLastCol <= lastCol) {
    sheet.mappingObject.rows.forEach((rowObj) => {
      if (rowObj.current > lastRow) {
        rowObj.current -= rowsDeleted;
      } else if (rowObj.current >= firstRow && rowObj.current <= lastRow) {
        rowObj.current = 0;
      }
    });
    if (firstRow <= protectedFirstRow && lastRow >= protectedLastRow) {
      sheet.protectedRangeDeleted = true;
      session.setEditButton("off");
      sheet.editButtonStatus = "off";
    }
    const newRowRanges = [];
    sheet.editableRowRanges.forEach((range) => {
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
    sheet.editableRowRanges = newRowRanges;
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

export const handleCellDeletionLeft = async (session: Session, sheet: EditableWorksheet, addressObj: AddressObject) => {
  const { firstCol, firstRow, lastCol, lastRow } = addressObj;
  const colsDeleted = lastCol - firstCol + 1;
  if (session.activeEditableCell.wsName === sheet.name) {
    if (
      firstCol <= sheet.getCurrentColumn(session.activeEditableCell.addressObj.firstColOrig) &&
      lastCol >= sheet.getCurrentColumn(session.activeEditableCell.addressObj.firstColOrig)
    ) {
      session.activeEditableCell = createEditableCell(null, null, null);
      callNextView(session);
    }
  }
  const { protectedFirstCol, protectedLastCol, protectedFirstRow, protectedLastRow } = sheet.getCurrentProtectedRange();
  if (protectedFirstRow >= firstRow && protectedLastRow <= lastRow) {
    sheet.mappingObject.columns.forEach((colObj) => {
      if (colObj.current > lastCol) colObj.current -= colsDeleted;
      if (colObj.current >= firstCol && colObj.current <= lastCol) colObj.current = 0;
    });
    if (firstCol <= protectedFirstCol && lastCol >= protectedLastCol) {
      sheet.protectedRangeDeleted = true;
      session.setEditButton("off");
      sheet.editButtonStatus = "off";
    }
    sheet.definedCols.forEach((col) => {
      if (!(firstCol > sheet.getCurrentColumn(col.colNumberOrig))) {
        col.isDeleted = true;
      }
    });
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
    reinstateNumberFormats(sheet);
    sheet.dataCorrupted = true;
  }
};

export const handleCellInsertionDown = (
  e: Excel.WorksheetChangedEventArgs,
  wsName: string,
  sheet: EditableWorksheet,
  addressObj: AddressObject
) => {
  const { firstCol, firstRow, lastCol, lastRow } = addressObj;
  const rowsInserted = lastRow - firstRow + 1;
  const { protectedFirstCol, protectedLastCol } = sheet.getCurrentProtectedRange();
  if (protectedFirstCol >= firstCol && protectedLastCol <= lastCol) {
    sheet.mappingObject.rows.forEach((rowObj) => {
      if (rowObj.current >= firstRow) rowObj.current += rowsInserted;
    });
    const newRowRanges = [];
    sheet.editableRowRanges.forEach((range) => {
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
    sheet.editableRowRanges = newRowRanges;
    sheet.editButtonStatus === "hide" && cancelAutoFill(wsName, e.address);
    return;
  } else if (firstCol < protectedLastCol || lastCol > protectedFirstCol) {
    if (!sheet.dataCorrupted) {
      const range = `${colNumToLetter(firstCol)}${firstRow}:${colNumToLetter(lastCol)}${lastRow}`;
      deleteWorksheetRangeDown(wsName, range);
    }
  }
};

export const handleCellInsertionRight = (
  e: Excel.WorksheetChangedEventArgs,
  wsName: string,
  sheet: EditableWorksheet,
  addressObj: AddressObject
) => {
  const { firstCol, firstRow, lastCol, lastRow } = addressObj;
  const colsInserted = lastCol - firstCol + 1;
  const { protectedFirstCol, protectedLastCol, protectedFirstRow, protectedLastRow } = sheet.getCurrentProtectedRange();
  if (protectedFirstRow >= firstRow && protectedLastRow <= lastRow) {
    sheet.mappingObject.columns.forEach((colObj) => {
      if (colObj.current >= firstCol) colObj.current += colsInserted;
    });
    sheet.editButtonStatus === "hide" && cancelAutoFill(wsName, e.address);
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
    reinstateNumberFormats(sheet);
    sheet.dataCorrupted = true;
  }
};

export const handleColumnSort = async (session: Session) => {
  const sheet = await getActiveEdSheet(session);
  sheet.columnsSorted = true;
};

export const handleEdSheetRowSort = async (session: Session, wsName: string) => {
  const usedRange: any[][] = await accessExcelContext(getWorksheetUsedRange, [wsName]);
  let uniqueCol: number;
  session.editableSheets.forEach((sheet) => {
    if (sheet.name === wsName) {
      sheet.definedCols.forEach((col) => {
        if (col.isUnique) uniqueCol = sheet.getCurrentColumn(col.colNumberOrig);
      });
      const protectedRowNumbers: number[] = [];
      sheet.sheetMapping.forEach((map) => {
        const transaction = map.getTran(session.assignment.transactions);
        usedRange.forEach((row, index) => {
          if (row[uniqueCol - 1] === transaction.transactionNumber) {
            validateOtherValues(session, sheet, transaction, row);
            sheet.mappingObject.rows.find((row) => row.index === map.index).current = index + 1;
            protectedRowNumbers.push(index + 1);
          }
        });
      });
      protectedRowNumbers.sort((a, b) => {
        return a - b;
      });
      const editableRowRanges = [{ firstRow: protectedRowNumbers[0], lastRow: protectedRowNumbers[0] }];
      for (let i = 1; i < protectedRowNumbers.length; i++) {
        if (editableRowRanges.at(-1).lastRow + 1 === protectedRowNumbers[i]) {
          editableRowRanges.at(-1).lastRow += 1;
        } else {
          const nextRange = { firstRow: protectedRowNumbers[i], lastRow: protectedRowNumbers[i] };
          editableRowRanges.push(nextRange);
        }
      }
      sheet.editableRowRanges = editableRowRanges;
    }
  });
};

export const validateOtherValues = (session: Session, sheet: EditableWorksheet, tran: Transaction, row: any[]) => {
  sheet.type === "cerysCodeAnalysis" && validateCerysTransaction(session, sheet, tran, row);
};

export const validateCerysTransaction = (session: Session, sheet: EditableWorksheet, tran: Transaction, row: any[]) => {
  const date = getUpdatedDate(tran) ? getUpdatedDate(tran).value : tran.getExcelDate();
  const narrative = getUpdatedNarrative(tran) ? getUpdatedNarrative(tran) : tran.narrative;
  const value = tran.getCerysCodeObj(session).defaultSign === "credit" ? tran.value * -1 : tran.value;
  let transDateCol: number;
  let transTypeCol: number;
  let clientCodeCol: number;
  let narrativeCol: number;
  let valueCol: number;
  sheet.definedCols.forEach((col) => {
    if (col.type === "date") transDateCol = sheet.getCurrentColumn(col.colNumberOrig);
    if (col.type === "transType") transTypeCol = sheet.getCurrentColumn(col.colNumberOrig);
    if (col.type === "clientCode") clientCodeCol = sheet.getCurrentColumn(col.colNumberOrig);
    if (col.type === "cerysNarrative") narrativeCol = sheet.getCurrentColumn(col.colNumberOrig);
    if (col.type === "value") valueCol = sheet.getCurrentColumn(col.colNumberOrig);
  });
  let check = true;
  if (date !== row[transDateCol - 1]) {
    check = false;
  }
  if (tran.transactionType !== row[transTypeCol - 1]) {
    check = false;
  }
  if (
    (tran.representsBalanceOfClientCode === -1 && row[clientCodeCol - 1] !== "NA") ||
    (tran.representsBalanceOfClientCode !== -1 && tran.representsBalanceOfClientCode !== row[clientCodeCol - 1])
  ) {
    check = false;
  }
  if (narrative !== row[narrativeCol - 1]) {
    check = false;
  }
  if (value !== row[valueCol - 1] * 100) {
    check = false;
  }
  console.log(check);
};
