import { colLetterToNum, colNumToLetter } from "./excel-col-conversion";
import { callNextView, resetActiveJournal } from "./helperFunctions";
import { getActiveWorksheet, getActiveWorksheetName, getWorksheetUsedRange, setExcelRangeValue } from "./worksheet";

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
    console.log(editModeEnabled);
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
    if (tran.rowNumber < addressRowNo2) tran.rowNumber += rowsDeleted;
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
  const eRowNumber = parseInt(e.address[1]) ? parseInt(e.address.substr(1)) : parseInt(e.address.substr(2));
  console.log(eRowNumber);
  const sheets = session.editableSheets;
  let changeRejected;
  let withinProtectedRange = false;
  sheets.forEach((sheet) => {
    if (sheet.name === wsName) {
      changeRejected = sheet.changeRejected;
      sheet.changeRejected = !sheet.changeRejected;
      const change = determineChangeType(sheet, e.address);
      if (change) {
        sheet.editableRowRanges.forEach((range) => {
          console.log(range);
          if (eRowNumber >= range.firstRow || eRowNumber <= range.lastRow) withinProtectedRange = true;
        });
      }
    }
  });
  console.log(withinProtectedRange);
  console.log(sheets);
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

export const captureReanalysis = (session, e, transactions, wsName) => {
  console.log(e);
  console.log(transactions);
  const eRowNumber = parseInt(e.address[1]) ? parseInt(e.address.substr(1)) : parseInt(e.address.substr(2));
  let tran;
  transactions.forEach((line) => {
    if (line.rowNumber === eRowNumber) tran = line;
  });
  const sheets = session.editableSheets;
  sheets.forEach((sheet) => {
    if (sheet.name === wsName) {
      const change = determineChangeType(sheet, e.address);
      const isValid = validateChange(session, tran, change, e);
      console.log(isValid);
      let updated = false;
      sheet.updatedTransactions.forEach((updatedTran) => {
        if (updatedTran.transactionId === tran._id) {
          updatedTran[change] = e.details.valueAfter;
          updated = true;
        }
      });
      if (!updated) {
        const updatedTran: {
          transactionId: string;
          updatedCode?: number;
          updatedDate?: number;
          updatedNarrative?: string;
        } = { transactionId: tran._id, [change]: e.details.valueAfter };
        sheet.updatedTransactions.push(updatedTran);
      }
      console.log(sheet);
    }
  });
  session.editableSheets = sheets;
  if (e.details.valueBefore === e.details.valueAfter) return;
  let validCode = false;
  session.chart.forEach((code) => {
    if (code.cerysCode === e.details.valueAfter) validCode = true;
  });
  if (validCode) buildReanalysisJnls(session, e, tran);
  if (!session.nextView) session.nextView = session.currentView;
  if (session.activeJournal.journals.length === 0) {
    resetActiveJournal(session);
    callNextView(session);
  } else {
    session.handleView("handleTransUpdates");
  }
};

export const determineChangeType = (sheet, address) => {
  const addressCol = parseInt(address[1]) ? address.substr(0, 1) : address.substr(0, 2);
  console.log(addressCol);
  console.log(sheet);
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
  if (change === "updatedCode") {
    if (e.details.valueAfter === tran.cerysCode) return false;
    let validCode = false;
    session.chart.forEach((code) => {
      if (code.cerysCode === e.details.valueAfter) validCode = true;
    });
    return validCode;
  } else if (change === "updatedDate") {
    if (typeof e.details.valueAfter !== "number") return false;
    if (e.details.valueAfter === tran.transactionDateExcel) return false;
    if (e.details.valueAfter > session.activeAssignment.reportingPeriod.reportingDateExcel) {
      return false;
    } else if (
      e.details.valueAfter <=
      session.activeAssignment.reportingPeriod.reportingDateExcel - session.activeAssignment.reportingPeriod.noOfDays
    ) {
      return false;
    } else return true;
  } else if (change === "updatedNarrative") {
    if (e.details.valueAfter === tran.narrative) return false;
    return true;
  } else return false;
};

export const buildReanalysisJnls = (session, e, tran) => {
  console.log(tran);
  session.activeJournal.journalType = "reanalysis";
  session.activeJournal.journal = false;
  const checkedJournals = [];
  session.activeJournal.journals.forEach((jnl) => {
    if (jnl.transactionId !== tran._id) {
      checkedJournals.push(jnl);
    }
  });
  if (e.details.valueAfter !== tran.cerysCode) {
    const value = tran.value;
    const valueNegative = tran.value * -1;
    let cerysObject1;
    session.chart.forEach((code) => {
      if (code.cerysCode === tran.cerysCode) cerysObject1 = code;
    });
    const narrative1 = `Reposted to NC${e.details.valueAfter}: ${tran.narrative}`;
    const transactionDate = tran.transactionDate;
    const jnlDtls1 = {
      ...cerysObject1,
      value: valueNegative,
      narrative: tran.narrative,
      origNarrative: tran.narrative,
      newNarrative: narrative1,
      transactionDate,
      transactionId: tran._id,
      rowNumberIndex: tran.rowNumber * 10,
    };
    checkedJournals.push(jnlDtls1);
    let cerysObject2;
    session.chart.forEach((code) => {
      if (code.cerysCode === e.details.valueAfter) cerysObject2 = code;
    });
    const narrative2 = `Reposted from NC${tran.cerysCode}: ${tran.narrative}`;
    const jnlDtls2 = {
      ...cerysObject2,
      value,
      narrative: tran.narrative,
      origNarrative: tran.narrative,
      newNarrative: narrative2,
      transactionDate,
      transactionId: tran._id,
      rowNumberIndex: tran.rowNumber * 10 + 1,
    };
    checkedJournals.push(jnlDtls2);
  }
  session.activeJournal.journals = checkedJournals;
  console.log(session.activeJournal);
};

export const cancelAutoFill = async (wsName, address) => {
  await Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getItem(wsName);
    const range = sheet.getRange(address);
    range.format.fill.clear();
    await context.sync();
  });
};
