import { createEditableWs, handleEditButtonClick, interpretEventAddress, setEditButtonValue } from "../helperFunctions";
import { getCerysNomDetail, getCerysNomDetailBS, getCerysNomDetailPL } from "../taskpane/cerys-item-retrieval";
import { addWorksheet, getWorksheet } from "../worksheet";
import { checkEditMode, handleColumnSort, handleRowSort, handleWorksheetEdit, handleWorksheetSelection } from "../worksheet-editing";
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
  const wsName = `${detail[0].cerysExcelName} analysis`;
  const ws = addWorksheet(context, wsName);
  ws.load(["id", "name"]);
  await context.sync();
  const range = ws.getRange(`A1:G${detail.length + 2}`);
  const valuesToPost = [
    ["Transaction", "Transaction", "Transaction", "Cerys", "Client", "Transaction", "Value"],
    ["Number", "Date", "Type", "Nominal Code", "Nominal Code", "Narrative"],
  ];
  detail[0].defaultSign === "credit" ? valuesToPost[1].push("CR/(DR)") : valuesToPost[1].push("DR/(CR)");
  let rowNumber = 3;
  detail.forEach((line) => {
    let arr = [];
    arr.push(line.transactionNumber);
    if (line.transactionDateExcelUpdated) {
      arr.push(line.transactionDateExcelUpdated);
      delete line.transactionDateExcelUpdated;
    } else {
      arr.push(line.transactionDateExcel);
    }
    arr.push(line.transactionType);
    if (line.cerysCodeUpdated) {
      arr.push(line.cerysCodeUpdated);
      delete line.cerysCodeUpdated;
    } else {
      arr.push(line.cerysCode);
    }
    line.clientNominalCode > 0 ? arr.push(line.clientNominalCode) : arr.push("NA");
    if (line.narrativeUpdated) {
      arr.push(line.narrativeUpdated);
      delete line.narrativeUpdated;
    } else {
      arr.push(line.narrative);
    }
    line.defaultSign === "credit" ? arr.push(-line.value / 100) : arr.push(line.value / 100);
    valuesToPost.push(arr);
    line.rowNumber = rowNumber;
    line.rowNumberOrig = rowNumber;
    rowNumber += 1;
  });
  console.log("working here??");
  range.values = valuesToPost;
  const headerRange = ws.getRange("A1:G2");
  headerRange.format.font.bold = true;
  const columnA = ws.getRange("B:B");
  columnA.numberFormat = "dd/mm/yyyy";
  const columnsRange = ws.getRange("A:G");
  const columnG = ws.getRange("G:G");
  columnG.numberFormat = "#,##0.00;(#,##0.00);-";
  const definedCols = [
    {
      type: "transNo",
      colNumber: 1,
      mutable: false,
      format: "0",
      deleted: false,
      unique: true,
    },
    {
      type: "date",
      colNumber: 2,
      mutable: true,
      format: "dd/mm/yyyy",
      deleted: false,
      updateKey: "updatedDate",
      unique: false,
    },
    {
      type: "transType",
      colNumber: 3,
      mutable: false,
      format: "",
      deleted: false,
      unique: false,
    },
    {
      type: "cerysCode",
      colNumber: 4,
      mutable: true,
      format: "0",
      deleted: false,
      updateKey: "updatedCode",
      unique: false,
    },
    {
      type: "clientCode",
      colNumber: 5,
      mutable: false,
      format: "0",
      deleted: false,
      unique: false,
    },
    {
      type: "cerysNarrative",
      colNumber: 6,
      mutable: true,
      format: "",
      deleted: false,
      updateKey: "updatedNarrative",
      unique: false,
    },
    {
      type: "value",
      colNumber: 7,
      mutable: false,
      format: "#,##0.00;(#,##0.00);-",
      deleted: false,
      unique: false,
    },
  ];
  const editableWs = createEditableWs(detail, ws, definedCols, valuesToPost, "cerysCodeAnalysis");
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
  ws.onSingleClicked.add(async (e) => handleSingleClick(session, e, wsName));
  //ws.onSingleClicked.add(async (e) => showClientNominalDetail(e, session));
  //ws.onSelectionChanged.add(async (e) => handleWorksheetSelection(session, e, wsName));
  ws.onChanged.add(async (e) => handleWorksheetEdit(session, e, wsName));
  ws.onColumnSorted.add(async () => handleColumnSort(session));
  ws.onRowSorted.add(async (e) => handleRowSort(session, wsName, e));
  await context.sync();
}

export const handleSingleClick = (session, e, wsName) => {
  const editModeEnabled = checkEditMode(session, wsName);
  const addressObj = interpretEventAddress(e);
  let ws;
  session.editableSheets.forEach((sheet) => {
    if (sheet.name == wsName) {
      ws = sheet;
    }
  });
  if (addressObj.firstRow !== addressObj.lastRow || addressObj.firstCol !== addressObj.lastCol) return;
  let withinEditableRange = false;
  ws.editableRowRanges.forEach((range) => {
    if (addressObj.firstRow >= range.firstRow && addressObj.firstRow <= range.lastRow) withinEditableRange = true;
  });
  if (!withinEditableRange) return;
  let cerysCodeCol;
  let clientCodeCol;
  ws.definedCols.forEach((col) => {
    if (col.type === "cerysCode" && editModeEnabled) {
      cerysCodeCol = col.colNumber;
    } else if (col.type === "clientCode") {
      clientCodeCol = col.colNumber;
    }
  });
  if (cerysCodeCol === addressObj.firstCol) {
    session.handleView("nomCodeSelection");
    session.activeEditableCell = {
      addressObj,
      wsName,
    };
  }
  if (clientCodeCol === addressObj.firstCol) {
    console.log("client code col clicked");
  }
};

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
