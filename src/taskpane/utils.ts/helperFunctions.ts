import { updateAssignmentUrl } from "../fetching/apiEndpoints";
import { fetchOptionsUpdateAssignment } from "../fetching/generateOptions";
import { wsBalanceSheet } from "../workbook views/workbook-templates/financial-statements/balance-sheet";
import { wsPLAccount } from "../workbook views/workbook-templates/financial-statements/p&laccount";
import { colLetterToNum, colNumToLetter } from "./excel-col-conversion";
import { postTbToWbook, tbForPosting } from "./trial-balance/tb-maintenance";
import {
  getActiveWorksheetName,
  highlightEditableRanges,
  highlightRanges,
  unhighlightEditableRanges,
} from "./worksheet";
import { addBsClickListener, addPlClickListener, addTbClickListener } from "./worksheet-drilling/cerys-drilling";

export const registerWorksheetDeletionHandler = async (session) => {
  await Excel.run(async (context) => {
    let sheets = context.workbook.worksheets;
    sheets.onDeleted.add(async (e) => handleSheetDeletion(e, session));
    await context.sync();
  });
};

export const handleSheetDeletion = (e, session) => {
  const newEditableSheets = [];
  session.editableSheets.forEach((sheet) => {
    if (sheet.worksheetId !== e.worksheetId) newEditableSheets.push(sheet);
  });
  session.editableSheets = newEditableSheets;
};

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
  session.nextView = session.nextViewButOne;
  session.nextViewButOne = "";
};

export const setNextViewButOne = (session) => {
  session.nextViewButOne = session.nextView;
  session.nextView = session.currentView;
};

export const clearNextViewButOne = (session) => {
  console.log(session.nextViewButOne);
  if (session.nextViewButOne) session.nextView = session.nextViewButOne;
  session.nextViewButOne = "";
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
  const highlightGreenRanges = [];
  session.editableSheets.forEach((sheet) => {
    if (sheet.name === wsName) {
      let dateCol;
      let cerysCodeCol;
      let cerysNarrativeCol;
      sheet.definedCols.forEach((col) => {
        if (col.type === "date") dateCol = col.colNumber;
        if (col.type === "cerysCode") cerysCodeCol = col.colNumber;
        if (col.type === "cerysNarrative") cerysNarrativeCol = col.colNumber;
      });
      const dateColLetter = colNumToLetter(dateCol);
      const cerysCodeColLetter = colNumToLetter(cerysCodeCol);
      const cerysNarrativeColLetter = colNumToLetter(cerysNarrativeCol);
      session.updatedTransactions.forEach((tran) => {
        if (tran.worksheetName === wsName) {
          if (tran.updatedCode) {
            const range = `${cerysCodeColLetter}${tran.rowNumber}:${cerysCodeColLetter}${tran.rowNumber}`;
            highlightGreenRanges.push(range);
          }
          if (tran.updatedDate) {
            const range = `${dateColLetter}${tran.rowNumber}:${dateColLetter}${tran.rowNumber}`;
            highlightGreenRanges.push(range);
          }
          if (tran.updatedNarrative) {
            const range = `${cerysNarrativeColLetter}${tran.rowNumber}:${cerysNarrativeColLetter}${tran.rowNumber}`;
            highlightGreenRanges.push(range);
          }
        }
      });
      if (sheet.editButtonStatus === "show") {
        highlightEditableRanges(sheet);
        highlightRanges(wsName, highlightGreenRanges, "lightGreen");
        sheet.editButtonStatus = "hide";
      } else {
        unhighlightEditableRanges(sheet);
        sheet.editButtonStatus = "show";
      }
      session.setEditButton(sheet.editButtonStatus);
      return;
    }
  });
};

export const simulateEditButtonClick = async (session) => {
  const wsName = await getActiveWorksheetName();
  const highlightGreenRanges = [];
  session.editableSheets.forEach((sheet) => {
    if (sheet.name === wsName) {
      let codeColNumber;
      let dateColNumber;
      let narrColNumber;
      sheet.definedCols.forEach((col) => {
        if (col.type === "cerysCode") codeColNumber = col.colNumber;
        if (col.type === "date") dateColNumber = col.colNumber;
        if (col.type === "cerysNarrative") narrColNumber = col.colNumber;
      });
      session.updatedTransactions.forEach((tran) => {
        if (tran.worksheetName === wsName) {
          if (tran.updatedCode) {
            const range = `${colNumToLetter(codeColNumber)}${tran.rowNumber}:${colNumToLetter(codeColNumber)}${tran.rowNumber}`;
            highlightGreenRanges.push(range);
          }
          if (tran.updatedDate) {
            const range = `${colNumToLetter(dateColNumber)}${tran.rowNumber}:${colNumToLetter(dateColNumber)}${tran.rowNumber}`;
            highlightGreenRanges.push(range);
          }
          if (tran.updatedNarrative) {
            const range = `${colNumToLetter(narrColNumber)}${tran.rowNumber}:${colNumToLetter(narrColNumber)}${tran.rowNumber}`;
            highlightGreenRanges.push(range);
          }
        }
      });
      highlightEditableRanges(sheet);
      highlightRanges(wsName, highlightGreenRanges, "lightGreen");
      return;
    }
  });
};

