import { createEditableCell } from "../../classes/editable-cell";
import { createEditableWorksheet } from "../../classes/editable-worksheet";
import { TransactionMap } from "../../classes/transaction-map";
import { BALANCE_SHEET, PL_ACCOUNT, TRIAL_BALANCE } from "../../static-values/worksheet-defaults";
import {
  handleEditButtonClick,
  interpretEventAddress,
  checkEditMode,
  callNextView,
  getUpdatedDate,
  getUpdatedCerysCode,
  getUpdatedNarrative,
} from "../helperFunctions";
import { getCerysNomDetail, getCerysNomDetailBS, getCerysNomDetailPL } from "../taskpane/cerys-item-retrieval";
import { addOneWorksheet } from "../worksheet";
import { showClientNominalDetail } from "./client-drilling";
/* global Excel */

export function addTbClickListener(context, session) {
  const ws = context.workbook.worksheets.getItem(TRIAL_BALANCE.name);
  ws.onSingleClicked.add(async (e) => showNominalDetail(e, session));
  session.activeAssignment.tbListenerAdded = true;
}

export function addPlClickListener(context, session) {
  const ws = context.workbook.worksheets.getItem(PL_ACCOUNT.name);
  ws.onSingleClicked.add(async (e) => showNominalDetailPL(e, session));
  session.activeAssignment.pLListenerAdded = true;
}

