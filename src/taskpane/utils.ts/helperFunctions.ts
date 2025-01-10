import { EditableWorksheet } from "../classes/editable-worksheet";
import { ExcelRangeUpdate } from "../classes/excel-range-editing";
import { Session } from "../classes/session";
import { Transaction } from "../classes/transaction";
import { Worksheet } from "../classes/worksheet";
import { updateAssignmentUrl } from "../fetching/apiEndpoints";
import { fetchOptionsUpdateAssignment } from "../fetching/generateOptions";
import { wsBalanceSheet } from "../workbook views/workbook-templates/financial-statements/balance-sheet";
import { wsPLAccount } from "../workbook views/workbook-templates/financial-statements/p&laccount";
import { colLetterToNum, colNumToLetter } from "./excel-col-conversion";
import { postTbToWbook, tbForPosting } from "./trial-balance/tb-maintenance";
import {
  getActiveWorksheetName,
  getWorksheet,
  getWorksheetUsedRange,
  highlightEditableRanges,
  highlightRanges,
  setManyExcelRangeValues,
  unhighlightEditableRanges,
} from "./worksheet";
import { handleSingleClick } from "./worksheet-drilling/cerys-drilling";
import { handleColumnSort, handleRowSort } from "./worksheet-editing/ws-col-row-manipulation";
import { handleWorksheetEdit } from "./worksheet-editing/ws-editing";
/* global Excel */

