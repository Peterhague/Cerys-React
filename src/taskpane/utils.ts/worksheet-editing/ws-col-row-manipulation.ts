import { createEditableCell } from "../../classes/editable-cell";
import { colNumToLetter } from "../excel-col-conversion";
import { callNextView, getActiveEdSheet } from "../helperFunctions";
import { deleteWorksheetRangeDown, getWorksheetUsedRange } from "../worksheet";
import { cancelAutoFill, reinstateNumberFormats } from "./ws-range-editing";

export const handleOtherChange = async (session, e, wsName, sheet, addressObj) => {
  if (e.changeType === "ColumnInserted") {
    await handleColumnInsertion(session, e, wsName, sheet, addressObj);
  } else if (e.changeType === "ColumnDeleted") {
    await handleColumnDeletion(session, sheet, addressObj);
  } else if (e.changeType === "RowInserted") {
    await handleRowInsertion(session, e, wsName, sheet, addressObj);
  } else if (e.changeType === "RowDeleted") {
    await handleRowDeletion(session, sheet, addressObj);
  } else if (e.changeType === "CellDeleted" && e.changeDirectionState.deleteShiftDirection === "Up") {
    await handleCellDeletionUp(session, sheet, addressObj);
  } else if (e.changeType === "CellDeleted" && e.changeDirectionState.deleteShiftDirection === "Left") {
    await handleCellDeletionLeft(session, sheet, addressObj);
  } else if (e.changeType === "CellInserted" && e.changeDirectionState.insertShiftDirection === "Down") {
    await handleCellInsertionDown(session, e, wsName, sheet, addressObj);
  } else if (e.changeType === "CellInserted" && e.changeDirectionState.insertShiftDirection === "Right") {
    await handleCellInsertionRight(session, e, wsName, sheet, addressObj);
  }
};

export const handleColumnInsertion = async (session, e, wsName, sheet, addressObj) => {
  const { firstCol, lastCol } = addressObj;
  const colsInserted = lastCol - firstCol + 1;
  if (session.activeEditableCell.wsName === sheet.name && firstCol <= session.activeEditableCell.addressObj.firstCol) {
    session.activeEditableCell.addressObj.firstCol += colsInserted;
    session.activeEditableCell.addressObj.lastCol += colsInserted;
  }
  if (firstCol <= sheet.protectedRange.firstCol) {
    sheet.protectedRange.firstCol += colsInserted;
    sheet.protectedRange.lastCol += colsInserted;
  } else if (firstCol <= sheet.protectedRange.lastCol) {
    sheet.protectedRange.lastCol += colsInserted;
  }
  sheet.definedCols.forEach((col) => {
    if (col.colNumber >= firstCol) col.colNumber += colsInserted;
  });
  sheet.editButtonStatus === "hide" && cancelAutoFill(wsName, e.address);
  return;
};

export const handleColumnDeletion = async (session, sheet, addressObj) => {
  const { firstCol, lastCol } = addressObj;
  const colsDeleted = lastCol - firstCol + 1;
  if (session.activeEditableCell.wsName === sheet.name) {
    if (
      firstCol < session.activeEditableCell.addressObj.firstCol &&
      lastCol < session.activeEditableCell.addressObj.firstCol
    ) {
      session.activeEditableCell.addressObj.firstCol -= colsDeleted;
      session.activeEditableCell.addressObj.lastCol -= colsDeleted;
    } else if (
      firstCol <= session.activeEditableCell.addressObj.firstCol &&
      lastCol >= session.activeEditableCell.addressObj.firstCol
    ) {
      session.activeEditableCell = createEditableCell(null, null, null);
      callNextView(session);
    }
  }
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
    session.setEditButton("off");
    sheet.editButtonStatus = "off";
  }
  sheet.definedCols.forEach((col) => {
    if (col.colNumber > firstCol && col.colNumber > lastCol) {
      col.colNumber -= colsDeleted;
    } else if (!(firstCol > col.colNumber)) {
      col.deleted = true;
    }
  });
  return;
};

export const handleRowInsertion = async (session, e, wsName, sheet, addressObj) => {
  const { firstRow, lastRow } = addressObj;
  const rowsInserted = lastRow - firstRow + 1;
  if (session.activeEditableCell.wsName === sheet.name && firstRow <= session.activeEditableCell.addressObj.firstRow) {
    session.activeEditableCell.addressObj.firstRow += rowsInserted;
    session.activeEditableCell.addressObj.lastRow += rowsInserted;
  }
  if (firstRow <= sheet.protectedRange.firstRow) {
    sheet.protectedRange.firstRow += rowsInserted;
    sheet.protectedRange.lastRow += rowsInserted;
  } else if (firstRow <= sheet.protectedRange.lastRow) {
    sheet.protectedRange.lastRow += rowsInserted;
  }
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
  sheet.transactions.forEach((tran) => {
    if (tran.rowNumber >= firstRow) tran.rowNumber += rowsInserted;
  });
  session.updatedTransactions.forEach((tran) => {
    if (tran.rowNumber >= firstRow) tran.rowNumber += rowsInserted;
  });
};

