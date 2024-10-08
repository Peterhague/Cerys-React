import { captureReanalysis } from "../helperFunctions";
import { getCerysNomDetail, getCerysNomDetailBS, getCerysNomDetailPL } from "../taskpane/cerys-item-retrieval";
import { addWorksheet, getWorksheet } from "../worksheet";
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
  addWorksheet(context, `${detail[0].cerysShortName} analysis`);
  await context.sync();
  const ws = getWorksheet(context, `${detail[0].cerysShortName} analysis`);
  const range = ws.getRange(`A1:F${detail.length + 2}`);
  const valuesToPost = [
    ["Transaction", "Transaction", "Cerys", "Client", "Transaction", "Value"],
    ["Date", "Type", "Nominal Code", "Nominal Code", "Narrative"],
  ];
  detail[0].defaultSign === "debit" ? valuesToPost[1].push("DR/(CR)") : valuesToPost[1].push("CR/(DR)");
  let rowNumber = 3;
  detail.forEach((line) => {
    let arr = [];
    arr.push(line.transactionDateExcel);
    arr.push(line.transactionType);
    arr.push(line.cerysCode);
    line.clientNominalCode > 0 ? arr.push(line.clientNominalCode) : arr.push("NA");
    arr.push(line.narrative);
    line.defaultSign === "credit" ? arr.push(-line.value / 100) : arr.push(line.value / 100);
    valuesToPost.push(arr);
    line.rowNumber = rowNumber;
    rowNumber += 1;
  });
  range.values = valuesToPost;
  const headerRange = ws.getRange("A1:F2");
  headerRange.format.font.bold = true;
  const columnA = ws.getRange("A:A");
  columnA.numberFormat = "dd/mm/yyyy";
  const columnsRange = ws.getRange("A:F");
  const columnF = ws.getRange("F:F");
  columnF.numberFormat = "#,##0.00;(#,##0.00);-";
  const rangeC = ws.getRange(`C3:C${detail.length + 2}`);
  rangeC.format.fill.color = "yellow";
  columnsRange.format.autofitColumns();
  ws.activate();
  ws.onSingleClicked.add(async (e) => showClientNominalDetail(e, session));
  ws.onChanged.add(async (e) => captureReanalysis(session, e, detail));
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
