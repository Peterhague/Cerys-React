import { Worksheet } from "../classes/worksheet";
import { colNumToLetter } from "./excel-col-conversion";

export function addWorksheet(context, sheetName) {
  const ws = context.workbook.worksheets.add(sheetName);
  return ws;
}

export const addWorksheets = async (context, session, sheetNames) => {
  const worksheets = [];
  session.options.ignoreWsAddition = sheetNames.length;
  sheetNames.forEach((i) => {
    const wsObj = context.workbook.worksheets.add(i);
    const obj = { name: i, wsObj };
    worksheets.push(obj);
  });
  await processWorksheetAdditions(context, session, worksheets);
  return worksheets;
};

export function deleteWorksheet(context, sheetName) {
  context.workbook.worksheets.getItem(sheetName).delete();
}

export const deleteManyWorksheets = (context, sheetsToDelete) => {
  const sheets = [];
  sheetsToDelete.forEach((sheet) => {
    const ws = context.workbook.worksheets.getItemOrNullObject(sheet);
    sheets.push(ws);
  });
  sheets.forEach((sheet) => {
    if (sheet) sheet.delete();
  });
};

export function getWorksheet(context, sheetNameOrId) {
  return context.workbook.worksheets.getItem(sheetNameOrId);
}

export function getWorksheetAndRange(context, sheetName, range) {
  const ws = context.workbook.worksheets.getItem(sheetName);
  const sheetRange = ws.getRange(range);
  return { ws, range: sheetRange };
}

export const getWorksheetRangeValues = async (context, wsName, range) => {
  const sheet = context.workbook.worksheets.getItem(wsName);
  const wsRange = sheet.getRange(range);
  wsRange.load("values");
  await context.sync();
  return wsRange.values;
};

//export async function gotToWorksheet(context, sheetName) {
//  const sheet = context.workbook.worksheets.getItem(sheetName);
//  sheet.activate();
//}

export const getActiveWorksheet = async (context) => {
  const sheet = context.workbook.worksheets.getActiveWorksheet();
  sheet.load("name");
  await context.sync();
  return sheet;
};

export const activateWorksheet = (context, wsName) => {
  const sheet = context.workbook.worksheets.getItem(wsName);
  sheet.activate();
};

export const getActiveWorksheetName = async (context) => {
  const sheet = context.workbook.worksheets.getActiveWorksheet();
  sheet.load("name");
  await context.sync();
  const name = sheet.name;
  return name;
};

export const getWorksheetUsedRange = async (context, wsName) => {
  const sheet = context.workbook.worksheets.getItem(wsName);
  const range = sheet.getUsedRange();
  range.load("values");
  await context.sync();
  const values = range.values;
  return values;
};

export const setExcelRangeValue = (context, wsName, range, value) => {
  const ws = context.workbook.worksheets.getItem(wsName);
  const wsRange = ws.getRange(range);
  wsRange.values = value;
};

export const setManyExcelRangeValues = (context, wsName, updates) => {
  const ws = context.workbook.worksheets.getItem(wsName);
  updates.forEach((update) => {
    const range = ws.getRange(update.address);
    range.values = update.value;
  });
};

export const setManyWorksheetRangeValues = (context, updates) => {
  updates.forEach((update) => {
    const ws = context.workbook.worksheets.getItem(update.wsName);
    const range = ws.getRange(update.address);
    range.values = update.value;
  });
};

export const deleteWorksheetRangesUp = async (context, deletionObjs) => {
  deletionObjs.forEach((obj) => {
    obj.sheet = context.workbook.worksheets.getItemOrNullObject(obj.wsName);
  });
  await context.sync();
  deletionObjs.forEach((obj) => {
    const range = obj.sheet && obj.sheet.getRange(obj.range);
    range.delete("Up");
  });
};

export const deleteWorksheetRangeDown = (context, wsName, range) => {
  const sheet = context.workbook.worksheets.getItem(wsName);
  const wsRange = sheet.getRange(range);
  wsRange.delete(Excel.DeleteShiftDirection.up);
};

export const highlightEditableRanges = (context, sheet) => {
  const ws = context.workbook.worksheets.getItem(sheet.name);
  sheet.editableRowRanges.forEach((range) => {
    sheet.definedCols.forEach((col) => {
      if (!col.isDeleted && col.isMutable) {
        const colLetter = colNumToLetter(col.colNumber);
        const colRange = `${colLetter}${range.firstRow}:${colLetter}${range.lastRow}`;
        const wsColRange = ws.getRange(colRange);
        wsColRange.format.fill.color = "yellow";
      }
    });
  });
};

export const unhighlightEditableRanges = (context, sheet) => {
  const ws = context.workbook.worksheets.getActiveWorksheet();
  sheet.editableRowRanges.forEach((range) => {
    sheet.definedCols.forEach((col) => {
      if (!col.isDeleted && col.isMutable) {
        const colLetter = colNumToLetter(col.colNumber);
        const colRange = `${colLetter}${range.firstRow}:${colLetter}${range.lastRow}`;
        const wsColRange = ws.getRange(colRange);
        wsColRange.format.fill.clear();
      }
    });
  });
};

export const highlightRanges = (context, wsName, ranges, color) => {
  const ws = context.workbook.worksheets.getItem(wsName);
  ranges.forEach((range) => {
    const wsRange = ws.getRange(range);
    wsRange.format.fill.color = color;
  });
};

export const processWorksheetAdditions = async (context, session, worksheets) => {
  worksheets.forEach((sheet) => sheet.wsObj.load("id"));
  await context.sync();
  worksheets.forEach((sheet) => session.worksheets.push(new Worksheet(sheet.name, sheet.wsObj.id)));
};
