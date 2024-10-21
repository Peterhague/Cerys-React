import { updateTransactionBatch } from "../fetching/apiEndpoints";
import { fetchOptionsTransBatchUpdate } from "../fetching/generateOptions";
import { colLetterToNum, colNumToLetter } from "./excel-col-conversion";
import { callNextView, convertExcelDate, updateAssignmentFigures } from "./helperFunctions";
import {
  getActiveWorksheet,
  getActiveWorksheetName,
  getWorksheetRangeValues,
  getWorksheetUsedRange,
  highlightRanges,
  setExcelRangeValue,
  setManyWorksheetRangeValues,
} from "./worksheet";

export const handleWorksheetEdit = (session, e, wsName) => {
  console.log(e);
  if (e.changeType === "ColumnInserted") {
    handleColumnInsertion(session, e, wsName);
    return;
  } else if (e.changeType === "ColumnDeleted") {
    handleColumnDeletion(session, e, wsName);
  } else if (e.changeType === "RowInserted") {
    handleRowInsertion(session, e, wsName);
  } else if (e.changeType === "RowDeleted") {
    handleRowDeletion(session, e, wsName);
  } else {
    //rejectProtectedCellsChanges(session, e, wsName);
    const editModeEnabled = checkEditMode(session, wsName);
    //!editModeEnabled && rejectChanges(session, e, wsName, editModeEnabled);
    rejectChanges(session, e, wsName, editModeEnabled);
    const autoFillObj = checkForAutoFill(e);
    if (autoFillObj.autoFill) {
      simulateAutoFillChanges(session, e, wsName, autoFillObj);
    } else {
      editModeEnabled && captureReanalysis(session, e, wsName);
    }
  }
};

export const handleColumnInsertion = async (session, e, wsName) => {
  console.log(e);
  const addressSplit = e.address.split(":");
  const addressColNo1 = colLetterToNum(addressSplit[0]);
  const addressColNo2 = colLetterToNum(addressSplit[1]);
  const colsInserted = addressColNo2 - addressColNo1 + 1;
  session.editableSheets.forEach((sheet) => {
    if (sheet.name === wsName) {
      if (addressColNo1 <= sheet.protectedRange.firstCol) {
        sheet.protectedRange.firstCol += colsInserted;
        sheet.protectedRange.lastCol += colsInserted;
      } else if (addressColNo1 <= sheet.protectedRange.lastCol) {
        sheet.protectedRange.lastCol += colsInserted;
      }
      if (sheet.transNoColDetails.colNumber >= addressColNo1) {
        sheet.transNoColDetails.colNumber += colsInserted;
        sheet.transNoColDetails.colLetter = colNumToLetter(sheet.transNoColDetails.colNumber);
      }
      if (sheet.dateColDetails.colNumber >= addressColNo1) {
        sheet.dateColDetails.colNumber += colsInserted;
        sheet.dateColDetails.colLetter = colNumToLetter(sheet.dateColDetails.colNumber);
      }
      if (sheet.transTypeColDetails.colNumber >= addressColNo1) {
        sheet.transTypeColDetails.colNumber += colsInserted;
        sheet.transTypeColDetails.colLetter = colNumToLetter(sheet.transTypeColDetails.colNumber);
      }
      if (sheet.codeColDetails.colNumber >= addressColNo1) {
        sheet.codeColDetails.colNumber += colsInserted;
        sheet.codeColDetails.colLetter = colNumToLetter(sheet.codeColDetails.colNumber);
      }
      if (sheet.clientCodeColDetails.colNumber >= addressColNo1) {
        sheet.clientCodeColDetails.colNumber += colsInserted;
        sheet.clientCodeColDetails.colLetter = colNumToLetter(sheet.clientCodeColDetails.colNumber);
      }
      if (sheet.narrColDetails.colNumber >= addressColNo1) {
        sheet.narrColDetails.colNumber += colsInserted;
        sheet.narrColDetails.colLetter = colNumToLetter(sheet.narrColDetails.colNumber);
      }
      if (sheet.valueColDetails.colNumber >= addressColNo1) {
        sheet.valueColDetails.colNumber += colsInserted;
        sheet.valueColDetails.colLetter = colNumToLetter(sheet.valueColDetails.colNumber);
      }
      sheet.editButtonStatus === "hide" && cancelAutoFill(wsName, e.address);
      return;
    }
  });
};

