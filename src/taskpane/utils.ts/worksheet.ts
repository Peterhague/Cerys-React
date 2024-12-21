import { colNumToLetter } from "./excel-col-conversion";
import { getExcelContext } from "./helperFunctions";

export function addWorksheet(context, sheetName) {
  const ws = context.workbook.worksheets.add(sheetName);
  return ws;
}

export function addWorksheets(context, sheetNames) {
  sheetNames.forEach((i) => {
    context.workbook.worksheets.add(i);
  });
}

export function deleteWorksheet(context, sheetName) {
  context.workbook.worksheets.getItem(sheetName).delete();
}

export const deleteManyWorksheets = async (sheetsToDelete) => {
  const context = await getExcelContext();
  const sheets = [];
  sheetsToDelete.forEach((sheet) => {
    const ws = context.workbook.worksheets.getItemOrNullObject(sheet);
    sheets.push(ws);
  });
  await context.sync();
  sheets.forEach((sheet) => {
    if (sheet) sheet.delete();
  });
};

export function getWorksheet(context, sheetName) {
  return context.workbook.worksheets.getItem(sheetName);
}

export function getWorksheetAndRange(context, sheetName, range) {
  const ws = context.workbook.worksheets.getItem(sheetName);
  const sheetRange = ws.getRange(range);
  return { ws, range: sheetRange };
}

export const getWorksheetRangeValues = async (wsName, range) => {
  const context = await getExcelContext();
  const sheet = context.workbook.worksheets.getItem(wsName);
  const wsRange = sheet.getRange(range);
  wsRange.load("values");
  await context.sync();
  return wsRange.values;
};

export async function gotToWorksheet(context, sheetName) {
  const sheet = context.workbook.worksheets.getItem(sheetName);
  sheet.activate();
}

export const getActiveWorksheet = async () => {
  const context = await getExcelContext();
  const sheet = context.workbook.worksheets.getActiveWorksheet();
  sheet.load("name");
  await context.sync();
  return sheet;
};

export const activateWorksheet = async (wsName) => {
  const context = await getExcelContext();
  const sheet = context.workbook.worksheets.getItem(wsName);
  sheet.activate();
  await context.sync();
};

export const getActiveWorksheetName = async () => {
  const context = await getExcelContext();
  const sheet = context.workbook.worksheets.getActiveWorksheet();
  sheet.load("name");
  await context.sync();
  const name = sheet.name;
  return name;
};

export const getWorksheetUsedRange = async (wsName) => {
  const context = await getExcelContext();
  const sheet = context.workbook.worksheets.getItem(wsName);
  const range = sheet.getUsedRange();
  range.load("values");
  await context.sync();
  const values = range.values;
  return values;
};

export const setExcelRangeValue = async (wsName, range, value) => {
  const context = await getExcelContext();
  const ws = context.workbook.worksheets.getItem(wsName);
  const wsRange = ws.getRange(range);
  wsRange.values = value;
  await context.sync();
};

export const setManyExcelRangeValues = async (wsName, updates) => {
  const context = await getExcelContext();
  const ws = context.workbook.worksheets.getItem(wsName);
  updates.forEach((update) => {
    const range = ws.getRange(update.address);
    range.values = update.value;
  });
  await context.sync();
};

export const setManyWorksheetRangeValues = async (updates) => {
  const context = await getExcelContext();
  updates.forEach((update) => {
    const ws = context.workbook.worksheets.getItem(update.wsName);
    const range = ws.getRange(update.address);
    range.values = update.value;
  });
  await context.sync();
};

export const deleteWorksheetRangesUp = async (deletionObjs) => {
  const context = await getExcelContext();
  deletionObjs.forEach((obj) => {
    obj.sheet = context.workbook.worksheets.getItemOrNullObject(obj.wsName);
  });
  await context.sync();
  deletionObjs.forEach((obj) => {
    const range = obj.sheet && obj.sheet.getRange(obj.range);
    //range.delete(Excel.DeleteShiftDirection.up);
    range.delete("Up");
  });
  await context.sync();
};

export const deleteWorksheetRangeDown = async (wsName, range) => {
  const context = await getExcelContext();
  const sheet = context.workbook.worksheets.getItem(wsName);
  const wsRange = sheet.getRange(range);
  wsRange.delete(Excel.DeleteShiftDirection.up);
  await context.sync();
};

export const highlightEditableRanges = async (sheet) => {
  const context = await getExcelContext();
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
  await context.sync();
};

export const unhighlightEditableRanges = async (sheet) => {
  const context = await getExcelContext();
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
  await context.sync();
};

export const highlightRanges = async (wsName, ranges, color) => {
  const context = await getExcelContext();
  const ws = context.workbook.worksheets.getItem(wsName);
  ranges.forEach((range) => {
    const wsRange = ws.getRange(range);
    wsRange.format.fill.color = color;
  });
  await context.sync();
};
