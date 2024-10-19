import { updateTransactionBatch } from "../fetching/apiEndpoints";
import { fetchOptionsTransBatchUpdate } from "../fetching/generateOptions";
import { colLetterToNum, colNumToLetter } from "./excel-col-conversion";
import { callNextView, convertExcelDate, updateAssignmentFigures } from "./helperFunctions";
import {
  getActiveWorksheet,
  getActiveWorksheetName,
  getWorksheetUsedRange,
  setExcelRangeValue,
  setManyExcelRangeValues,
  setManyWorksheetRangeValues,
} from "./worksheet";

export const handleWorksheetEdit = (session, e, transactions, wsName) => {
  console.log("triggered");
  if (e.changeType === "ColumnInserted") {
    handleColumnInsertion(session, e, wsName);
    return;
  } else if (e.changeType === "ColumnDeleted") {
    handleColumnDeletion(session, e, wsName);
  } else if (e.changeType === "RowInserted") {
    handleRowInsertion(session, e, transactions, wsName);
  } else if (e.changeType === "RowDeleted") {
    handleRowDeletion(session, e, transactions, wsName);
  } else {
    const editModeEnabled = checkEditMode(session, wsName);
    !editModeEnabled && rejectChanges(session, e, wsName);
    editModeEnabled && captureReanalysis(session, e, transactions, wsName);
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
      if (sheet.dateColDetails.colNumber >= addressColNo1) {
        sheet.dateColDetails.colNumber += colsInserted;
        sheet.dateColDetails.colLetter = colNumToLetter(sheet.dateColDetails.colNumber);
      }
      if (sheet.codeColDetails.colNumber >= addressColNo1) {
        sheet.codeColDetails.colNumber += colsInserted;
        sheet.codeColDetails.colLetter = colNumToLetter(sheet.codeColDetails.colNumber);
      }
      if (sheet.narrColDetails.colNumber >= addressColNo1) {
        sheet.narrColDetails.colNumber += colsInserted;
        sheet.narrColDetails.colLetter = colNumToLetter(sheet.narrColDetails.colNumber);
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
      console.log(sheet);
      if (sheet.dateColDetails.colNumber > addressColNo1 && sheet.dateColDetails.colNumber > addressColNo2) {
        sheet.dateColDetails.colNumber -= colsDeleted;
        sheet.dateColDetails.colLetter = colNumToLetter(sheet.dateColDetails.colNumber);
      } else if (!(addressColNo1 > sheet.dateColDetails.colNumber)) {
        sheet.dateColDetails.deleted = true;
      }
      if (sheet.codeColDetails.colNumber > addressColNo1 && sheet.codeColDetails.colNumber > addressColNo2) {
        sheet.codeColDetails.colNumber -= colsDeleted;
        sheet.codeColDetails.colLetter = colNumToLetter(sheet.codeColDetails.colNumber);
      } else if (!(addressColNo1 > sheet.codeColDetails.colNumber)) {
        sheet.codeColDetails.deleted = true;
      }
      if (sheet.narrColDetails.colNumber > addressColNo1 && sheet.narrColDetails.colNumber > addressColNo2) {
        sheet.narrColDetails.colNumber -= colsDeleted;
        sheet.narrColDetails.colLetter = colNumToLetter(sheet.narrColDetails.colNumber);
      } else if (!(addressColNo1 > sheet.narrColDetails.colNumber)) {
        sheet.narrColDetails.deleted = true;
      }
      return;
    }
  });
};

export const handleRowInsertion = async (session, e, transactions, wsName) => {
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
      return;
    }
  });
  transactions.forEach((tran) => {
    if (tran.rowNumber >= addressRowNo1) tran.rowNumber += rowsInserted;
  });
  session.updatedTransactions.forEach((tran) => {
    if (tran.rowNumber >= addressRowNo1) tran.rowNumber += rowsInserted;
  });
  console.log(transactions);
};

export const handleRowDeletion = async (session, e, transactions, wsName) => {
  console.log(e);
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
        console.log("correct branch");
        sheet.protectedRange.lastRow -= sheet.protectedRange.lastRow - (addressRowNo1 - 1);
      } else if (addressRowNo1 <= sheet.protectedRange.firstRow && addressRowNo2 >= sheet.protectedRange.lastRow) {
        console.log("null!!!");
        sheet.protectedRangeDeleted = true;
        session.setEditButton("off");
        sheet.editButtonStatus = "off";
      }
      console.log(sheet);
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
      return;
    }
  });
  transactions.forEach((tran) => {
    if (tran.rowNumber > addressRowNo2) tran.rowNumber -= rowsDeleted;
  });
  session.updatedTransactions.forEach((tran) => {
    if (tran.rowNumber > addressRowNo2) tran.rowNumber -= rowsDeleted;
  });
  console.log(transactions);
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

