import { updateTransactionBatch } from "../fetching/apiEndpoints";
import { fetchOptionsTransBatchUpdate } from "../fetching/generateOptions";
import { colLetterToNum, colNumToLetter } from "./excel-col-conversion";
import {
  callNextView,
  convertExcelDate,
  interpretEventAddress,
  interpretExcelAddress,
  simulateEditButtonClick,
  updateAssignmentFigures,
} from "./helperFunctions";
import { recalculateAmortChg, updateIFANarrative } from "./transactions/ifar-generation";
import { checkAssetRegStatus } from "./transactions/transactions";
import {
  deleteWorksheetRangeDown,
  deleteWorksheetRangesUp,
  getActiveWorksheetName,
  getWorksheetRangeValues,
  getWorksheetUsedRange,
  highlightEditableRanges,
  highlightRanges,
  setExcelRangeValue,
  setManyWorksheetRangeValues,
} from "./worksheet";

export const handleWorksheetEdit = async (session, e, wsName) => {
  console.log(e);
  if (e.changeType === "ColumnInserted") {
    await handleColumnInsertion(session, e, wsName);
  } else if (e.changeType === "ColumnDeleted") {
    await handleColumnDeletion(session, e, wsName);
  } else if (e.changeType === "RowInserted") {
    await handleRowInsertion(session, e, wsName);
  } else if (e.changeType === "RowDeleted") {
    await handleRowDeletion(session, e, wsName);
  } else if (e.changeType === "CellDeleted" && e.changeDirectionState.deleteShiftDirection === "Up") {
    await handleCellDeletionUp(session, e, wsName);
  } else if (e.changeType === "CellDeleted" && e.changeDirectionState.deleteShiftDirection === "Left") {
    await handleCellDeletionLeft(session, e, wsName);
  } else if (e.changeType === "CellInserted" && e.changeDirectionState.insertShiftDirection === "Down") {
    await handleCellInsertionDown(session, e, wsName);
  } else if (e.changeType === "CellInserted" && e.changeDirectionState.insertShiftDirection === "Right") {
    await handleCellInsertionRight(session, e, wsName);
  } else if (e.changeType === "RangeEdited") {
    const editModeEnabled = checkEditMode(session, wsName);
    const autoFillObj = !session.options.autoFillOverride && checkForAutoFill(e);
    if (!autoFillObj.autoFill) await rejectChanges(session, e, wsName, editModeEnabled);
    if (autoFillObj.autoFill) {
      await simulateAutoFillChanges(session, wsName, autoFillObj);
    } else {
      editModeEnabled && (await captureReanalysis(session, e, wsName));
    }
  }
  for (let i = 0; i < session.editableSheets.length; i++) {
    if (session.editableSheets[i].name == wsName) {
      if (session.editableSheets[i].dataCorrupted) {
        if (
          session.editableSheets[i].editButtonStatus === "hide" ||
          session.editableSheets[i].editButtonStatus === "inProgress"
        ) {
          console.log("simulation");
          simulateEditButtonClick(session);
        }
        session.options.autoFillOverride = true;
        await resetToPreviousValues(wsName, session.editableSheets[i]);
      }
    }
  }
  const usedRange = await getWorksheetUsedRange(wsName);
  session.editableSheets.forEach((sheet) => {
    if (sheet.name == wsName) {
      sheet.usedRange = usedRange;
    }
  });
  session.options.autoFillOverride = false;
  console.log(usedRange);
};

export const handleColumnInsertion = async (session, e, wsName) => {
  const addressObj = interpretEventAddress(e);
  const { firstCol, lastCol } = addressObj;
  const colsInserted = lastCol - firstCol + 1;
  session.editableSheets.forEach((sheet) => {
    if (sheet.name === wsName) {
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
    }
  });
};

export const handleColumnDeletion = async (session, e, wsName) => {
  const addressObj = interpretEventAddress(e);
  const { firstCol, lastCol } = addressObj;
  const colsDeleted = lastCol - firstCol + 1;
  session.editableSheets.forEach((sheet) => {
    if (sheet.name === wsName) {
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
    }
  });
};

export const handleRowInsertion = async (session, e, wsName) => {
  const addressObj = interpretEventAddress(e);
  const { firstRow, lastRow } = addressObj;
  const rowsInserted = lastRow - firstRow + 1;
  session.editableSheets.forEach((sheet) => {
    if (sheet.name === wsName) {
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
      return;
    }
  });
  session.updatedTransactions.forEach((tran) => {
    if (tran.rowNumber >= firstRow) tran.rowNumber += rowsInserted;
  });
};