export const getExcelContext = async () => {
  console.log("getting context");
  try {
    const ctx = await Excel.run(async (context) => {
      return context;
    });
    return ctx;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const registerWorksheetsCollectionHandler = async (session: Session) => {
  try {
    await Excel.run(async (context) => {
      let sheets = context.workbook.worksheets;
      sheets.onDeleted.add(async (e) => handleSheetDeletion(e, session));
      sheets.onAdded.add(async (e) => await handleSheetAddition(context, e, session));
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
};

export const handleSheetDeletion = (e: Excel.WorksheetDeletedEventArgs, session: Session) => {
  session.editableSheets = session.editableSheets
    .filter((sheet) => sheet.worksheetId !== e.worksheetId)
    .map((sheet) => sheet);
  session.worksheets = session.worksheets.filter((sheet) => sheet.id !== e.worksheetId).map((sheet) => sheet);
};

export const handleSheetAddition = async (
  context: Excel.RequestContext,
  e: Excel.WorksheetAddedEventArgs,
  session: Session
) => {
  if (session.options.ignoreWsAddition > 0) {
    session.options.ignoreWsAddition -= 1;
    return;
  }
  const ws = getWorksheet(context, e.worksheetId);
  ws.load("name");
  await context.sync();
  console.log(ws.name);
  session.worksheets.push(new Worksheet(ws.name, e.worksheetId));
};

export function populateUser(session: Session, userId: string) {
  return session.customer.users.find((user) => user._id === userId);
}

export async function updateAssignmentDb(session: Session, target: any) {
  const workbookId = session.assignment._id;
  const customerId = session.customer._id;
  const options = fetchOptionsUpdateAssignment(customerId, workbookId, target);
  const updatedCustAndAssDb = await fetch(updateAssignmentUrl, options);
  const updatedCustAndAss = await updatedCustAndAssDb.json();
  return updatedCustAndAss;
}

export const resetActiveJournal = (session: Session) => {
  const activeJournal = { clientTB: false, journal: true, journalType: "journal", netValue: 0, journals: [] };
  session.activeJournal = activeJournal;
};

export const callNextView = (session: Session) => {
  session.handleView(session.nextView);
  session.nextView = session.nextViewButOne;
  session.nextViewButOne = "";
};

export const setNextViewButOne = (session: Session) => {
  session.nextViewButOne = session.nextView;
  session.nextView = session.currentView;
};

export const clearNextViewButOne = (session: Session) => {
  if (session.nextViewButOne) session.nextView = session.nextViewButOne;
  session.nextViewButOne = "";
};

export const convertMongoDate = (date: string) => {
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

export const calculateExcelDate = (inputDate: Date | string) => {
  const date = new Date(inputDate);
  const baseDate = new Date("1899-12-30");
  const utc1 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const utc2 = Date.UTC(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  const timeDiff = Math.abs(utc2 - utc1);
  const excelDate = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  return excelDate;
};

export const convertExcelDate = (excelDate: any) => {
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
  const date1 = new Date(inputDate1);
  const date2 = new Date(inputDate2);
  const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
  const timeDiff = utc2 - utc1;
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  return daysDiff;
};

export const setEditButtonValue = async (session: Session) => {
  try {
    await Excel.run(async (context) => {
      // appropriate
      const wsName = await getActiveWorksheetName(context);
      session.editableSheets.forEach((sheet) => {
        if (sheet.name === wsName) {
          session.setEditButton(sheet.editButtonStatus);
          return;
        }
      });
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
};

export const handleEditButtonClick = async (session: Session) => {
  try {
    await Excel.run(async (context) => {
      // appropriate
      const wsName = await getActiveWorksheetName(context);
      const highlightGreenRanges = [];
      session.editableSheets.forEach((sheet) => {
        if (sheet.name === wsName) {
          let dateCol;
          let cerysCodeCol;
          let cerysNarrativeCol;
          let clientCodeMappingCol;
          sheet.definedCols.forEach((col) => {
            if (col.type === "date") dateCol = col.colNumber;
            if (col.type === "cerysCode") cerysCodeCol = col.colNumber;
            if (col.type === "cerysNarrative") cerysNarrativeCol = col.colNumber;
            if (col.type === "clientCodeMapping") clientCodeMappingCol = col.colNumber;
          });
          const dateColLetter = colNumToLetter(dateCol);
          const cerysCodeColLetter = colNumToLetter(cerysCodeCol);
          const cerysNarrativeColLetter = colNumToLetter(cerysNarrativeCol);
          const clientCodeMappingColLetter = colNumToLetter(clientCodeMappingCol);
          getUpdatedTransactions(session).forEach((tran) => {
            tran.updates.forEach((update) => {
              if (update.worksheetName === wsName) {
                const rowNumber = getTransRowNumber(tran, sheet);
                if (update.type === "cerysCode") {
                  const range = `${cerysCodeColLetter}${rowNumber}:${cerysCodeColLetter}${rowNumber}`;
                  highlightGreenRanges.push(range);
                }
                if (update.type === "date") {
                  const range = `${dateColLetter}${rowNumber}:${dateColLetter}${rowNumber}`;
                  highlightGreenRanges.push(range);
                }
                if (update.type === "cerysNarrative") {
                  const range = `${cerysNarrativeColLetter}${rowNumber}:${cerysNarrativeColLetter}${rowNumber}`;
                  highlightGreenRanges.push(range);
                }
                if (update.type === "clientCodeMapping") {
                  const range = `${clientCodeMappingColLetter}${rowNumber}:${clientCodeMappingColLetter}${rowNumber}`;
                  highlightGreenRanges.push(range);
                }
              }
            });
          });
          if (sheet.editButtonStatus === "show") {
            highlightEditableRanges(context, sheet);
            highlightRanges(context, wsName, highlightGreenRanges, "lightGreen");
            sheet.editButtonStatus = "hide";
          } else {
            unhighlightEditableRanges(context, sheet);
            sheet.editButtonStatus = "show";
          }
          session.setEditButton(sheet.editButtonStatus);
          return;
        }
      });
    });
  } catch (e) {
    console.error(e);
  }
};

export const simulateEditButtonClick = async (session: Session) => {
  try {
    await Excel.run(async (context) => {
      //Appropriate
      const wsName = await getActiveWorksheetName(context);
      const highlightGreenRanges = [];
      const updatedTrans = getUpdatedTransactions(session);
      session.editableSheets.forEach((sheet) => {
        if (sheet.name === wsName) {
          let codeColNumber;
          let dateColNumber;
          let narrColNumber;
          let clientCodeMappingNumber;
          sheet.definedCols.forEach((col) => {
            if (col.type === "cerysCode") codeColNumber = col.colNumber;
            if (col.type === "date") dateColNumber = col.colNumber;
            if (col.type === "cerysNarrative") narrColNumber = col.colNumber;
            if (col.type === "clientCodeMapping") clientCodeMappingNumber = col.colNumber;
          });
          updatedTrans.forEach((tran) => {
            const rowNumber = getTransRowNumber(tran, sheet);
            tran.updates.forEach((update) => {
              if (update.worksheetName === wsName) {
                if (update.type === "cerysCode") {
                  const range = `${colNumToLetter(codeColNumber)}${rowNumber}:${colNumToLetter(codeColNumber)}${rowNumber}`;
                  highlightGreenRanges.push(range);
                }
                if (update.type === "date") {
                  const range = `${colNumToLetter(dateColNumber)}${rowNumber}:${colNumToLetter(dateColNumber)}${rowNumber}`;
                  highlightGreenRanges.push(range);
                }
                if (update.type === "cerysNarrative") {
                  const range = `${colNumToLetter(narrColNumber)}${rowNumber}:${colNumToLetter(narrColNumber)}${rowNumber}`;
                  highlightGreenRanges.push(range);
                }
                if (update.type === "clientCodeMapping") {
                  const range = `${colNumToLetter(clientCodeMappingNumber)}${rowNumber}:${colNumToLetter(clientCodeMappingNumber)}${rowNumber}`;
                  highlightGreenRanges.push(range);
                }
              }
            });
          });
          highlightEditableRanges(context, sheet);
          highlightRanges(context, wsName, highlightGreenRanges, "lightGreen");
          return;
        }
      });
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
};

export const updateAssignmentFigures = async (context: Excel.RequestContext, session: Session) => {
  const tbArray = tbForPosting(session.assignment.tb);
  await postTbToWbook(context, session, tbArray);
  await wsPLAccount(context, session);
  await wsBalanceSheet(context, session);
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

export const addEditableSheetEventHandlers = (session: Session, ws) => {
  ws.onActivated.add(() => setEditButtonValue(session));
  ws.onDeactivated.add(() => session.setEditButton("off"));
  ws.onSingleClicked.add(async (e) => handleSingleClick(session, e, ws.name));
  ws.onChanged.add(async (e) => handleWorksheetEdit(session, e, ws.name));
  ws.onColumnSorted.add(async () => handleColumnSort(session));
  ws.onRowSorted.add(async () => handleRowSort(session, ws.name));
};

export const hasDefinedColOf = (sheet: EditableWorksheet, colType: string) => {
  let definedCol;
  sheet.definedCols.forEach((col) => {
    if (col.type === colType) definedCol = col;
  });
  return definedCol;
};

export const resetEdSheetCallBack = () => {
  return {
    function: () => console.log("void"),
    args: [],
    count: 0,
  };
};

export const getActiveEdSheet = async (session: Session) => {
  try {
    const rtnVal = await Excel.run(async (context) => {
      const wsName = await getActiveWorksheetName(context);
      let ws;
      session.editableSheets.forEach((sheet) => {
        if (sheet.name === wsName) ws = sheet;
      });
      return ws;
    });
    return rtnVal;
  } catch (e) {
    console.error(e);
    return e;
  }
};

export const checkEditMode = (sheet: EditableWorksheet) => {
  return sheet.editButtonStatus === "hide" || sheet.editButtonStatus === "inProgress" ? true : false;
};

export const getDefinedCol = (sheet: EditableWorksheet, addressCol: number) => {
  const definedCol = sheet.definedCols.find((col) => col.colNumber === addressCol);
  return definedCol;
};

export const getTransRowNumber = (transaction: Transaction, sheet: EditableWorksheet) => {
  const map = sheet.sheetMapping.find((map) => map.transactionId === transaction._id);
  return map.rowNumber;
};

export const getUpdatedDate = (tran: Transaction) => {
  let date = undefined;
  tran.updates.forEach((update) => {
    if (update.type === "date") {
      date = { mongoDate: update.mongoDate, value: update.value };
    }
  });
  return date;
};

export const getUpdatedNarrative = (tran: Transaction) => {
  let narrative = undefined;
  tran.updates.forEach((update) => {
    if (update.type === "cerysNarrative") {
      narrative = update.value;
    }
  });
  return narrative;
};

export const getUpdatedCerysCode = (tran: Transaction) => {
  let code = undefined;
  tran.updates.forEach((update) => {
    if (update.type === "cerysCode") {
      code = update.value;
    }
  });
  return code;
};

export const getUpdatedClientCodeMapping = (tran: Transaction) => {
  let mapping = undefined;
  tran.updates.forEach((update) => {
    if (update.type === "clientCodeMapping") {
      mapping = update.value;
    }
  });
  return mapping;
};

export const getUpdatedTransactions = (session: Session) => {
  const updatedTrans = session.assignment.transactions.filter((tran) => tran.updates.length > 0);
  return updatedTrans;
};

export const accessExcelContext = async (func, args) => {
  try {
    const rtnVal = await Excel.run(async (context) => {
      const rtnVal = func(context, ...args);
      await context.sync();
      return rtnVal;
    });
    return rtnVal;
  } catch (e) {
    console.error(e);
    return e;
  }
};

export const postEditableSheetEffects = async (
  context: Excel.RequestContext,
  session: Session,
  wsName: string,
  updates: ExcelRangeUpdate[]
) => {
  session.options.allowEffects = updates.length;
  setManyExcelRangeValues(context, wsName, updates);
  const sheet = session.editableSheets.find((ws) => ws.name === wsName);
  sheet.usedRange = await getWorksheetUsedRange(context, wsName);
};
