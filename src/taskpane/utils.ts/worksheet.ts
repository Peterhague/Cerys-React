import { Worksheet } from "../classes/worksheet";
import { colNumToLetter } from "./excel-col-conversion";
/* global Excel */

export function addWorksheet(context, session, wsDefaults) {
  const ws = context.workbook.worksheets.add(wsDefaults.name);
  wsDefaults.addListeners && wsDefaults.addListeners.forEach((fn) => fn(context, session));
  return ws;
}

export const addWorksheets = async (context, session, sheetNames) => {
  const worksheets = [];
  session.options.ignoreWsAddition += sheetNames.length;
  sheetNames.forEach((i) => {
    const ws = context.workbook.worksheets.add(i);
    const proxyObj = { name: i, ws };
    worksheets.push(proxyObj);
  });
  await processWorksheetAdditions(context, session, worksheets);
  return worksheets;
};

// returns new Excel worksheet object with id and name preloaded
export const addOneWorksheet = async (context, session, wsDefaults) => {
  session.options.ignoreWsAddition += 1;
  const ws = addWorksheet(context, session, wsDefaults);
  const proxyObj = { name: wsDefaults.name, ws };
  await processWorksheetAdditions(context, session, [proxyObj]);
  return proxyObj;
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
  console.log(wsName);
  console.log(updates);
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
  console.log(worksheets);
  worksheets.forEach((sheet) => sheet.ws.load(["id", "name"]));
  await context.sync();
  worksheets.forEach((sheet) => session.worksheets.push(new Worksheet(sheet.name, sheet.ws.id)));
};

export const getProxyWorksheet = (session, wsName) => {
  return session.worksheets.find((ws) => ws.name === wsName);
};

export const getOrAddWorksheet = async (context, session, wsDefaults) => {
  const wsName = wsDefaults.name;
  const proxyWs = getProxyWorksheet(session, wsName);
  const worksheets = context.workbook.worksheets;
  return proxyWs ? { ws: worksheets.getItem(wsName) } : await addOneWorksheet(context, session, wsDefaults);
};

export const clearUsedRange = async (context, worksheet) => {
  const usedRange = worksheet.getUsedRange();
  usedRange.clear();
  await context.sync();
};