export const handleRowDeletion = async (session, e, wsName) => {
  const addressObj = interpretEventAddress(e);
  const { firstRow, lastRow } = addressObj;
  const rowsDeleted = lastRow - firstRow + 1;
  session.editableSheets.forEach((sheet) => {
    if (sheet.name === wsName) {
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
      console.log(sheet.transactions);
      //const newTransactions = [];
      //sheet.transactions.forEach((tran) => {
      //  if (tran.rowNumber > lastRow || tran.rowNumber < firstRow) {
      //    if (tran.rowNumber > lastRow) tran.rowNumber -= rowsDeleted;
      //    newTransactions.push(tran);
      //  }
      //});
      //sheet.transactions = newTransactions;
      //if (newTransactions.length === 0) console.log("omfg all trans deleted!!!");
      //console.log(newTransactions);
      return;
    }
  });
  session.updatedTransactions.forEach((tran) => {
    if (tran.rowNumber > lastRow) tran.rowNumber -= rowsDeleted;
  });
};

export const handleCellDeletionUp = async (session, e, wsName) => {
  console.log("cells deleted");
  const eventAddressObj = interpretEventAddress(e);
  const { firstCol, firstRow, lastCol, lastRow } = eventAddressObj;
  const rowsDeleted = lastRow - firstRow + 1;
  session.editableSheets.forEach((sheet) => {
    if (sheet.name === wsName) {
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
        console.log(sheet.transactions);
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
    }
  });
};

export const handleCellDeletionLeft = async (session, e, wsName) => {
  console.log("cells deleted left");
  const eventAddressObj = interpretEventAddress(e);
  const { firstCol, firstRow, lastCol, lastRow } = eventAddressObj;
  const colsDeleted = lastCol - firstCol + 1;
  session.editableSheets.forEach((sheet) => {
    if (sheet.name === wsName) {
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
    }
  });
};

export const handleCellInsertionDown = (session, e, wsName) => {
  console.log("cells inserted down");
  const eventAddressObj = interpretEventAddress(e);
  const { firstCol, firstRow, lastCol, lastRow } = eventAddressObj;
  const rowsInserted = lastRow - firstRow + 1;
  session.editableSheets.forEach((sheet) => {
    if (sheet.name === wsName) {
      if (sheet.protectedRange.firstCol >= firstCol && sheet.protectedRange.lastCol <= lastCol) {
        console.log("something");
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
        console.log("something here");
        if (!sheet.dataCorrupted) {
          const range = `${colNumToLetter(firstCol)}${firstRow}:${colNumToLetter(lastCol)}${lastRow}`;
          deleteWorksheetRangeDown(wsName, range);
        }
      }
    }
  });
};

export const handleCellInsertionRight = (session, e, wsName) => {
  console.log("cells inserted right");
  const eventAddressObj = interpretEventAddress(e);
  const { firstCol, firstRow, lastCol, lastRow } = eventAddressObj;
  const colsInserted = lastCol - firstCol + 1;
  session.editableSheets.forEach((sheet) => {
    if (sheet.name === wsName) {
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
    }
  });
};

export const getActiveEdSheet = async (session) => {
  const wsName = await getActiveWorksheetName();
  let ws;
  session.editableSheets.forEach((sheet) => {
    if (sheet.name === wsName) ws = sheet;
  });
  return ws;
};

export const handleColumnSort = async (session) => {
  const sheet = await getActiveEdSheet(session);
  sheet.columnsSorted = true;
};

