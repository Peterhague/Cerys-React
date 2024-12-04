import {
  createEditableWs,
  getExcelContext,
  handleEditButtonClick,
  setEditButtonValue,
} from "../../utils.ts/helperFunctions";
import { addWorksheet } from "../../utils.ts/worksheet";
import { handleSingleClick } from "../../utils.ts/worksheet-drilling/cerys-drilling";
import { handleColumnSort, handleRowSort, handleWorksheetEdit } from "../../utils.ts/worksheet-editing";

export async function oBARelevantTransView(transactions, session) {
  const context = await getExcelContext();
  let sheetInMidEdit = false;
  session.updatedTransactions.forEach((update) => {
    transactions.forEach((tran) => {
      if (update.transactionId === tran._id) {
        sheetInMidEdit = true;
        tran.cerysCodeUpdated = update.updatedCode && update.updatedCode;
        tran.transactionDateExcelUpdated = update.updatedDate && update.updatedDate;
        tran.narrativeUpdated = update.updatedNarrative && update.updatedNarrative;
        update.rowNumber = update.rowNumberOrig;
      }
    });
  });
  const wsName = `${transactions[0].cerysExcelName} analysis`;
  const ws = addWorksheet(context, wsName);
  ws.load(["id", "name"]);
  await context.sync();
  const range = ws.getRange(`A1:G${transactions.length + 2}`);
  const valuesToPost = [
    ["Transaction", "Transaction", "Transaction", "Cerys", "Client", "Transaction", "Value"],
    ["Number", "Date", "Type", "Nominal Code", "Nominal Code", "Narrative"],
  ];
  transactions[0].defaultSign === "credit" ? valuesToPost[1].push("CR/(DR)") : valuesToPost[1].push("DR/(CR)");
  let rowNumber = 3;
  transactions.forEach((line) => {
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
  const editableWs = createEditableWs(transactions, ws, definedCols, valuesToPost, "cerysCodeAnalysis");
  const arr = [editableWs];
  session.editableSheets.forEach((sheet) => {
    if (sheet.name !== editableWs.name) arr.push(sheet);
  });
  session.editableSheets = arr;
  columnsRange.format.autofitColumns();
  ws.onActivated.add(() => setEditButtonValue(session));
  ws.onDeactivated.add(() => session.setEditButton("off"));
  ws.activate();
  if (sheetInMidEdit) handleEditButtonClick(session);
  ws.onSingleClicked.add(async (e) => handleSingleClick(session, e, wsName));
  ws.onChanged.add(async (e) => handleWorksheetEdit(session, e, wsName));
  ws.onColumnSorted.add(async () => handleColumnSort(session));
  ws.onRowSorted.add(async (e) => handleRowSort(session, wsName, e));
  await context.sync();
}
