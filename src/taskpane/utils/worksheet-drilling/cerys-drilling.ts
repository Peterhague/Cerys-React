import { FSCategoryLineBS, FSCategoryLinePL } from "../../classes/accounts-category-line";
import { createEditableCell } from "../../classes/editable-cell";
import { createEditableWorksheet } from "../../classes/editable-worksheet";
import { Session } from "../../classes/session";
import { Transaction } from "../../classes/transaction";
import { TransactionMap } from "../../classes/transaction-map";
import { TrialBalanceLine } from "../../classes/trial-balance-line";
import { AddressObject } from "../../interfaces/interfaces";
import { CLIENT_NOM_CODE_SELECTION, NOM_CODE_SELECTION } from "../../static-values/views";
import { BALANCE_SHEET, PL_ACCOUNT, TRIAL_BALANCE } from "../../static-values/worksheet-defaults";
import { STANDARD_NUMBER_FORMAT } from "../../static-values/worksheet-formats";
import { BS_WSNAME, PL_WSNAME, TB_WSNAME } from "../../static-values/worksheet-names";
import {
  handleEditButtonClick,
  interpretEventAddress,
  checkEditMode,
  callNextView,
  getUpdatedDate,
  getUpdatedCerysCode,
  getUpdatedNarrative,
  getCategoryShortName,
} from "../helperFunctions";
import { getCerysNomDetailBS, getCerysNomDetailPL } from "../taskpane/cerys-item-retrieval";
import { addOneWorksheet } from "../worksheet";
import { showClientNominalDetail } from "./client-drilling";
/* global Excel */

export function addTbClickListener(context: Excel.RequestContext, session: Session) {
  const ws = context.workbook.worksheets.getItem(TRIAL_BALANCE.name);
  ws.onSingleClicked.add((e) => showNominalDetail(e, session));
  session.assignment.tbListenerAdded = true;
}

export function addPlClickListener(context: Excel.RequestContext, session: Session) {
  const ws = context.workbook.worksheets.getItem(PL_ACCOUNT.name);
  ws.onSingleClicked.add(async (e) => showNominalDetailPL(e, session));
  session.assignment.pLListenerAdded = true;
}