export const updateAssignmentFigures = async (session) => {
  const tbArray = tbForPosting(session.activeAssignment.tb);
  await postTbToWbook(session, tbArray);
  await wsPLAccount(session);
  await wsBalanceSheet(session);
  addTbClickListener(session);
  addPlClickListener(session["activeAssignment"]);
  addBsClickListener(session["activeAssignment"]);
};

export const interpretEventAddress = (e) => {
  const address = e.address.includes(":") ? e.address : `${e.address}:${e.address}`;
  const addressSplit = address.split(":");
  const noCols = parseInt(addressSplit[0][0]) ? true : false;
  let noRows = parseInt(addressSplit[0][addressSplit[0].length - 1]) ? false : true;
  if (addressSplit[0][addressSplit[0].length - 1] === "0") noRows = false;
  const firstRow = noRows
    ? null
    : noCols
      ? parseInt(addressSplit[0])
      : parseInt(addressSplit[0][1])
        ? parseInt(addressSplit[0].substr(1))
        : parseInt(addressSplit[0].substr(2));

  const lastRow = noRows
    ? null
    : noCols
      ? parseInt(addressSplit[1])
      : parseInt(addressSplit[1][1])
        ? parseInt(addressSplit[1].substr(1))
        : parseInt(addressSplit[1].substr(2));
  const firstCol = noCols
    ? null
    : noRows
      ? colLetterToNum(addressSplit[0])
      : parseInt(addressSplit[0][1])
        ? colLetterToNum(addressSplit[0].substr(0, 1))
        : colLetterToNum(addressSplit[0].substr(0, 2));
  const lastCol = noCols
    ? null
    : noRows
      ? colLetterToNum(addressSplit[1])
      : parseInt(addressSplit[1][1])
        ? colLetterToNum(addressSplit[1].substr(0, 1))
        : colLetterToNum(addressSplit[1].substr(0, 2));

  return { firstRow, lastRow, firstCol, lastCol };
};

export const interpretExcelAddress = (excelAddress) => {
  const address = excelAddress.includes(":") ? excelAddress : `${excelAddress}:${excelAddress}`;
  const addressSplit = address.split(":");
  const noCols = parseInt(addressSplit[0][0]) ? true : false;
  let noRows = parseInt(addressSplit[0][addressSplit[0].length - 1]) ? false : true;
  if (addressSplit[0][addressSplit[0].length - 1] === "0") noRows = false;
  const firstRow = noRows
    ? null
    : noCols
      ? parseInt(addressSplit[0])
      : parseInt(addressSplit[0][1])
        ? parseInt(addressSplit[0].substr(1))
        : parseInt(addressSplit[0].substr(2));

  const lastRow = noRows
    ? null
    : noCols
      ? parseInt(addressSplit[1])
      : parseInt(addressSplit[1][1])
        ? parseInt(addressSplit[1].substr(1))
        : parseInt(addressSplit[1].substr(2));
  const firstCol = noCols
    ? null
    : noRows
      ? colLetterToNum(addressSplit[0])
      : parseInt(addressSplit[0][1])
        ? colLetterToNum(addressSplit[0].substr(0, 1))
        : colLetterToNum(addressSplit[0].substr(0, 2));
  const lastCol = noCols
    ? null
    : noRows
      ? colLetterToNum(addressSplit[1])
      : parseInt(addressSplit[1][1])
        ? colLetterToNum(addressSplit[1].substr(0, 1))
        : colLetterToNum(addressSplit[1].substr(0, 2));

  return { firstRow, lastRow, firstCol, lastCol };
};

export const createEditableWs = (transactions, ws, definedCols, valuesToPost, type) => {
  return {
    name: ws.name,
    type,
    edited: false,
    promptDeletion: false,
    worksheetId: ws.id,
    editableRowRanges: [{ firstRow: 3, lastRow: transactions.length + 2 }],
    protectedRange: { firstRow: 3, lastRow: transactions.length + 2, firstCol: 1, lastCol: definedCols.length },
    protectedRangeDeleted: false,
    definedCols,
    editButtonStatus: "show",
    changeRejected: false,
    columnsSorted: false,
    rowsSorted: false,
    dataCompromised: false,
    dataCorrupted: false,
    transactions: transactions,
    usedRange: valuesToPost,
  };
};
