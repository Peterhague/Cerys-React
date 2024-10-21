import { handleEditButtonClick, setEditButtonValue } from "../helperFunctions";
import { getCerysNomDetail, getCerysNomDetailBS, getCerysNomDetailPL } from "../taskpane/cerys-item-retrieval";
import { addWorksheet, getWorksheet } from "../worksheet";
import { handleColumnSort, handleRowSort, handleWorksheetEdit } from "../worksheet-editing";
import { showClientNominalDetail } from "./client-drilling";

export async function addTbClickListener(session) {
  try {
    await Excel.run(async (context) => {
      const ws = context.workbook.worksheets.getItem("Trial Balance");
      ws.onSingleClicked.add(async (e) => showNominalDetail(context, e, session));
      session.activeAssignment.tbListenerAdded = true;

      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
}

export async function addPlClickListener(activeAssignment) {
  try {
    await Excel.run(async (context) => {
      const ws = context.workbook.worksheets.getItem("Profit & loss account");
      ws.onSingleClicked.add(async (e) => showNominalDetailPL(e, activeAssignment, context));
      activeAssignment.pLListenerAdded = true;

      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
}

export async function showNominalDetail(context, e, session) {
  const address = e.address;
  if (address[0] !== "A") return;
  const ws = context.workbook.worksheets.getItem("Trial Balance");
  const range = ws.getRange(`${address}:${address}`);
  const values = range.load("values");
  await context.sync();
  const innerValues = values.values;
  const code = innerValues[0][0];
  const detail = await getCerysNomDetail(context, code, session);
  cerysNomDetailView(context, detail, session);
}

export async function showNominalDetailPL(e, activeAssignment, context) {
  const address = e.address;
  if (address[0] !== "A") return;
  const ws = context.workbook.worksheets.getItem("Profit & loss account");
  const range = ws.getRange(`${address}:${address}`);
  const values = range.load("values");
  await context.sync();
  const innerValues = values.values;
  const category = innerValues[0][0];
  console.log(category);
  const detail = getCerysNomDetailPL(category, activeAssignment);
  await context.sync();
  console.log(detail);
  cerysNomDetailViewPL(context, detail, activeAssignment);
}

async function cerysNomDetailView(context, detail, session) {
  console.log(detail);
  console.log(session.updatedTransactions);
  let sheetInMidEdit = false;
  session.updatedTransactions.forEach((update) => {
    detail.forEach((tran) => {
      if (update.transactionId === tran._id) {
        sheetInMidEdit = true;
        tran.cerysCodeUpdated = update.updatedCode && update.updatedCode;
        tran.transactionDateExcelUpdated = update.updatedDate && update.updatedDate;
        tran.narrativeUpdated = update.updatedNarrative && update.updatedNarrative;
        update.rowNumber = update.rowNumberOrig;
      }
    });
  });
  const wsName = `${detail[0].cerysShortName} analysis`;
  const ws = addWorksheet(context, wsName);
  ws.load("id");
  await context.sync();
  const range = ws.getRange(`A1:G${detail.length + 2}`);
  const valuesToPost = [
    ["Transaction", "Transaction", "Transaction", "Cerys", "Client", "Transaction", "Value"],
    ["Number", "Date", "Type", "Nominal Code", "Nominal Code", "Narrative"],
  ];
  detail[0].defaultSign === "debit" ? valuesToPost[1].push("DR/(CR)") : valuesToPost[1].push("CR/(DR)");
  let rowNumber = 3;
  detail.forEach((line) => {
    let arr = [];
    arr.push(line.transactionNumber);
    arr.push(line.transactionDateExcelUpdated ? line.transactionDateExcelUpdated : line.transactionDateExcel);
    arr.push(line.transactionType);
    arr.push(line.cerysCodeUpdated ? line.cerysCodeUpdated : line.cerysCode);
    line.clientNominalCode > 0 ? arr.push(line.clientNominalCode) : arr.push("NA");
    arr.push(line.narrativeUpdated ? line.narrativeUpdated : line.narrative);
    line.defaultSign === "credit" ? arr.push(-line.value / 100) : arr.push(line.value / 100);
    valuesToPost.push(arr);
    line.rowNumber = rowNumber;
    line.rowNumberOrig = rowNumber;
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
  const editableWs = {
    name: wsName,
    worksheetId: ws.id,
    editableRanges: [`B3:B${detail.length + 2}`, `D3:D${detail.length + 2}`, `F3:F${detail.length + 2}`],
    editableRowRanges: [{ firstRow: 3, lastRow: detail.length + 2 }],
    activeEditableRanges: [`B3:B${detail.length + 2}`, `D3:D${detail.length + 2}`, `F3:F${detail.length + 2}`],
    protectedRange: { firstRow: 3, lastRow: detail.length + 2, firstCol: 1, lastCol: 7 },
    protectedRangeDeleted: false,
    dateColDetails: {
      ranges: [{ firstRow: 3, lastRow: detail.length + 2 }],
      colLetter: "B",
      colNumber: 2,
      format: "dd/mm/yyyy",
      deleted: false,
    },
    transNoColDetails: {
      ranges: [{ firstRow: 3, lastRow: detail.length + 2 }],
      colLetter: "A",
      colNumber: 1,
      format: "0",
      deleted: false,
    },
    transTypeColDetails: {
      ranges: [{ firstRow: 3, lastRow: detail.length + 2 }],
      colLetter: "C",
      colNumber: 3,
      format: "",
      deleted: false,
    },
    clientCodeColDetails: {
      ranges: [{ firstRow: 3, lastRow: detail.length + 2 }],
      colLetter: "E",
      colNumber: 5,
      format: "0",
      deleted: false,
    },
    valueColDetails: {
      ranges: [{ firstRow: 3, lastRow: detail.length + 2 }],
      colLetter: "G",
      colNumber: 7,
      format: "#,##0.00;(#,##0.00);-",
      deleted: false,
    },
    activeDateDetails: { range: `B3:B${detail.length + 2}`, format: "dd/mm/yyyy" },
    codeColDetails: {
      ranges: [{ firstRow: 3, lastRow: detail.length + 2 }],
      colLetter: "D",
      colNumber: 4,
      format: "0",
      deleted: false,
    },
    narrColDetails: {
      ranges: [{ firstRow: 3, lastRow: detail.length + 2 }],
      colLetter: "F",
      colNumber: 6,
      format: "#,##0.00;(#,##0.00);-",
      deleted: false,
    },
    headerRange: "A1:G2",
    headerValues: [
      ["Transaction", "Transaction", "Transaction", "Cerys", "Client", "Transaction", "Value"],
      ["Number", "Date", "Type", "Nominal Code", "Nominal Code", "Narrative"],
    ],
    editButtonStatus: "show",
    changeRejected: false,
    columnsSorted: false,
    rowsSorted: false,
    dataCompromised: false,
    dataCorrupted: false,
    transactions: detail,
  };
  const arr = [editableWs];
  session.editableSheets.forEach((sheet) => {
    if (sheet.name !== editableWs.name) arr.push(sheet);
  });
  session.editableSheets = arr;
  columnsRange.format.autofitColumns();
  ws.onActivated.add(() => setEditButtonValue(session));
  ws.onDeactivated.add(() => session.setEditButton("off"));
  ws.activate();
  console.log(sheetInMidEdit);
  if (sheetInMidEdit) handleEditButtonClick(session);
  ws.onSingleClicked.add(async (e) => showClientNominalDetail(e, session));
  ws.onChanged.add(async (e) => handleWorksheetEdit(session, e, wsName));
  ws.onColumnSorted.add(async () => handleColumnSort(session));
  //ws.onRowSorted.add(async (e) => handleRowSort(session, e, detail));
  ws.onRowSorted.add(async (e) => handleRowSort(session, e, wsName));
  await context.sync();
}

export async function cerysNomDetailViewPL(context, detail, activeAssignment) {
  addWorksheet(context, `${detail[0][0].cerysCategory} analysis`);
  await context.sync();
  const ws = getWorksheet(context, `${detail[0][0].cerysCategory} analysis`);
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
  ws.onSingleClicked.add(async (e) => showClientNominalDetail(e, activeAssignment));
  await context.sync();
}

export async function addBsClickListener(activeAssignment) {
  try {
    await Excel.run(async (context) => {
      const ws = context.workbook.worksheets.getItem("Balance sheet");
      ws.onSingleClicked.add(async (e) => showNominalDetailBS(context, e, activeAssignment));
      activeAssignment.bSListenerAdded = true;

      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
}

export async function showNominalDetailBS(context, e, activeAssignment) {
  const address = e.address;
  if (address[0] !== "A") return;
  const ws = context.workbook.worksheets.getItem("Balance sheet");
  const range = ws.getRange(`${address}:${address}`);
  const values = range.load("values");
  await context.sync();
  const innerValues = values.values;
  const category = innerValues[0][0];
  console.log(activeAssignment);
  const detail = await getCerysNomDetailBS(context, category, activeAssignment);
  cerysNomDetailViewBS(context, detail, activeAssignment);
}

async function cerysNomDetailViewBS(context, detail, activeAssignment) {
  addWorksheet(context, `${detail[0][0].cerysCategory} analysis`);
  await context.sync();
  const ws = getWorksheet(context, `${detail[0][0].cerysCategory} analysis`);
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
  ws.onSingleClicked.add(async (e) => showClientNominalDetail(e, activeAssignment));
  await context.sync();
}
