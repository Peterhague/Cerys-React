import { colLetterToNum, colNumToLetter } from "./excel-col-conversion";
import { callNextView, resetActiveJournal } from "./helperFunctions";
import { getActiveWorksheetName } from "./worksheet";

export const handleWorksheetEdit = (session, e, transactions) => {
  if (e.changeType === "ColumnInserted") {
    handleColumnInsertion(session, e);
    return;
  }
  captureReanalysis(session, e, transactions);
};

export const handleColumnInsertion = async (session, e) => {
  console.log(e);
  const addressSplit = e.address.split(":");
  const addressColNo1 = colLetterToNum(addressSplit[0]);
  const addressColNo2 = colLetterToNum(addressSplit[1]);
  const colsInserted = addressColNo2 - addressColNo1 + 1;
  const wsName = await getActiveWorksheetName();
  session.editableSheets.forEach((sheet) => {
    if (sheet.name === wsName) {
      const dateRangeSplit = sheet.activeDateDetails.range.split(":");
      const dateColRefLength = parseInt(sheet.activeDateDetails.range[1]) ? 1 : 2;
      let dateColNo =
        dateColRefLength === 1
          ? colLetterToNum(sheet.activeDateDetails.range[0])
          : colLetterToNum(sheet.activeDateDetails.range[0] + sheet.activeDateDetails.range[1]);
      if (dateColNo >= addressColNo1) {
        dateColNo += colsInserted;
        const newDateColRef = colNumToLetter(dateColNo);
        const newDateRange = `${newDateColRef}${dateRangeSplit[0].slice(dateColRefLength)}:${newDateColRef}${dateRangeSplit[1].slice(dateColRefLength)}`;
        sheet.activeDateDetails.range = newDateRange;
      }
      const arr = [];
      sheet.activeEditableRanges.forEach((range) => {
        const rangeSplit = range.split(":");
        const colRefLength = parseInt(range[1]) ? 1 : 2;
        let colNo = colRefLength === 1 ? colLetterToNum(range[0]) : colLetterToNum(range[0] + range[1]);
        if (colNo >= addressColNo1) colNo += colsInserted;
        const newColRef = colNumToLetter(colNo);
        const newRange = `${newColRef}${rangeSplit[0].slice(colRefLength)}:${newColRef}${rangeSplit[1].slice(colRefLength)}`;
        arr.push(newRange);
      });
      sheet.activeEditableRanges = arr;
      return;
    }
  });
  console.log(session);
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

export const captureReanalysis = (session, e, transactions) => {
  console.log(e);
  if (e.details.valueBefore === e.details.valueAfter) return;
  const eRowNumber = parseInt(e.address.substr(1));
  let tran;
  transactions.forEach((line) => {
    if (line.rowNumber === eRowNumber) tran = line;
  });
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
