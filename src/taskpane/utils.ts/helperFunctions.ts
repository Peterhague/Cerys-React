import { updateAssignmentUrl } from "../fetching/apiEndpoints";
import { fetchOptionsUpdateAssignment } from "../fetching/generateOptions";
import { getActiveWorksheetName, highlightEditableRanges, unhighlightEditableRanges } from "./worksheet";

export function populateUser(session: { [x: string]: { [x: string]: any[] } }, userId: any) {
  let userObj: any;
  session["customer"]["users"].forEach((user: { _id: any }) => {
    if (user._id === userId) userObj = user;
  });
  return userObj;
}

export async function updateAssignmentDb(
  session: { activeAssignment: { _id: any }; customer: { _id: any } },
  target: any
) {
  const workbookId = session.activeAssignment._id;
  const customerId = session.customer._id;
  const options = fetchOptionsUpdateAssignment(customerId, workbookId, target);
  const updatedCustAndAssDb = await fetch(updateAssignmentUrl, options);
  const updatedCustAndAss = await updatedCustAndAssDb.json();
  return updatedCustAndAss;
}

export function updateNomCode(e: { details: { valueAfter: any } }, transToPost: any[], eRowNumber: number) {
  const updatedTransToPost = [];
  transToPost.forEach((i: { rowNumber: any; cerysCode: any }) => {
    if (i.rowNumber === eRowNumber) {
      i.cerysCode = e.details.valueAfter;
      updatedTransToPost.push(i);
    } else {
      updatedTransToPost.push(i);
    }
  });
  return updatedTransToPost;
}

export const resetActiveJournal = (session) => {
  const activeJournal = { clientTB: false, journal: true, journalType: "journal", netValue: 0, journals: [] };
  session.activeJournal = activeJournal;
};

export const callNextView = (session) => {
  session.handleView(session.nextView);
  session.nextView = "";
};

export const convertMongoDate = (date) => {
  const dateString = date.split("T");
  const dateSplit = dateString[0].split("-");
  const convertedDate = `${dateSplit[2]}/${dateSplit[1]}/${dateSplit[0]}`;
  return convertedDate;
};

export const convertValueToString = (value) => {
  const valueChecked = value < 0 ? value * -1 : value;
  const string = valueChecked.toString();
  const insertionIndex = string.length - 2;
  const newString = string.substring(0, insertionIndex) + "." + string.substring(insertionIndex);
  return newString;
};