export const handleRowDeletion = async (session, sheet, addressObj) => {
  const { firstRow, lastRow } = addressObj;
  const rowsDeleted = lastRow - firstRow + 1;
  if (session.activeEditableCell.wsName === sheet.name) {
    if (
      firstRow < session.activeEditableCell.addressObj.firstRow &&
      lastRow < session.activeEditableCell.addressObj.firstRow
    ) {
      session.activeEditableCell.addressObj.firstRow -= rowsDeleted;
      session.activeEditableCell.addressObj.lastRow -= rowsDeleted;
    } else if (
      firstRow <= session.activeEditableCell.addressObj.firstRow &&
      lastRow >= session.activeEditableCell.addressObj.firstRow
    ) {
      session.activeEditableCell = createEditableCell(null, null, null);
      callNextView(session);
    }
  }
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
  sheet.transactions.forEach((tran) => {
    if (tran.rowNumber > lastRow) tran.rowNumber -= rowsDeleted;
  });
  session.updatedTransactions.forEach((tran) => {
    if (tran.rowNumber > lastRow) tran.rowNumber -= rowsDeleted;
  });
};

export const handleCellDeletionUp = async (session, sheet, addressObj) => {
  const { firstCol, firstRow, lastCol, lastRow } = addressObj;
  const rowsDeleted = lastRow - firstRow + 1;
  if (session.activeEditableCell.wsName === sheet.name) {
    if (
      firstRow < session.activeEditableCell.addressObj.firstRow &&
      lastRow < session.activeEditableCell.addressObj.firstRow
    ) {
      session.activeEditableCell.addressObj.firstRow -= rowsDeleted;
      session.activeEditableCell.addressObj.lastRow -= rowsDeleted;
    } else if (
      firstRow <= session.activeEditableCell.addressObj.firstRow &&
      lastRow >= session.activeEditableCell.addressObj.firstRow
    ) {
      session.activeEditableCell = createEditableCell(null, null, null);
      callNextView(session);
    }
  }
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
    sheet.transactions.forEach((tran) => {
      if (tran.rowNumber > lastRow) tran.rowNumber -= rowsDeleted;
    });
    session.updatedTransactions.forEach((tran) => {
      if (tran.rowNumber > lastRow) tran.rowNumber -= rowsDeleted;
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

export const handleCellDeletionLeft = async (session, sheet, addressObj) => {
  const { firstCol, firstRow, lastCol, lastRow } = addressObj;
  const colsDeleted = lastCol - firstCol + 1;
  if (session.activeEditableCell.wsName === sheet.name) {
    if (
      firstCol < session.activeEditableCell.addressObj.firstCol &&
      lastCol < session.activeEditableCell.addressObj.firstCol
    ) {
      session.activeEditableCell.addressObj.firstCol -= colsDeleted;
      session.activeEditableCell.addressObj.lastCol -= colsDeleted;
    } else if (
      firstCol <= session.activeEditableCell.addressObj.firstCol &&
      lastCol >= session.activeEditableCell.addressObj.firstCol
    ) {
      session.activeEditableCell = createEditableCell(null, null, null);
      callNextView(session);
    }
  }
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
      session.setEditButton("off");
      sheet.editButtonStatus = "off";
    }
    sheet.definedCols.forEach((col) => {
      if (col.colNumber > firstCol && col.colNumber > lastCol) {
        col.colNumber -= colsDeleted;
      } else if (!(firstCol > col.colNumber)) {
        col.deleted = true;
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
    reinstateNumberFormats(sheet);
    sheet.dataCorrupted = true;
  }
};

export const handleCellInsertionDown = (session, e, wsName, sheet, addressObj) => {
  const { firstCol, firstRow, lastCol, lastRow } = addressObj;
  const rowsInserted = lastRow - firstRow + 1;
  if (session.activeEditableCell.wsName === sheet.name && session.activeEditableCell.addressObj.firstRow >= firstRow) {
    session.activeEditableCell.addressObj.firstRow += rowsInserted;
    session.activeEditableCell.addressObj.lastRow += rowsInserted;
  }
  if (sheet.protectedRange.firstCol >= firstCol && sheet.protectedRange.lastCol <= lastCol) {
    if (firstRow <= sheet.protectedRange.firstRow) {
      sheet.protectedRange.firstRow += rowsInserted;
      sheet.protectedRange.lastRow += rowsInserted;
    } else if (firstRow <= sheet.protectedRange.lastRow) {
      sheet.protectedRange.lastRow += rowsInserted;
    }
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
    sheet.transactions.forEach((tran) => {
      if (tran.rowNumber >= firstRow) tran.rowNumber += rowsInserted;
    });
    session.updatedTransactions.forEach((tran) => {
      if (tran.rowNumber >= firstRow) tran.rowNumber += rowsInserted;
    });
    return;
  } else if (firstCol < sheet.protectedRange.lastCol || lastCol > sheet.protectedRange.firstCol) {
    if (!sheet.dataCorrupted) {
      const range = `${colNumToLetter(firstCol)}${firstRow}:${colNumToLetter(lastCol)}${lastRow}`;
      deleteWorksheetRangeDown(wsName, range);
    }
  }
};

export const handleCellInsertionRight = (session, e, wsName, sheet, addressObj) => {
  const { firstCol, firstRow, lastCol, lastRow } = addressObj;
  const colsInserted = lastCol - firstCol + 1;
  if (session.activeEditableCell.wsName === sheet.name && session.activeEditableCell.addressObj.firstCol >= firstCol) {
    session.activeEditableCell.addressObj.firstRow += colsInserted;
    session.activeEditableCell.addressObj.lastRow += colsInserted;
  }
  if (sheet.protectedRange.firstRow >= firstRow && sheet.protectedRange.lastRow <= lastRow) {
    if (firstCol <= sheet.protectedRange.firstCol) {
      sheet.protectedRange.firstCol += colsInserted;
      sheet.protectedRange.lastCol += colsInserted;
    } else if (firstCol <= sheet.protectedRange.lastCol) {
      sheet.protectedRange.lastCol += colsInserted;
    }
    sheet.definedCols.forEach((col) => {
      if (col.colNumber >= firstCol) col.colNumber += colsInserted;
    });
    sheet.editButtonStatus === "hide" && cancelAutoFill(wsName, e.address);
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
    reinstateNumberFormats(sheet);
    sheet.dataCorrupted = true;
  }
};

export const handleColumnSort = async (session) => {
  const sheet = await getActiveEdSheet(session);
  sheet.columnsSorted = true;
};

export const handleRowSort = async (session, wsName) => {
  const usedRange = await getWorksheetUsedRange(wsName);
  let uniqueCol;
  session.editableSheets.forEach((sheet) => {
    if (sheet.name === wsName) {
      sheet.definedCols.forEach((col) => {
        if (col.unique) uniqueCol = col.colNumber;
      });
      const protectedRowNumbers = [];
      sheet.transactions.forEach((tran) => {
        const currentRowNumber = tran.rowNumber;
        let activeCellMatched = false;
        if (session.activeEditableCell.wsName === sheet.name) {
          if (session.activeEditableCell.addressObj.firstRow === currentRowNumber) {
            activeCellMatched = true;
          }
        }
        usedRange.forEach((row, index) => {
          if (row[uniqueCol - 1] === tran.transactionNumber) {
            validateOtherValues(session, sheet, tran, row);
            tran.rowNumber = index + 1;
            if (activeCellMatched) {
              session.activeEditableCell.addressObj.firstRow = index + 1;
              session.activeEditableCell.addressObj.lastRow = index + 1;
            }
            protectedRowNumbers.push(index + 1);
          }
        });
      });
      session.updatedTransactions.forEach((tran) => {
        usedRange.forEach((row, index) => {
          if (row[uniqueCol - 1] === tran.transactionNumber) {
            tran.rowNumber = index + 1;
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

export const validateOtherValues = (session, sheet, tran, row) => {
  let updatedTran = { updatedDate: false, updatedNarrative: false };
  session.updatedTransactions.forEach((update) => {
    if (update.transactionId === tran._id) updatedTran = update;
  });
  sheet.type === "cerysCodeAnalysis" && validateCerysTransaction(sheet, tran, updatedTran, row);
};

export const validateCerysTransaction = (sheet, tran, updatedTran, row) => {
  const date = updatedTran.updatedDate ? updatedTran.updatedDate : tran.transactionDateExcel;
  const narrative = updatedTran.updatedNarrative ? updatedTran.updatedNarrative : tran.narrative;
  const value = tran.defaultSign === "credit" ? tran.value * -1 : tran.value;
  let transDateCol;
  let transTypeCol;
  let clientCodeCol;
  let narrativeCol;
  let valueCol;
  sheet.definedCols.forEach((col) => {
    if (col.type === "date") transDateCol = col.colNumber;
    if (col.type === "transType") transTypeCol = col.colNumber;
    if (col.type === "clientCode") clientCodeCol = col.colNumber;
    if (col.type === "cerysNarrative") narrativeCol = col.colNumber;
    if (col.type === "value") valueCol = col.colNumber;
  });
  let check = true;
  if (date !== row[transDateCol - 1]) {
    check = false;
  }
  if (tran.transactionType !== row[transTypeCol - 1]) {
    check = false;
  }
  if (
    (tran.clientNominalCode === -1 && row[clientCodeCol - 1] !== "NA") ||
    (tran.clientNominalCode !== -1 && tran.clientNominalCode !== row[clientCodeCol - 1])
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