export const handleRowSort = async (session, wsName, e) => {
  console.log(e);
  const usedRange = await getWorksheetUsedRange(wsName);
  let uniqueCol;
  session.editableSheets.forEach((sheet) => {
    if (sheet.name === wsName) {
      sheet.definedCols.forEach((col) => {
        if (col.unique) uniqueCol = col.colNumber;
      });
      const protectedRowNumbers = [];
      sheet.transactions.forEach((tran) => {
        usedRange.forEach((row, index) => {
          if (row[uniqueCol - 1] === tran.transactionNumber) {
            validateOtherValues(session, sheet, tran, row);
            tran.rowNumber = index + 1;
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

export const checkEditMode = (session, wsName) => {
  let editModeEnabled = false;
  session.editableSheets.forEach((sheet) => {
    if (sheet.name === wsName) {
      if (sheet.editButtonStatus === "hide" || sheet.editButtonStatus === "inProgress") editModeEnabled = true;
    }
  });
  return editModeEnabled;
};

export const rejectChanges = async (session, e, wsName, editModeEnabled) => {
  const { firstRow, firstCol } = interpretEventAddress(e);
  const eRowNumber = firstRow;
  let changeRejected;
  let withinProtectedRange = false;
  for (let i = 0; i < session.editableSheets.length; i++) {
    if (session.editableSheets[i].name === wsName) {
      changeRejected = session.editableSheets[i].changeRejected;
      session.editableSheets[i].changeRejected = !session.editableSheets[i].changeRejected;
      const definedCol = determineChangeType(session.editableSheets[i], firstCol);
      if (definedCol.type === "amortCharge" && session.options.allowAmortChgEdit) {
        session.options.allowAmortChgEdit = false;
        return;
      }
      if ((definedCol && !editModeEnabled) || (definedCol && !definedCol.mutable)) {
        session.editableSheets[i].editableRowRanges.forEach((range) => {
          if (eRowNumber >= range.firstRow && eRowNumber <= range.lastRow) withinProtectedRange = true;
        });
      }
      console.log(withinProtectedRange);
      if (!withinProtectedRange) session.editableSheets[i].edited = true;
      console.log(session.editableSheets[i]);
    }
    if (withinProtectedRange && !changeRejected) {
      const range = `${e.address}:${e.address}`;
      await setExcelRangeValue(wsName, range, e.details.valueBefore);
    } else {
      if (session.editableSheets[i].changeRejected)
        session.editableSheets[i].changeRejected = !session.editableSheets[i].changeRejected;
    }
  }
};

export const checkForAutoFill = (e) => {
  const autoFillObj = { autoFill: false };
  const addressSplit = e.address.split(":");
  if (!addressSplit[1]) return autoFillObj;
  autoFillObj.autoFill = true;
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

export const captureReanalysis = async (session, e, wsName) => {
  console.log("reanalysis captured");
  const { firstRow, firstCol } = interpretEventAddress(e);
  const eRowNumber = firstRow;
  let tran;
  const tests = { changeRejected: false, isValid: false, isNotNegation: true, updated: false };
  session.editableSheets.forEach((sheet) => {
    if (sheet.name === wsName) {
      sheet.transactions.forEach((line) => {
        if (line.rowNumber === eRowNumber) tran = line;
      });
      const change = determineChangeType(sheet, firstCol);
      const validationObj = validateChange(session, tran, change, e);
      const { isError, isInvalid, isNegation } = validationObj;
      tests.isNotNegation = !isNegation;
      tests.changeRejected = isInvalid;
      if (!isError && !isInvalid) {
        let newArray = [];
        updateIfExistingUpdate(session, tran, tests, change, validationObj, newArray, e);
        if (!tests.updated && !validationObj.isNegation) {
          createNewTransactionUpdate(tran, newArray, tests, e, sheet, change);
        }
        if (change.type === "date" && sheet.type === "IFARPreview") recalculateAmortChg(session, sheet, tran, e);
        if (change.type === "cerysNarrative" && sheet.type === "IFARPreview") updateIFANarrative(session, tran, e);
        session.updatedTransactions = newArray;
      }
      if (tests.isValid) {
        sheet.editButtonStatus = session.updatedTransactions.length > 0 ? "inProgress" : "hide";
      }
    }
  });
  const range = `${e.address}:${e.address}`;
  if (tests.changeRejected) {
    await setExcelRangeValue(wsName, range, e.details.valueBefore);
  }
  console.log(tests.isValid);
  if (tests.isValid) {
    const color = tests.isNotNegation ? "lightGreen" : "yellow";
    console.log("color is " + color);
    highlightRanges(wsName, [range], color);
    const view = session.updatedTransactions.length > 0 ? "handleTransUpdates" : session.nextView;
    session.handleView(view);
    if (session.updatedTransactions.length > 0) {
      session.setEditButton("off");
    } else {
      session.setEditButton("hide");
    }
  }
};

export const determineChangeType = (sheet, addressCol) => {
  let type;
  sheet.definedCols.forEach((col) => {
    if (col.colNumber === addressCol) type = col;
  });
  return type;
};

export const validateChange = (session, tran, change, e) => {
  const obj = { isNegation: false, isInvalid: false, isError: false };
  if (change.type === "cerysCode") {
    if (e.details.valueAfter === tran.cerysCode) obj.isNegation = true;
    let inValidCode = true;
    session.chart.forEach((code) => {
      if (code.cerysCode === e.details.valueAfter) inValidCode = false;
    });
    obj.isInvalid = inValidCode;
  } else if (change.type === "date") {
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
  } else if (change.type === "cerysNarrative") {
    if (e.details.valueAfter === tran.narrative) obj.isNegation = true;
  } else obj.isError = true;
  return obj;
};

export const updateIfExistingUpdate = (session, tran, tests, change, validationObj, newArray, e) => {
  console.log(session.updatedTransactions);
  console.log(tran);
  session.updatedTransactions.forEach((updatedTran) => {
    if (updatedTran.transactionId === tran._id) {
      console.log("validated");
      tests.isValid = true;
      tests.updated = true;
      if (validationObj.isNegation) {
        if (change.type === "cerysCode") {
          if (updatedTran.updatedDate || updatedTran.updatedNarrative) {
            delete updatedTran.updatedCode;
            newArray.push(updatedTran);
          }
        }
        if (change.type === "date") {
          if (updatedTran.updatedCode || updatedTran.cerysNarrative) {
            delete updatedTran.updatedDate;
            newArray.push(updatedTran);
          }
        }
        if (change.type === "cerysNarrative") {
          if (updatedTran.updatedCode || updatedTran.updatedDate) {
            delete updatedTran.updatedNarrative;
            newArray.push(updatedTran);
          }
        }
      } else {
        updatedTran[change.updateKey] = e.details.valueAfter;
        newArray.push(updatedTran);
      }
    } else newArray.push(updatedTran);
  });
};

export const createNewTransactionUpdate = (tran, newArray, tests, e, sheet, change) => {
  const updatedTran: {
    transactionId: string;
    code: number;
    updatedCode?: number;
    date: string;
    updatedDate?: number;
    dateExcel: number;
    narrative: string;
    updatedNarrative?: string;
    value: number;
    rowNumber: number;
    rowNumberOrig: number;
    worksheetId: string;
    worksheetName: string;
  } = {
    transactionId: tran._id,
    code: tran.cerysCode,
    date: tran.transactionDate,
    dateExcel: tran.transactionDateExcel,
    narrative: tran.narrative,
    value: tran.value,
    rowNumber: tran.rowNumber,
    rowNumberOrig: tran.rowNumberOrig,
    worksheetId: sheet.worksheetId,
    worksheetName: sheet.name,
    [change.updateKey]: e.details.valueAfter,
  };
  newArray.push(updatedTran);
  tests.isValid = true;
};

export const cancelAutoFill = async (wsName, address) => {
  await Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getItem(wsName);
    const range = sheet.getRange(address);
    range.format.fill.clear();
    await context.sync();
  });
};

export const submitTransactionUpdates = async (session) => {
  let tbUpdated = false;
  let otherUpdated = false;
  const updatedTrans = session.updatedTransactions;
  const deletionObjs = [];
  let promptSheetDeletion = false;
  session.updatedTransactions.forEach((tran) => {
    tran.mongoDate = tran.updatedDate && convertExcelDate(tran.updatedDate);
    if (tran.updatedCode) {
      tbUpdated = true;
      session["chart"].forEach((code) => {
        if (code.cerysCode === tran.updatedCode) tran.cerysCodeObject = code;
      });
      session.editableSheets.forEach((sheet) => {
        if (sheet.name === tran.worksheetName) {
          const deletionRange = `${colNumToLetter(sheet.protectedRange.firstCol)}${tran.rowNumber}:${colNumToLetter(sheet.protectedRange.lastCol)}${tran.rowNumber}`;
          const deletionObj = { wsName: tran.worksheetName, range: deletionRange, rowNumber: tran.rowNumber };
          deletionObjs.push(deletionObj);
          sheet.editButtonStatus = "hide";
          const newTransactions = [];
          sheet.transactions.forEach((i) => {
            if (i._id !== tran.transactionId) {
              newTransactions.push(i);
            }
          });
          sheet.transactions = newTransactions;
          if (newTransactions.length === 0) {
            sheet.promptDeletion = true;
            promptSheetDeletion = true;
          }
        }
      });
    } else {
      otherUpdated = true;
      session.editableSheets.forEach((sheet) => {
        sheet.transactions.forEach((transaction) => {
          if (transaction._id === tran.transactionId) {
            if (tran.updatedDate) transaction.transactionDateExcel = tran.updatedDate;
            if (tran.updatedNarrative) transaction.narrative = tran.updatedNarrative;
          }
        });
      });
    }
  });
  if (otherUpdated) {
    updatedTrans.forEach((tran) => {
      session.editableSheets.forEach((sheet) => {
        if (tran.worksheetName === sheet.name) {
          highlightEditableRanges(sheet);
        }
      });
    });
  }
  deletionObjs.sort((a, b) => {
    return b.rowNumber - a.rowNumber;
  });
  if (deletionObjs.length > 0) await deleteWorksheetRangesUp(deletionObjs);
  const options = fetchOptionsTransBatchUpdate(session);
  const updatedCustAndAssDB = await fetch(updateTransactionBatch, options);
  const updatedCustAndAss = await updatedCustAndAssDB.json();
  session["customer"] = updatedCustAndAss.customer;
  session["activeAssignment"] = updatedCustAndAss.assignment;
  session["updatedTransactions"] = [];
  if (tbUpdated) {
    if (promptSheetDeletion) {
      await updateAssignmentFigures(session);
      session.handleView("deleteSheetPrompt");
    } else {
      await updateAssignmentFigures(session);
      checkAssetRegStatus(session, session["handleView"]);
    }
  } else {
    console.log("here");
    callNextView(session);
  }
  session.setEditButton("hide");
};

export const reverseTransactionUpdates = async (session) => {
  const reversals = [];
  console.log(session.updatedTransactions);
  const updatedTrans = session.updatedTransactions;
  updatedTrans.forEach((tran) => {
    const wsName = tran.worksheetName;
    let ws;
    session.editableSheets.forEach((sheet) => {
      if (sheet.name === wsName) {
        sheet.editButtonStatus = "hide";
        ws = sheet;
      }
    });
    let dateCol;
    let cerysCodeCol;
    let cerysNarrativeCol;
    ws.definedCols.forEach((col) => {
      if (col.type === "date") dateCol = col.colNumber;
      if (col.type === "cerysCode") cerysCodeCol = col.colNumber;
      if (col.type === "cerysNarrative") cerysNarrativeCol = col.colNumber;
    });
    const dateColLetter = colNumToLetter(dateCol);
    const cerysCodeColLetter = colNumToLetter(cerysCodeCol);
    const cerysNarrativeColLetter = colNumToLetter(cerysNarrativeCol);
    if (tran.updatedCode) {
      const address = `${cerysCodeColLetter}${tran.rowNumber}:${cerysCodeColLetter}${tran.rowNumber}`;
      const reversal = { wsName, address, value: tran.code };
      reversals.push(reversal);
    }
    if (tran.updatedDate) {
      console.log("date updated");
      const address = `${dateColLetter}${tran.rowNumber}:${dateColLetter}${tran.rowNumber}`;
      const reversal = { wsName, address, value: tran.dateExcel };
      reversals.push(reversal);
    }
    if (tran.updatedNarrative) {
      const address = `${cerysNarrativeColLetter}${tran.rowNumber}:${cerysNarrativeColLetter}${tran.rowNumber}`;
      const reversal = { wsName, address, value: tran.narrative };
      reversals.push(reversal);
    }
  });
  await setManyWorksheetRangeValues(reversals);
  await resetEditableRanges(session, reversals);
  session.setEditButton("hide");
};

export const resetEditableRanges = async (session, updates) => {
  await Excel.run(async (context) => {
    console.log(updates);
    updates.forEach((update) => {
      session.editableSheets.forEach((sheet) => {
        if (sheet.name === update.wsName && sheet.editButtonStatus === "hide") {
          console.log("test passed");
          const ws = context.workbook.worksheets.getItem(update.wsName);
          const range = ws.getRange(update.address);
          range.format.fill.color = "yellow";
          console.log("filled yellow");
        }
      });
    });
    await context.sync();
  });
};

export const simulateAutoFillChanges = async (session, wsName, autoFillObj) => {
  console.log("changes simulated");
  let sheet;
  session.editableSheets.forEach((ws) => {
    if (ws.name === wsName) sheet = ws;
  });
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
    const valueAfter = await getWorksheetRangeValues(wsName, valueAfterRange);
    const event = {
      address: `${colNumToLetter(ranges[i].colNumber)}${ranges[i].rowNumber}`,
      details: { valueBefore: ranges[i].valueBefore, valueAfter: valueAfter[0][0] },
      changeType: "RangeEdited",
    };
    await handleWorksheetEdit(session, event, wsName);
  }
};

export const resetToPreviousValues = async (wsName, sheet) => {
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
    const wsNewRange = ws.getRange(newRange);
    wsNewRange.values = sheet.usedRange;
    sheet.dataCorrupted = false;
    await context.sync();
  });
};

export const reinstateNumberFormats = async (sheet) => {
  await Excel.run(async (context) => {
    const ws = context.workbook.worksheets.getItem(sheet.name);
    sheet.definedCols.forEach((col) => {
      const colLetter = colNumToLetter(col.colNumber);
      const range = ws.getRange(`${colLetter}:${colLetter}`);
      range.numberFormat = col.format;
    });
    await context.sync();
  });
};