export const calculateExcelDate = (inputDate) => {
  const date = new Date(inputDate);
  const baseDate = new Date("1899-12-30");
  const utc1 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const utc2 = Date.UTC(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  const timeDiff = Math.abs(utc2 - utc1);
  const excelDate = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  return excelDate;
};

export const convertExcelDate = (excelDate) => {
  const baseDate = new Date("1899-12-30");
  const convertedDate = new Date(baseDate.getTime() + excelDate * 24 * 60 * 60 * 1000);
  const rawMonth = convertedDate.getMonth() + 1;
  const month = rawMonth > 9 ? rawMonth : `0${rawMonth}`;
  const rawDate = convertedDate.getDate();
  const date = rawDate < 10 ? `0${rawDate}` : rawDate;
  const mongoDate = `${convertedDate.getFullYear()}-${month}-${date}`;
  console.log(mongoDate);
  return mongoDate;
};

export const calculateDiffInDays = (inputDate1, inputDate2) => {
  console.log(inputDate1);
  console.log(inputDate2);
  const date1 = new Date(inputDate1);
  const date2 = new Date(inputDate2);
  const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
  const timeDiff = utc2 - utc1;
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  return daysDiff;
};

export const colNumToLetter = (numberCols) => {
  switch (numberCols) {
    case 1:
      return "A";
    case 2:
      return "B";
    case 3:
      return "C";
    case 4:
      return "D";
    case 5:
      return "E";
    case 6:
      return "F";
    case 7:
      return "G";
    case 8:
      return "H";
    case 9:
      return "I";
    case 10:
      return "J";
    case 11:
      return "K";
    case 12:
      return "L";
    case 13:
      return "M";
    case 14:
      return "N";
    case 15:
      return "O";
    case 16:
      return "P";
    case 17:
      return "Q";
    case 18:
      return "R";
    case 19:
      return "S";
    case 20:
      return "T";
    case 21:
      return "U";
    case 22:
      return "V";
    case 23:
      return "W";
    case 24:
      return "X";
    case 25:
      return "Y";
    case 26:
      return "Z";
    case 27:
      return "AA";
    case 28:
      return "AB";
    case 29:
      return "AC";
    case 30:
      return "AD";
    case 31:
      return "AE";
    case 32:
      return "AF";
    case 33:
      return "AG";
    case 34:
      return "AH";
    case 35:
      return "AI";
    case 36:
      return "AJ";
    case 37:
      return "AK";
    case 38:
      return "AL";
    case 39:
      return "AM";
    case 40:
      return "AN";
    case 41:
      return "AO";
    case 42:
      return "AP";
    case 43:
      return "AQ";
    case 44:
      return "AR";
    case 45:
      return "AS";
    case 46:
      return "AT";
    case 47:
      return "AU";
    case 48:
      return "AV";
    case 49:
      return "AW";
    case 50:
      return "AX";
    case 51:
      return "AY";
    case 52:
      return "AZ";
    case 53:
      return "BA";
    case 54:
      return "BB";
    case 55:
      return "BC";
    case 56:
      return "BD";
    case 57:
      return "BE";
    case 58:
      return "BF";
    case 59:
      return "BG";
    case 60:
      return "BH";
    case 61:
      return "BI";
    case 62:
      return "BJ";
    case 63:
      return "BK";
    case 64:
      return "BL";
    case 65:
      return "BM";
    case 66:
      return "BN";
    case 67:
      return "BO";
    case 68:
      return "BP";
    case 69:
      return "BQ";
    case 70:
      return "BR";
    case 71:
      return "BS";
    case 72:
      return "BT";
    case 73:
      return "BU";
    case 74:
      return "BV";
    case 75:
      return "BW";
    case 76:
      return "BX";
    case 77:
      return "BY";
    case 78:
      return "BZ";
    case 79:
      return "CA";
    case 80:
      return "CB";
    case 81:
      return "CC";
    case 82:
      return "CD";
    case 83:
      return "CE";
    case 84:
      return "CF";
    case 85:
      return "CG";
    case 86:
      return "CH";
    case 87:
      return "CI";
    case 88:
      return "CJ";
    case 89:
      return "CK";
    case 90:
      return "CL";
    case 91:
      return "CM";
    case 92:
      return "CN";
    case 93:
      return "CO";
    case 94:
      return "CP";
    case 95:
      return "CQ";
    case 96:
      return "CR";
    case 97:
      return "CS";
    case 98:
      return "CT";
    case 99:
      return "CU";
    case 100:
      return "CV";
    default:
      return null;
  }
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

export const setEditButtonValue = async (session) => {
  const wsName = await getActiveWorksheetName();
  session.editableSheets.forEach((sheet) => {
    if (sheet.name === wsName) {
      session.setEditButton(sheet.editButtonStatus);
      return;
    }
  });
};

export const handleEditButtonClick = async (session) => {
  const wsName = await getActiveWorksheetName();
  session.editableSheets.forEach((sheet) => {
    if (sheet.name === wsName) {
      if (sheet.editButtonStatus === "show") {
        highlightEditableRanges(sheet);
        sheet.editButtonStatus = "hide";
        session.setEditButton(sheet.editButtonStatus);
      } else {
        unhighlightEditableRanges(sheet);
        sheet.editButtonStatus = "show";
        session.setEditButton(sheet.editButtonStatus);
      }
      return;
    }
  });
};