export const handleColumnDeletion = async (session, e, wsName) => {
  const addressSplit = e.address.split(":");
  const addressColNo1 = colLetterToNum(addressSplit[0]);
  const addressColNo2 = colLetterToNum(addressSplit[1]);
  const colsDeleted = addressColNo2 - addressColNo1 + 1;
  session.editableSheets.forEach((sheet) => {
    if (sheet.name === wsName) {
      if (addressColNo2 < sheet.protectedRange.firstCol) {
        sheet.protectedRange.firstCol -= colsDeleted;
        sheet.protectedRange.lastCol -= colsDeleted;
      } else if (
        addressColNo1 <= sheet.protectedRange.firstCol &&
        addressColNo2 >= sheet.protectedRange.firstCol &&
        addressColNo2 < sheet.protectedRange.lastCol
      ) {
        sheet.protectedRange.firstCol -= addressColNo2 - sheet.protectedRange.firstCol;
        sheet.protectedRange.lastCol -= colsDeleted;
      } else if (addressColNo1 > sheet.protectedRange.firstCol && addressColNo2 < sheet.protectedRange.lastCol) {
        sheet.protectedRange.lastCol -= colsDeleted;
      } else if (
        addressColNo1 > sheet.protectedRange.firstCol &&
        addressColNo1 <= sheet.protectedRange.lastCol &&
        addressColNo2 >= sheet.protectedRange.lastCol
      ) {
        console.log("correct branch");
        sheet.protectedRange.lastCol -= sheet.protectedRange.lastCol - (addressColNo1 - 1);
      } else if (addressColNo1 <= sheet.protectedRange.firstCol && addressColNo2 >= sheet.protectedRange.lastCol) {
        console.log("null!!!");
        sheet.protectedRangeDeleted = true;
        session.setEditButton("off");
        sheet.editButtonStatus = "off";
      }
      if (sheet.transNoColDetails.colNumber > addressColNo1 && sheet.transNoColDetails.colNumber > addressColNo2) {
        sheet.transNoColDetails.colNumber -= colsDeleted;
        sheet.transNoColDetails.colLetter = colNumToLetter(sheet.transNoColDetails.colNumber);
      } else if (!(addressColNo1 > sheet.transNoColDetails.colNumber)) {
        sheet.transNoColDetails.deleted = true;
      }
      if (sheet.dateColDetails.colNumber > addressColNo1 && sheet.dateColDetails.colNumber > addressColNo2) {
        sheet.dateColDetails.colNumber -= colsDeleted;
        sheet.dateColDetails.colLetter = colNumToLetter(sheet.dateColDetails.colNumber);
      } else if (!(addressColNo1 > sheet.dateColDetails.colNumber)) {
        sheet.dateColDetails.deleted = true;
      }
      if (sheet.transTypeColDetails.colNumber > addressColNo1 && sheet.transTypeColDetails.colNumber > addressColNo2) {
        sheet.transTypeColDetails.colNumber -= colsDeleted;
        sheet.transTypeColDetails.colLetter = colNumToLetter(sheet.transTypeColDetails.colNumber);
      } else if (!(addressColNo1 > sheet.transTypeColDetails.colNumber)) {
        sheet.transTypeColDetails.deleted = true;
      }
      if (sheet.codeColDetails.colNumber > addressColNo1 && sheet.codeColDetails.colNumber > addressColNo2) {
        sheet.codeColDetails.colNumber -= colsDeleted;
        sheet.codeColDetails.colLetter = colNumToLetter(sheet.codeColDetails.colNumber);
      } else if (!(addressColNo1 > sheet.codeColDetails.colNumber)) {
        sheet.codeColDetails.deleted = true;
      }
      if (
        sheet.clientCodeColDetails.colNumber > addressColNo1 &&
        sheet.clientCodeColDetails.colNumber > addressColNo2
      ) {
        sheet.clientCodeColDetails.colNumber -= colsDeleted;
        sheet.clientCodeColDetails.colLetter = colNumToLetter(sheet.clientCodeColDetails.colNumber);
      } else if (!(addressColNo1 > sheet.clientCodeColDetails.colNumber)) {
        sheet.clientCodeColDetails.deleted = true;
      }
      if (sheet.narrColDetails.colNumber > addressColNo1 && sheet.narrColDetails.colNumber > addressColNo2) {
        sheet.narrColDetails.colNumber -= colsDeleted;
        sheet.narrColDetails.colLetter = colNumToLetter(sheet.narrColDetails.colNumber);
      } else if (!(addressColNo1 > sheet.narrColDetails.colNumber)) {
        sheet.narrColDetails.deleted = true;
      }
      if (sheet.valueColDetails.colNumber > addressColNo1 && sheet.valueColDetails.colNumber > addressColNo2) {
        sheet.valueColDetails.colNumber -= colsDeleted;
        sheet.valueColDetails.colLetter = colNumToLetter(sheet.valueColDetails.colNumber);
      } else if (!(addressColNo1 > sheet.valueColDetails.colNumber)) {
        sheet.valueColDetails.deleted = true;
      }
      return;
    }
  });
};