export async function showNominalDetail(e, session) {
  try {
    await Excel.run(async (context) => {
      const address = e.address;
      if (address[0] !== "A") return;
      const ws = context.workbook.worksheets.getItem(TRIAL_BALANCE.name);
      const range = ws.getRange(`${address}:${address}`);
      const values = range.load("values");
      await context.sync();
      const innerValues = values.values;
      const code = innerValues[0][0];
      const detail = getCerysNomDetail(session.activeAssignment.transactions, code);
      await cerysNomDetailView(context, detail, session);
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
}

export async function showNominalDetailPL(e, session) {
  try {
    await Excel.run(async (context) => {
      console.log(e);
      const address = e.address;
      if (address[0] !== "A") return;
      const ws = context.workbook.worksheets.getItem(PL_ACCOUNT.name);
      const range = ws.getRange(`${address}:${address}`);
      const values = range.load("values");
      await context.sync();
      const innerValues = values.values;
      const category = innerValues[0][0];
      const detail = getCerysNomDetailPL(category, session);
      await cerysNomDetailViewPL(context, session, detail);
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
}

async function cerysNomDetailView(context, detail, session) {
  let sheetInMidEdit = false;
  const isValueInverted = detail[0].defaultSign === "credit" ? true : false;
  detail.forEach((tran) => {
    if (tran.updates.length > 0) sheetInMidEdit = true;
  });
  const wsName = `${detail[0].cerysExcelName} analysis`;
  const { ws } = await addOneWorksheet(context, session, { name: wsName, addListeners: undefined });
  const range = ws.getRange(`A1:G${detail.length + 2}`);
  const valuesToPost = [
    ["Transaction", "Transaction", "Transaction", "Cerys", "Client", "Transaction", "Value"],
    ["Number", "Date", "Type", "Nominal Code", "Nominal Code", "Narrative"],
  ];
  isValueInverted ? valuesToPost[1].push("CR/(DR)") : valuesToPost[1].push("DR/(CR)");
  let rowNumber = 3;
  const sheetMapping = [];
  detail.forEach((line) => {
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
  columnA.numberFormat = "dd/mm/yyyy";
  const columnsRange = ws.getRange("A:G");
  const columnG = ws.getRange("G:G");
  columnG.numberFormat = "#,##0.00;(#,##0.00);-";
  // const definedCols = createDefinedCols("cerysCodeAnalysis");
  // const filter = detail[0].cerysCode;
  // createEditableWs(session, detail, ws, definedCols, valuesToPost, "cerysCodeAnalysis", sheetMapping, null, {
  //   target: "cerysCode",
  //   value: filter,
  // });
  const editableWs = createEditableWorksheet(session, detail, ws, valuesToPost, "cerysCodeAnalysis", sheetMapping);
  console.log(editableWs);
  columnsRange.format.autofitColumns();
  ws.activate();
  if (sheetInMidEdit) handleEditButtonClick(session);
}

export const handleSingleClick = (session, e, wsName) => {
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
    session.handleView("nomCodeSelection");
    session.activeEditableCell = createEditableCell(addressObj, wsName, "cerysCoding");
  } else if (withinEditableRange && clientCodeMappingCol === addressObj.firstCol) {
    handleClientMappingCellClick(session, addressObj, wsName);
  } else {
    handleOtherCellClick(session, e, addressObj, clientCodeCol, withinEditableRange);
  }
};

export const handleClientMappingCellClick = (session, addressObj, wsName) => {
  session.handleView("clientNomCodeSelection");
  session.activeEditableCell = createEditableCell(addressObj, wsName, "clientCodeMapping");
};

export const handleOtherCellClick = (session, e, addressObj, clientCodeCol, withinEditableRange) => {
  if (session.currentView === "nomCodeSelection" || session.currentView === "clientNomCodeSelection") {
    callNextView(session);
    session.activeEditableCell = createEditableCell(null, null, null);
  }
  if (withinEditableRange && clientCodeCol === addressObj.firstCol) {
    showClientNominalDetail(e, session);
  }
};

export async function cerysNomDetailViewPL(context, session, detail) {
  const { ws } = await addOneWorksheet(context, session, {
    name: `${detail[0][0].cerysCategory} analysis`,
    addListeners: undefined,
  });
  const valuesToPost = [];
  detail.forEach((code) => {
    valuesToPost.push([`Nominal Code ${code[0].cerysCode}: ${code[0].cerysName}`, "", "", ""]);
    valuesToPost.push(["", "", "", ""]);
    code.forEach((line) => {
      let arr = [];
      arr.push(line.transactionType);
      line.clientNominalCode > 0 ? arr.push(line.clientNominalCode) : arr.push("NA");
      arr.push(line.narrative);
      arr.push(line.value / 100);
      valuesToPost.push(arr);
    });
    valuesToPost.push(["", "", "", ""]);
  });
  const range = ws.getRange(`A1:D${valuesToPost.length}`);
  range.values = valuesToPost;
  ws.activate();
  ws.onSingleClicked.add(async (e) => showClientNominalDetail(e, session));
}

export function addBsClickListener(context, session) {
  const ws = context.workbook.worksheets.getItem(BALANCE_SHEET.name);
  ws.onSingleClicked.add(async (e) => showNominalDetailBS(context, session, e));
  session.activeAssignment.bSListenerAdded = true;
}

export async function showNominalDetailBS(context, session, e) {
  const address = e.address;
  if (address[0] !== "A") return;
  const ws = context.workbook.worksheets.getItem(BALANCE_SHEET.name);
  const range = ws.getRange(`${address}:${address}`);
  const values = range.load("values");
  await context.sync();
  const innerValues = values.values;
  const category = innerValues[0][0];
  const detail = await getCerysNomDetailBS(category, session);
  cerysNomDetailViewBS(context, session, detail);
}

async function cerysNomDetailViewBS(context, session, detail) {
  const activeAssignment = session.activeAssignment;
  const { ws } = await addOneWorksheet(context, session, {
    name: `${detail[0][0].cerysCategory} analysis`,
    addListeners: undefined,
  });
  const valuesToPost = [];
  detail.forEach((code) => {
    valuesToPost.push([`Nominal Code ${code[0].cerysCode}: ${code[0].cerysName}`, "", "", ""]);
    valuesToPost.push(["", "", "", ""]);
    code.forEach((line) => {
      let arr = [];
      arr.push(line.transactionType);
      line.clientNominalCode > 0 ? arr.push(line.clientNominalCode) : arr.push("NA");
      arr.push(line.narrative);
      arr.push(line.value / 100);
      valuesToPost.push(arr);
    });
    valuesToPost.push(["", "", "", ""]);
  });
  if (detail[0][0].cerysCategory === "Profit & loss reserve") {
    if (activeAssignment.profit > 0) {
      valuesToPost.push(["Profit for the period", "", "", activeAssignment.profit]);
    } else if (activeAssignment.profit < 0) {
      valuesToPost.push(["Loss for the period", "", "", activeAssignment.profit]);
    }
  }
  const range = ws.getRange(`A1:D${valuesToPost.length}`);
  range.values = valuesToPost;
  ws.activate();
  ws.onSingleClicked.add(async (e) => showClientNominalDetail(e, session));
}
