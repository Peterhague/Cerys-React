import { updateAssignmentUrl } from "../fetching/apiEndpoints";
import { fetchOptionsUpdateAssignment } from "../fetching/generateOptions";
import { wsBalanceSheet } from "../workbook views/workbook-templates/financial-statements/balance-sheet";
import { wsPLAccount } from "../workbook views/workbook-templates/financial-statements/p&laccount";
import { checkAssetRegStatus } from "./transactions/transactions";
import { postTbToWbook, tbForPosting } from "./trial-balance/tb-maintenance";
import { getActiveWorksheetName, highlightEditableRanges, highlightRanges, unhighlightEditableRanges } from "./worksheet";
import { addBsClickListener, addPlClickListener, addTbClickListener } from "./worksheet-drilling/cerys-drilling";

export const registerWorksheetDeletionHandler = async (session) => {
  await Excel.run(async (context) => {
    let sheets = context.workbook.worksheets;
    console.log(sheets);
    sheets.onDeleted.add(async (e) => handleSheetDeletion(e, session));
    console.log(session);
    await context.sync();
  });
};

export const handleSheetDeletion = (e, session) => {
  let editableSheetDeleted = false;
  session.updatedTransactions.forEach((tran) => {
    if (tran.worksheetId === e.worksheetId) editableSheetDeleted = true;
  });
  console.log(editableSheetDeleted);
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
      session.updatedTransactions.forEach((tran) => {
        if (tran.worksheetName === wsName) {
          if (tran.updatedCode) {
            const range = `${sheet.codeColDetails.colLetter}${tran.rowNumber}:${sheet.codeColDetails.colLetter}${tran.rowNumber}`;
            highlightGreenRanges.push(range);
          }
          if (tran.updatedDate) {
            const range = `${sheet.dateColDetails.colLetter}${tran.rowNumber}:${sheet.dateColDetails.colLetter}${tran.rowNumber}`;
            highlightGreenRanges.push(range);
          }
          if (tran.updatedNarrative) {
            const range = `${sheet.narrColDetails.colLetter}${tran.rowNumber}:${sheet.narrColDetails.colLetter}${tran.rowNumber}`;
            highlightGreenRanges.push(range);
          }
        }
      });
      if (sheet.editButtonStatus === "show") {
        highlightEditableRanges(sheet);
        highlightRanges(wsName, highlightGreenRanges, "lightGreen");
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

export const updateAssignmentFigures = async (session) => {
  const tbArray = tbForPosting(session.activeAssignment.tb);
  await postTbToWbook(session, tbArray);
  await wsPLAccount(session);
  await wsBalanceSheet(session);
  addTbClickListener(session);
  addPlClickListener(session["activeAssignment"]);
  addBsClickListener(session["activeAssignment"]);
  checkAssetRegStatus(session, session["handleView"]);
};