export const handleRowSort = async (session, e, transactions) => {
  console.log(e);
  const ws = await getActiveWorksheet();
  const wsName = ws.name;
  const usedRange = await getWorksheetUsedRange(wsName);
  const colAVals = [];
  usedRange.forEach((arr) => {
    colAVals.push(arr[0]);
  });
  transactions.forEach((tran) => {
    colAVals.forEach((value, index) => {
      if (tran.transactionNumber === value) {
        tran.rowNumber = index + 1;
      }
    });
  });
  console.log(usedRange);
  console.log(transactions);
  session.editableSheets.forEach((sheet) => {
    if (sheet.name === wsName) sheet.rowsSorted = true;
  });
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

export const rejectChanges = async (session, e, wsName) => {
  console.log(session);
  const eRowNumber = parseInt(e.address[1]) ? parseInt(e.address.substr(1)) : parseInt(e.address.substr(2));
  let changeRejected;
  let withinProtectedRange = false;
  session.editableSheets.forEach((sheet) => {
    if (sheet.name === wsName) {
      changeRejected = sheet.changeRejected;
      sheet.changeRejected = !sheet.changeRejected;
      const change = determineChangeType(sheet, e.address);
      if (change) {
        sheet.editableRowRanges.forEach((range) => {
          if (eRowNumber >= range.firstRow || eRowNumber <= range.lastRow) withinProtectedRange = true;
        });
      }
    }
  });
  const range = `${e.address}:${e.address}`;
  if (withinProtectedRange && !changeRejected) await setExcelRangeValue(wsName, range, e.details.valueBefore);
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

export const captureReanalysis = async (session, e, transactions, wsName) => {
  console.log(e);
  console.log(transactions);
  const eRowNumber = parseInt(e.address[1]) ? parseInt(e.address.substr(1)) : parseInt(e.address.substr(2));
  let tran;
  transactions.forEach((line) => {
    if (line.rowNumber === eRowNumber) tran = line;
  });
  let changeRejected = false;
  let isValid = false;
  session.editableSheets.forEach((sheet) => {
    if (sheet.name === wsName) {
      const change = determineChangeType(sheet, e.address);
      const { isError, isInvalid, isNegation } = validateChange(session, tran, change, e);
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
  if (changeRejected) {
    const range = `${e.address}:${e.address}`;
    await setExcelRangeValue(wsName, range, e.details.valueBefore);
  }
  if (isValid) {
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

//export const buildReanalysisJnls = (session, e, updatedTransactions) => {
//  console.log(updatedTransactions);
//  session.activeJournal.journalType = "reanalysis";
//  session.activeJournal.journal = false;
//  //const checkedJournals = [];
//  //session.activeJournal.journals.forEach((jnl) => {
//  //  if (jnl.transactionId !== tran._id) {
//  //    checkedJournals.push(jnl);
//  //  }
//  //});
//  //if (e.details.valueAfter !== tran.cerysCode) {
//  updatedTransactions.forEach((tran) => {
//    const value = tran.value;
//    const valueNegative = tran.value * -1;
//    let cerysObject1;
//    session.chart.forEach((code) => {
//      if (code.cerysCode === tran.code) cerysObject1 = code;
//    });
//    const narrative1 = `Reposted to NC${tran.updatedCode}: ${tran.narrative}`;
//    const transactionDate = tran.updatedDate ? tran.updatedDate : tran.date;
//    const jnlDtls1 = {
//      ...cerysObject1,
//      value: valueNegative,
//      narrative: tran.narrative,
//      origNarrative: tran.narrative,
//      newNarrative: narrative1,
//      transactionDate,
//      transactionId: tran.transactionId,
//    };
//    let cerysObject2;
//    session.chart.forEach((code) => {
//      if (code.cerysCode === tran.updatedCode) cerysObject2 = code;
//    });
//    const narrative2 = `Reposted from NC${tran.code}: ${tran.narrative}`;
//    const jnlDtls2 = {
//      ...cerysObject2,
//      value,
//      narrative: tran.narrative,
//      origNarrative: tran.narrative,
//      newNarrative: narrative2,
//      transactionDate,
//      transactionId: tran._id,
//    };
//  });
//  console.log(session.activeJournal);
//};

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
};