export const showNominalDetail = async (e: Excel.WorksheetSingleClickedEventArgs, session: Session) => {
  try {
    await Excel.run(async (context) => {
      const sheet = session.controlledSheets.find((sheet) => sheet.name === TB_WSNAME);
      const addressObj = interpretEventAddress(e);
      const map = sheet.sheetMapping.find(
        (mapping) => mapping.rowNumber === addressObj.firstRow && mapping.colNumber === addressObj.firstCol
      );
      if (!map) return;
      const input = sheet.controlledInputs.find((item) => item.identifier === map.identity);
      const code = input instanceof TrialBalanceLine && input.cerysCode;
      console.log(input);
      console.log(code);
      const transactions = session.assignment.transactions.filter((tran) => tran.cerysCode === code);
      await cerysNomDetailView(context, transactions, session);
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
};

export const showNominalDetailPL = async (e: Excel.WorksheetSingleClickedEventArgs, session: Session) => {
  try {
    await Excel.run(async (context) => {
      const sheet = session.controlledSheets.find((sheet) => sheet.name === PL_WSNAME);
      const addressObj = interpretEventAddress(e);
      const map = sheet.sheetMapping.find(
        (mapping) => mapping.rowNumber === addressObj.firstRow && mapping.colNumber === addressObj.firstCol
      );
      if (!map) return;
      const input = sheet.controlledInputs.find((item) => item.identifier === map.identity);
      const category = input instanceof FSCategoryLinePL && input.categoryName;
      const arrOfTransArrs = getCerysNomDetailPL(category, session);
      await cerysNomDetailViewPL(context, session, arrOfTransArrs);
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
};

async function cerysNomDetailView(context: Excel.RequestContext, transactions: Transaction[], session: Session) {
  let sheetInMidEdit = false;
  console.log(transactions);
  const cerysCodeObj = transactions[0].getCerysCodeObj(session);
  const isValueInverted = cerysCodeObj.defaultSign === "credit" ? true : false;
  transactions.forEach((tran) => {
    if (tran.updates.length > 0) sheetInMidEdit = true;
  });
  const wsName = `${cerysCodeObj.cerysExcelName} analysis`;
  const { ws } = await addOneWorksheet(context, session, { name: wsName, addListeners: undefined });
  const range = ws.getRange(`A1:G${transactions.length + 2}`);
  const valuesToPost = [
    ["Transaction", "Transaction", "Transaction", "Cerys", "Client", "Transaction", "Value"],
    ["Number", "Date", "Type", "Nominal Code", "Nominal Code", "Narrative"],
  ];
  isValueInverted ? valuesToPost[1].push("CR/(DR)") : valuesToPost[1].push("DR/(CR)");
  let rowNumber = 3;
  const sheetMapping = [];
  transactions.forEach((line) => {
    const date = getUpdatedDate(line) ? getUpdatedDate(line).value : line.transactionDateExcel;
    const cerysCode = getUpdatedCerysCode(line) ? getUpdatedCerysCode(line) : line.cerysCode;
    const narrative = getUpdatedNarrative(line) ? getUpdatedNarrative(line) : line.narrative;
    let arr = [];
    arr.push(line.transactionNumber);
    arr.push(date);
    arr.push(line.transactionType);
    arr.push(cerysCode);
    line.clientNominalCode > 0 ? arr.push(line.clientNominalCode) : arr.push("NA");
    arr.push(narrative);
    isValueInverted ? arr.push(-line.value / 100) : arr.push(line.value / 100);
    valuesToPost.push(arr);
    const map = new TransactionMap(line._id, rowNumber);
    sheetMapping.push(map);
    rowNumber += 1;
  });
  range.values = valuesToPost;
  const headerRange = ws.getRange("A1:G2");
  headerRange.format.font.bold = true;
  const columnA = ws.getRange("B:B");
  columnA.numberFormat = [["dd/mm/yyyy"]];
  const columnsRange = ws.getRange("A:G");
  const columnG = ws.getRange("G:G");
  columnG.numberFormat = STANDARD_NUMBER_FORMAT;
  createEditableWorksheet(session, transactions, ws, valuesToPost, "cerysCodeAnalysis", sheetMapping);
  columnsRange.format.autofitColumns();
  ws.activate();
  if (sheetInMidEdit) handleEditButtonClick(session);
}

export const handleSingleClick = (session: Session, e: Excel.WorksheetSingleClickedEventArgs, wsName: string) => {
  const sheet = session.editableSheets.find((ws) => ws.name === wsName);
  const editModeEnabled = checkEditMode(sheet);
  const addressObj = interpretEventAddress(e);
  const ws = session.editableSheets.find((sheet) => sheet.name === wsName);
  if (addressObj.firstRow !== addressObj.lastRow || addressObj.firstCol !== addressObj.lastCol) return;
  let withinEditableRange = false;
  ws.editableRowRanges.forEach((range) => {
    if (addressObj.firstRow >= range.firstRow && addressObj.firstRow <= range.lastRow) withinEditableRange = true;
  });
  let cerysCodeCol;
  let clientCodeCol;
  let clientCodeMappingCol;
  editModeEnabled &&
    ws.definedCols.forEach((col) => {
      if (col.type === "cerysCode") {
        cerysCodeCol = col.colNumber;
      } else if (col.type === "clientCode") {
        clientCodeCol = col.colNumber;
      } else if (col.type === "clientCodeMapping") {
        clientCodeMappingCol = col.colNumber;
      }
    });
  if (withinEditableRange && cerysCodeCol === addressObj.firstCol) {
    session.handleView(NOM_CODE_SELECTION);
    session.activeEditableCell = createEditableCell(addressObj, wsName, "cerysCoding");
  } else if (withinEditableRange && clientCodeMappingCol === addressObj.firstCol) {
    handleClientMappingCellClick(session, addressObj, wsName);
  } else {
    handleOtherCellClick(session, e, addressObj, clientCodeCol, withinEditableRange);
  }
};

export const handleClientMappingCellClick = (session: Session, addressObj: AddressObject, wsName: string) => {
  session.handleView(CLIENT_NOM_CODE_SELECTION);
  session.activeEditableCell = createEditableCell(addressObj, wsName, "clientCodeMapping");
};

export const handleOtherCellClick = (
  session: Session,
  e: Excel.WorksheetSingleClickedEventArgs,
  addressObj: AddressObject,
  clientCodeCol: number,
  withinEditableRange: boolean
) => {
  if (session.currentView === NOM_CODE_SELECTION || session.currentView === CLIENT_NOM_CODE_SELECTION) {
    callNextView(session);
    session.activeEditableCell = createEditableCell(null, null, null);
  }
  if (withinEditableRange && clientCodeCol === addressObj.firstCol) {
    showClientNominalDetail(e, session);
  }
};

export async function cerysNomDetailViewPL(
  context: Excel.RequestContext,
  session: Session,
  arrOfTransArrs: Transaction[][]
) {
  const cerysCodeObj = arrOfTransArrs[0][0].getCerysCodeObj(session);
  const catName = getCategoryShortName(cerysCodeObj.cerysCategory);
  const { ws } = await addOneWorksheet(context, session, {
    name: `${catName} analysis`,
    addListeners: undefined,
  });
  const valuesToPost = [];
  arrOfTransArrs.forEach((arrOfTrans) => {
    const cerysCodeObj = arrOfTrans[0].getCerysCodeObj(session);
    valuesToPost.push([`Nominal Code ${cerysCodeObj.cerysCode}: ${cerysCodeObj.cerysName}`, "", "", ""]);
    valuesToPost.push(["", "", "", ""]);
    arrOfTrans.forEach((tran) => {
      let arr = [];
      arr.push(tran.transactionType);
      tran.clientNominalCode > 0 ? arr.push(tran.clientNominalCode) : arr.push("NA");
      arr.push(tran.narrative);
      arr.push(tran.value / 100);
      valuesToPost.push(arr);
    });
    valuesToPost.push(["", "", "", ""]);
  });
  const range = ws.getRange(`A1:D${valuesToPost.length}`);
  range.values = valuesToPost;
  ws.activate();
  ws.onSingleClicked.add(async (e) => showClientNominalDetail(e, session));
}

export function addBsClickListener(context: Excel.RequestContext, session: Session) {
  const ws = context.workbook.worksheets.getItem(BALANCE_SHEET.name);
  ws.onSingleClicked.add(async (e) => showNominalDetailBS(e, session));
  session.assignment.bSListenerAdded = true;
}

export const showNominalDetailBS = async (e: Excel.WorksheetSingleClickedEventArgs, session: Session) => {
  try {
    await Excel.run(async (context) => {
      const sheet = session.controlledSheets.find((sheet) => sheet.name === BS_WSNAME);
      const addressObj = interpretEventAddress(e);
      const map = sheet.sheetMapping.find(
        (mapping) => mapping.rowNumber === addressObj.firstRow && mapping.colNumber === addressObj.firstCol
      );
      if (!map) return;
      const input = sheet.controlledInputs.find((item) => item.identifier === map.identity);
      const category = input instanceof FSCategoryLineBS && input.categoryName;
      const arrOfTransArrs = getCerysNomDetailBS(category, session);
      await cerysNomDetailViewBS(context, session, arrOfTransArrs);
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
};

async function cerysNomDetailViewBS(context: Excel.RequestContext, session: Session, arrOfTransArrs: Transaction[][]) {
  const assignment = session.assignment;
  const cerysCategory = arrOfTransArrs[0][0].getCerysCodeObj(session).cerysCategory;
  const catName = getCategoryShortName(cerysCategory);
  const { ws } = await addOneWorksheet(context, session, {
    name: `${catName} analysis`,
    addListeners: undefined,
  });
  const valuesToPost = [];
  arrOfTransArrs.forEach((arrOfTrans) => {
    const cerysCodeObj = arrOfTrans[0].getCerysCodeObj(session);
    valuesToPost.push([`Nominal Code ${cerysCodeObj.cerysCode}: ${cerysCodeObj.cerysName}`, "", "", ""]);
    valuesToPost.push(["", "", "", ""]);
    arrOfTrans.forEach((line) => {
      let arr = [];
      arr.push(line.transactionType);
      line.clientNominalCode > 0 ? arr.push(line.clientNominalCode) : arr.push("NA");
      arr.push(line.narrative);
      arr.push(line.value / 100);
      valuesToPost.push(arr);
    });
    valuesToPost.push(["", "", "", ""]);
  });
  if (cerysCategory === "Profit & loss reserve") {
    const profit = assignment.calculateProfit(null, null).fSValue;
    if (profit > 0) {
      valuesToPost.push(["Profit for the period", "", "", profit]);
    } else if (profit < 0) {
      valuesToPost.push(["Loss for the period", "", "", profit]);
    }
  }
  const range = ws.getRange(`A1:D${valuesToPost.length}`);
  range.values = valuesToPost;
  ws.activate();
  ws.onSingleClicked.add(async (e) => showClientNominalDetail(e, session));
}