export const handleRowInsertion = async (session, e, wsName) => {
  console.log(e);
  const addressSplit = e.address.split(":");
  const addressRowNo1 = parseInt(addressSplit[0]);
  const addressRowNo2 = parseInt(addressSplit[1]);
  const rowsInserted = addressRowNo2 - addressRowNo1 + 1;
  session.editableSheets.forEach((sheet) => {
    if (sheet.name === wsName) {
      if (addressRowNo1 <= sheet.protectedRange.firstRow) {
        sheet.protectedRange.firstRow += rowsInserted;
        sheet.protectedRange.lastRow += rowsInserted;
      } else if (addressRowNo1 <= sheet.protectedRange.lastRow) {
        sheet.protectedRange.lastRow += rowsInserted;
      }
      const newRowRanges = [];
      sheet.editableRowRanges.forEach((range) => {
        if (addressRowNo1 <= range.firstRow) {
          const newRange = { firstRow: range.firstRow + rowsInserted, lastRow: range.lastRow + rowsInserted };
          newRowRanges.push(newRange);
        } else if (addressRowNo1 > range.firstRow && addressRowNo1 <= range.lastRow) {
          const newRangeOne = { firstRow: range.firstRow, lastRow: addressRowNo1 - 1 };
          const newRangeTwo = { firstRow: addressRowNo2 + 1, lastRow: range.lastRow + rowsInserted };
          newRowRanges.push(newRangeOne);
          newRowRanges.push(newRangeTwo);
        } else newRowRanges.push(range);
      });
      sheet.editableRowRanges = newRowRanges;
      console.log(sheet);
      sheet.editButtonStatus === "hide" && cancelAutoFill(wsName, e.address);
      sheet.transactions.forEach((tran) => {
        if (tran.rowNumber >= addressRowNo1) tran.rowNumber += rowsInserted;
      });
      return;
    }
  });
  //transactions.forEach((tran) => {
  //  if (tran.rowNumber >= addressRowNo1) tran.rowNumber += rowsInserted;
  //});
  session.updatedTransactions.forEach((tran) => {
    if (tran.rowNumber >= addressRowNo1) tran.rowNumber += rowsInserted;
  });
};

export const handleRowDeletion = async (session, e, wsName) => {
  const addressSplit = e.address.split(":");
  const addressRowNo1 = parseInt(addressSplit[0]);
  const addressRowNo2 = parseInt(addressSplit[1]);
  const rowsDeleted = addressRowNo2 - addressRowNo1 + 1;
  session.editableSheets.forEach((sheet) => {
    if (sheet.name === wsName) {
      if (addressRowNo2 < sheet.protectedRange.firstRow) {
        sheet.protectedRange.firstRow -= rowsDeleted;
        sheet.protectedRange.lastRow -= rowsDeleted;
      } else if (
        addressRowNo1 <= sheet.protectedRange.firstRow &&
        addressRowNo2 >= sheet.protectedRange.firstRow &&
        addressRowNo2 < sheet.protectedRange.lastRow
      ) {
        sheet.protectedRange.firstRow -= addressRowNo2 - sheet.protectedRange.firstRow;
        sheet.protectedRange.lastRow -= rowsDeleted;
      } else if (addressRowNo1 > sheet.protectedRange.firstRow && addressRowNo2 < sheet.protectedRange.lastRow) {
        sheet.protectedRange.lastRow -= rowsDeleted;
      } else if (
        addressRowNo1 > sheet.protectedRange.firstRow &&
        addressRowNo1 <= sheet.protectedRange.lastRow &&
        addressRowNo2 >= sheet.protectedRange.lastRow
      ) {
        sheet.protectedRange.lastRow -= sheet.protectedRange.lastRow - (addressRowNo1 - 1);
      } else if (addressRowNo1 <= sheet.protectedRange.firstRow && addressRowNo2 >= sheet.protectedRange.lastRow) {
        sheet.protectedRangeDeleted = true;
        session.setEditButton("off");
        sheet.editButtonStatus = "off";
      }
      const newRowRanges = [];
      sheet.editableRowRanges.forEach((range) => {
        if (addressRowNo2 < range.firstRow) {
          const newRange = { firstRow: range.firstRow - rowsDeleted, lastRow: range.lastRow - rowsDeleted };
          newRowRanges.push(newRange);
        } else if (
          addressRowNo1 <= range.firstRow &&
          addressRowNo2 >= range.firstRow &&
          addressRowNo2 < range.lastRow
        ) {
          const newRange = { firstRow: addressRowNo1, lastRow: range.lastRow - rowsDeleted };
          newRowRanges.push(newRange);
        } else if (addressRowNo1 > range.firstRow && addressRowNo2 <= range.lastRow) {
          const newRange = { firstRow: range.firstRow, lastRow: range.lastRow - rowsDeleted };
          newRowRanges.push(newRange);
        } else if (addressRowNo1 > range.firstRow && addressRowNo1 <= range.lastRow && addressRowNo2 >= range.lastRow) {
          const newRange = { firstRow: range.firstRow, lastRow: range.lastRow - (addressRowNo1 - 1) };
          newRowRanges.push(newRange);
        } else if (addressRowNo1 > range.lastRow) {
          newRowRanges.push(range);
        }
      });
      sheet.editableRowRanges = newRowRanges;
      sheet.transactions.forEach((tran) => {
        if (tran.rowNumber > addressRowNo2) tran.rowNumber -= rowsDeleted;
      });
      return;
    }
  });
  session.updatedTransactions.forEach((tran) => {
    if (tran.rowNumber > addressRowNo2) tran.rowNumber -= rowsDeleted;
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

export const handleRowSort = async (session, e, wsName) => {
  console.log(e);
  console.log(session);
  const usedRange = await getWorksheetUsedRange(wsName);
  const colVals = {
    transNoVals: [],
    dateVals: [],
    transTypeVals: [],
    codeVals: [],
    clientCodeVals: [],
    narrativeVals: [],
    valueVals: [],
  };
  let colLocations;
  session.editableSheets.forEach((sheet) => {
    if (sheet.name === wsName) {
      colLocations = {
        transNoCol: sheet.transNoColDetails.colNumber,
        dateCol: sheet.dateColDetails.colNumber,
        transTypeCol: sheet.transTypeColDetails.colNumber,
        codeCol: sheet.codeColDetails.colNumber,
        clientCodeCol: sheet.clientCodeColDetails.colNumber,
        narrCol: sheet.narrColDetails.colNumber,
        valueCol: sheet.valueColDetails.colNumber,
      };
    }
  });
  usedRange.forEach((arr) => {
    arr.forEach((value, index) => {
      if (index + 1 === colLocations.transNoCol) colVals.transNoVals.push(value);
      if (index + 1 === colLocations.dateCol) colVals.dateVals.push(value);
      if (index + 1 === colLocations.transTypeCol) colVals.transTypeVals.push(value);
      if (index + 1 === colLocations.codeCol) colVals.codeVals.push(value);
      if (index + 1 === colLocations.clientCodeCol) colVals.clientCodeVals.push(value);
      if (index + 1 === colLocations.narrCol) colVals.narrativeVals.push(value);
      if (index + 1 === colLocations.valueCol) colVals.valueVals.push(value);
    });
  });
  const protectedRowNumbers = [];
  session.editableSheets.forEach((sheet) => {
    if (sheet.name === wsName) {
      sheet.rowsSorted = true;
      sheet.transactions.forEach((tran) => {
        colVals.transNoVals.forEach((val, index) => {
          if (val === tran.transactionNumber) {
            if (
              colVals.transTypeVals[index] === tran.transactionType &&
              (colVals.clientCodeVals[index] === tran.clientNominalCode ||
                (colVals.clientCodeVals[index] === "NA" && tran.clientNominalCode === -1)) &&
              (colVals.valueVals[index] * 100 === tran.value || colVals.valueVals[index] * -100 === tran.value)
            ) {
              tran.rowNumber = index + 1;
              protectedRowNumbers.push(index + 1);
            }
          }
        });
      });
      protectedRowNumbers.sort((a, b) => {
        return a - b;
      });
      let rangeObjs = [];
      const indices = [];
      let count = protectedRowNumbers[0];
      protectedRowNumbers.forEach((rowNumber, index) => {
        if (index > 0) {
          if (rowNumber !== count + 1) {
            indices.push(index);
          }
          count = rowNumber;
        }
      });
      indices.push(protectedRowNumbers.length);
      let firstRow = protectedRowNumbers[0];
      indices.forEach((index) => {
        const rangeObj = {
          firstRow,
          lastRow: protectedRowNumbers[index - 1],
        };
        rangeObjs.push(rangeObj);
        firstRow = protectedRowNumbers[index];
      });
      sheet.editableRowRanges = rangeObjs;
    }
  });
  //protectedRowNumbers.sort((a, b) => {
  //  return a - b;
  //});
  //let rangeObjs = [];
  //const indices = [];
  //let count = protectedRowNumbers[0];
  //protectedRowNumbers.forEach((rowNumber, index) => {
  //  if (index > 0) {
  //    if (rowNumber !== count + 1) {
  //      indices.push(index);
  //    }
  //    count = rowNumber;
  //  }
  //});
  //indices.push(protectedRowNumbers.length);
  //let firstRow = protectedRowNumbers[0];
  //indices.forEach((index) => {
  //  const rangeObj = {
  //    firstRow,
  //    lastRow: protectedRowNumbers[index - 1],
  //  };
  //  rangeObjs.push(rangeObj);
  //  firstRow = protectedRowNumbers[index];
  //});
};

export const checkEditMode = (session, wsName) => {
  let editModeEnabled = false;
  session.editableSheets.forEach((sheet) => {
    if (sheet.name === wsName) {
      console.log(sheet);
      if (sheet.editButtonStatus === "hide") editModeEnabled = true;
    }
  });
  return editModeEnabled;
};

export const rejectChanges = async (session, e, wsName, editModeEnabled) => {
  console.log(session);
  const eRowNumber = parseInt(e.address[1]) ? parseInt(e.address.substr(1)) : parseInt(e.address.substr(2));
  let changeRejected;
  let withinProtectedRange = false;
  for (let i = 0; i < session.editableSheets.length; i++) {
    if (session.editableSheets[i].name === wsName) {
      changeRejected = session.editableSheets[i].changeRejected;
      session.editableSheets[i].changeRejected = !session.editableSheets[i].changeRejected;
      const change = determineChangeType(session.editableSheets[i], e.address);
      if ((change && !editModeEnabled) || change === "other") {
        session.editableSheets[i].editableRowRanges.forEach((range) => {
          if (eRowNumber >= range.firstRow && eRowNumber <= range.lastRow) withinProtectedRange = true;
        });
      }
    }
    console.log(withinProtectedRange);
    console.log(changeRejected);
    if (withinProtectedRange && !changeRejected) {
      console.log("triggered here");
      const range = `${e.address}:${e.address}`;
      await setExcelRangeValue(wsName, range, e.details.valueBefore);
    } else {
      if (session.editableSheets[i].changeRejected)
        session.editableSheets[i].changeRejected = !session.editableSheets[i].changeRejected;
    }
  }
};

export const checkForAutoFill = (e) => {
  console.log(e);
  const autoFillObj = { autoFill: false };
  const addressSplit = e.address.split(":");
  if (!addressSplit[1]) return autoFillObj;
  autoFillObj.autoFill = true;
  console.log(addressSplit);
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

//export const queueChanges = (session, e, transactions, wsName) => {
//  console.log(e);
//  console.log(transactions);
//  const eRowNumber = parseInt(e.address[1]) ? parseInt(e.address.substr(2)) : parseInt(e.address.substr(1));
//  let tran;
//  transactions.forEach((line) => {
//    if (line.rowNumber === eRowNumber) tran = line;
//  });
//  const sheets = session.editableSheets;
//  sheets.forEach((sheet) => {
//    if (sheet.name === wsName) {
//      const change = determineChangeType(sheet, e.address);
//      const isValid = validateChange(session, tran, change, e);
//      console.log(isValid);
//      let updated = false;
//      sheet.queuedTransUpdates.forEach((queuedTran) => {
//        if (queuedTran.transactionId === tran._id) {
//          queuedTran[change] = e.details.valueAfter;
//          updated = true;
//        }
//      });
//      if (!updated) {
//        const queuedTran: {
//          transactionId: string;
//          updatedCode?: number;
//          updatedDate?: number;
//          updatedNarrative?: string;
//        } = { transactionId: tran._id, [change]: e.details.valueAfter };
//        sheet.queuedTransUpdates.push(queuedTran);
//      }
//      console.log(sheet);
//    }
//  });
//  session.editableSheets = sheets;
//};

export const captureReanalysis = async (session, e, wsName) => {
  const eRowNumber = parseInt(e.address[1]) ? parseInt(e.address.substr(1)) : parseInt(e.address.substr(2));
  let tran;
  let changeRejected = false;
  let isValid = false;
  let isNotNegation = true;
  session.editableSheets.forEach((sheet) => {
    if (sheet.name === wsName) {
      sheet.transactions.forEach((line) => {
        if (line.rowNumber === eRowNumber) tran = line;
      });
      const change = determineChangeType(sheet, e.address);
      const { isError, isInvalid, isNegation } = validateChange(session, tran, change, e);
      isNotNegation = !isNegation;
      changeRejected = isInvalid;
      if (!isError && !isInvalid) {
        let updated = false;
        let newArray = [];
        session.updatedTransactions.forEach((updatedTran) => {
          if (updatedTran.transactionId === tran._id) {
            isValid = true;
            updated = true;
            if (isNegation) {
              if (change === "updatedCode") {
                if (updatedTran.updatedDate || updatedTran.updatedNarrative) {
                  delete updatedTran[change];
                  newArray.push(updatedTran);
                }
              }
              if (change === "updatedDate") {
                if (updatedTran.updatedCode || updatedTran.updatedNarrative) {
                  delete updatedTran[change];
                  newArray.push(updatedTran);
                }
              }
              if (change === "updatedNarrative") {
                if (updatedTran.updatedCode || updatedTran.updatedDate) {
                  delete updatedTran[change];
                  newArray.push(updatedTran);
                }
              }
            } else {
              updatedTran[change] = e.details.valueAfter;
              newArray.push(updatedTran);
            }
          } else newArray.push(updatedTran);
        });
        if (!updated && !isNegation) {
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
            [change]: e.details.valueAfter,
          };
          newArray.push(updatedTran);
          isValid = true;
        }
        session.updatedTransactions = newArray;
      }
    }
  });
  const range = `${e.address}:${e.address}`;
  if (changeRejected) {
    console.log("triggered here");
    await setExcelRangeValue(wsName, range, e.details.valueBefore);
  }
  if (isValid) {
    const color = isNotNegation ? "lightGreen" : "yellow";
    highlightRanges(wsName, [range], color);
    if (!session.nextView) session.nextView = session.currentView;
    const view = session.updatedTransactions.length > 0 ? "handleTransUpdates" : session.nextView;
    session.handleView(view);
  }
};

export const determineChangeType = (sheet, address) => {
  const addressCol = parseInt(address[1]) ? address.substr(0, 1) : address.substr(0, 2);
  let type;
  if (addressCol === sheet.codeColDetails.colLetter) {
    type = "updatedCode";
  } else if (addressCol === sheet.dateColDetails.colLetter) {
    type = "updatedDate";
  } else if (addressCol === sheet.narrColDetails.colLetter) {
    type = "updatedNarrative";
  } else if (
    addressCol === sheet.transNoColDetails.colLetter ||
    addressCol === sheet.transTypeColDetails.colLetter ||
    addressCol === sheet.clientCodeColDetails.colLetter ||
    addressCol === sheet.valueColDetails.colLetter
  ) {
    type = "other";
  }
  return type;
};

export const validateChange = (session, tran, change, e) => {
  const obj = { isNegation: false, isInvalid: false, isError: false };
  if (change === "updatedCode") {
    if (e.details.valueAfter === tran.cerysCode) obj.isNegation = true;
    let inValidCode = true;
    session.chart.forEach((code) => {
      if (code.cerysCode === e.details.valueAfter) inValidCode = false;
    });
    obj.isInvalid = inValidCode;
  } else if (change === "updatedDate") {
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
  } else if (change === "updatedNarrative") {
    if (e.details.valueAfter === tran.narrative) obj.isNegation = true;
  } else obj.isError = true;
  return obj;
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
  session["updatedTransactions"].forEach((tran) => {
    tran.mongoDate = tran.updatedDate && convertExcelDate(tran.updatedDate);
    if (tran.updatedCode) {
      tbUpdated = true;
      session["chart"].forEach((code) => {
        if (code.cerysCode === tran.updatedCode) tran.cerysCodeObject = code;
      });
    }
  });
  const options = fetchOptionsTransBatchUpdate(session);
  const updatedCustAndAssDB = await fetch(updateTransactionBatch, options);
  const updatedCustAndAss = await updatedCustAndAssDB.json();
  session["customer"] = updatedCustAndAss.customer;
  session["activeAssignment"] = updatedCustAndAss.assignment;
  session["updatedTransactions"] = [];
  tbUpdated ? updateAssignmentFigures(session) : callNextView(session);
};

export const reverseTransactionUpdates = async (session) => {
  const reversals = [];
  const updatedTrans = session.updatedTransactions;
  updatedTrans.forEach((tran) => {
    const wsName = tran.worksheetName;
    let ws;
    session.editableSheets.forEach((sheet) => {
      if (sheet.name === wsName) ws = sheet;
    });
    if (tran.updatedCode) {
      const address = `${ws.codeColDetails.colLetter}${tran.rowNumber}:${ws.codeColDetails.colLetter}${tran.rowNumber}`;
      const reversal = { wsName, address, value: tran.code };
      reversals.push(reversal);
    }
    if (tran.updatedDate) {
      const address = `${ws.dateColDetails.colLetter}${tran.rowNumber}:${ws.dateColDetails.colLetter}${tran.rowNumber}`;
      const reversal = { wsName, address, value: tran.dateExcel };
      reversals.push(reversal);
    }
    if (tran.updatedNarrative) {
      const address = `${ws.narrColDetails.colLetter}${tran.rowNumber}:${ws.narrColDetails.colLetter}${tran.rowNumber}`;
      const reversal = { wsName, address, value: tran.narrative };
      reversals.push(reversal);
    }
  });
  await setManyWorksheetRangeValues(reversals);
  await resetEditableRanges(session, reversals);
};

export const resetEditableRanges = async (session, updates) => {
  await Excel.run(async (context) => {
    updates.forEach((update) => {
      session.editableSheets.forEach((sheet) => {
        if (sheet.name === update.wsName && sheet.editButtonStatus === "hide") {
          const ws = context.workbook.worksheets.getItem(update.wsName);
          const range = ws.getRange(update.address);
          range.format.fill.color = "yellow";
        }
      });
    });
    await context.sync();
  });
};

export const simulateAutoFillChanges = async (session, e, wsName, autoFillObj) => {
  console.log(session);
  console.log(e);
  console.log(wsName);
  console.log(autoFillObj);
  let sheet;
  session.editableSheets.forEach((ws) => {
    if (ws.name === wsName) sheet = ws;
  });
  const ranges = [];
  if (autoFillObj.autoFillCols) {
    for (let i = autoFillObj.firstColNumber; i < autoFillObj.lastColNumber + 1; i++) {
      const rangeObj = { colNumber: i, rowNumber: autoFillObj.firstRow, column: "" };
      if (sheet.transNoColDetails.colNumber === i) {
        rangeObj.column = "transNo";
      } else if (sheet.dateColDetails.colNumber === i) {
        rangeObj.column = "date";
      } else if (sheet.transTypeColDetails.colNumber === i) {
        rangeObj.column = "transType";
      } else if (sheet.codeColDetails.colNumber === i) {
        rangeObj.column = "code";
      } else if (sheet.clientCodeColDetails.colNumber === i) {
        rangeObj.column = "clientCode";
      } else if (sheet.narrColDetails.colNumber === i) {
        rangeObj.column = "narrative";
      } else if (sheet.valueColDetails.colNumber === i) {
        rangeObj.column = "value";
      }
      ranges.push(rangeObj);
    }
  } else if (autoFillObj.autoFillRows) {
    let column = "";
    if (sheet.transNoColDetails.colNumber === autoFillObj.firstColNumber) {
      column = "transNo";
    } else if (sheet.dateColDetails.colNumber === autoFillObj.firstColNumber) {
      column = "date";
    } else if (sheet.transTypeColDetails.colNumber === autoFillObj.firstColNumber) {
      column = "transType";
    } else if (sheet.codeColDetails.colNumber === autoFillObj.firstColNumber) {
      column = "code";
    } else if (sheet.clientCodeColDetails.colNumber === autoFillObj.firstColNumber) {
      column = "clientCode";
    } else if (sheet.narrColDetails.colNumber === autoFillObj.firstColNumber) {
      column = "narrative";
    } else if (sheet.valueColDetails.colNumber === autoFillObj.firstColNumber) {
      column = "value";
    }
    for (let i = autoFillObj.firstRow; i < autoFillObj.lastRow + 1; i++) {
      const rangeObj = { colNumber: autoFillObj.firstColNumber, rowNumber: i, column };
      ranges.push(rangeObj);
    }
  }
  ranges.forEach((range) => {
    session.updatedTransactions.forEach((update) => {
      if (range.rowNumber === update.rowNumber) {
        if (range.column === "code" && update.updatedCode) range.valueBefore = update.updatedCode;
        if (range.column === "date" && update.updatedDate) range.valueBefore = update.updatedDate;
        if (range.column === "narrative" && update.updatedNarrative) range.valueBefore = update.updatedNarrative;
      }
    });
    !range.valueBefore &&
      sheet.transactions.forEach((tran) => {
        if (range.rowNumber === tran.rowNumber) {
          if (range.column === "transNo") range.valueBefore = tran.transactionNumber;
          if (range.column === "date") range.valueBefore = tran.transactionDateExcel;
          if (range.column === "transType") range.valueBefore = tran.transactionType;
          if (range.column === "code") range.valueBefore = tran.cerysCode;
          if (range.column === "clientCode") range.valueBefore = tran.clientNominalCode;
          if (range.column === "narrative") range.valueBefore = tran.narrative;
          if (range.column === "value") range.valueBefore = tran.value;
        }
      });
  });
  console.log(ranges);
  for (let i = 0; i < ranges.length; i++) {
    const valueAfterRange = `${colNumToLetter(ranges[i].colNumber)}${ranges[i].rowNumber}`;
    const valueAfter = await getWorksheetRangeValues(wsName, valueAfterRange);
    const event = {
      address: `${colNumToLetter(ranges[i].colNumber)}${ranges[i].rowNumber}`,
      details: { valueBefore: ranges[i].valueBefore, valueAfter: valueAfter[0][0] },
    };
    handleWorksheetEdit(session, event, wsName);
  }
};
