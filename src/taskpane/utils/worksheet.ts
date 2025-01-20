import { EditableWorksheet } from "../classes/editable-worksheet";
import { ExcelDeletionObject, ExcelRangeUpdate } from "../classes/excel-range-editing";
import { Session } from "../classes/session";
import { Worksheet } from "../classes/worksheet";
import { ProxyWorksheet, WorksheetDefaults } from "../interfaces/interfaces";
import { colNumToLetter } from "./excel-col-conversion";
/* global Excel */

export function addWorksheet(context: Excel.RequestContext, session: Session, wsDefaults: WorksheetDefaults) {
  const ws = context.workbook.worksheets.add(wsDefaults.name);
  wsDefaults.addListeners && wsDefaults.addListeners.forEach((fn) => fn(context, session));
  return ws;
}

export const addWorksheets = async (context: Excel.RequestContext, session: Session, sheetNames: string[]) => {
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
export const addOneWorksheet = async (
  context: Excel.RequestContext,
  session: Session,
  wsDefaults: WorksheetDefaults
) => {
  session.options.ignoreWsAddition += 1;
  const ws = addWorksheet(context, session, wsDefaults);
  const proxyObj: ProxyWorksheet = { name: wsDefaults.name, ws };
  await processWorksheetAdditions(context, session, [proxyObj]);
  return proxyObj;
};

export function deleteWorksheet(context: Excel.RequestContext, sheetName: string) {
  context.workbook.worksheets.getItem(sheetName).delete();
}

export const deleteManyWorksheets = (context: Excel.RequestContext, sheetsToDelete: string[]) => {
  const sheets = [];
  sheetsToDelete.forEach((sheet) => {
    const ws = context.workbook.worksheets.getItemOrNullObject(sheet);
    sheets.push(ws);
  });
  sheets.forEach((sheet) => {
    if (sheet) sheet.delete();
  });
};

export function getWorksheet(context: Excel.RequestContext, sheetNameOrId: string) {
  return context.workbook.worksheets.getItem(sheetNameOrId);
}

export function getWorksheetAndRange(context: Excel.RequestContext, sheetName: string, range: string) {
  const ws = context.workbook.worksheets.getItem(sheetName);
  const sheetRange = ws.getRange(range);
  return { ws, range: sheetRange };
}

export const getWorksheetRangeValues = async (context: Excel.RequestContext, wsName: string, range: string) => {
  const sheet = context.workbook.worksheets.getItem(wsName);
  const wsRange = sheet.getRange(range);
  wsRange.load("values");
  await context.sync();
  return wsRange.values;
};

export const getActiveWorksheet = async () => {
  try {
    const rtnVal: Excel.Worksheet = await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      sheet.load("name");
      await context.sync();
      return sheet;
    });
    return rtnVal;
  } catch (e) {
    console.error(e);
    return e;
  }
};

export const activateWorksheet = (context: Excel.RequestContext, wsName: string) => {
  const sheet = context.workbook.worksheets.getItem(wsName);
  sheet.activate();
};

export const getActiveWorksheetName = async (context: Excel.RequestContext) => {
  const sheet = context.workbook.worksheets.getActiveWorksheet();
  sheet.load("name");
  await context.sync();
  const name = sheet.name;
  return name;
};

export const getWorksheetUsedRange = async (context: Excel.RequestContext, wsName: string) => {
  const sheet = context.workbook.worksheets.getItem(wsName);
  const range = sheet.getUsedRange();
  range.load("values");
  await context.sync();
  const values = range.values;
  return values;
};

export const setExcelRangeValue = async (wsName: string, range: string, value: string | number) => {
  try {
    await Excel.run(async (context) => {
      const ws = context.workbook.worksheets.getItem(wsName);
      const wsRange = ws.getRange(range);
      wsRange.values = [[value]];
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
};

export const setManyExcelRangeValues = (context: Excel.RequestContext, wsName: string, updates: ExcelRangeUpdate[]) => {
  const ws = context.workbook.worksheets.getItem(wsName);
  // Issue: should this be a for loop because an await call is made during it?
  console.log("LOOOK HEEEEEEERE!!!!");
  console.log(updates);
  updates.forEach((update) => {
    const range = ws.getRange(update.address);
    range.values = update.value;
  });
};

export const setManyWorksheetRangeValues = (context: Excel.RequestContext, updates: ExcelRangeUpdate[]) => {
  updates.forEach((update) => {
    const ws = context.workbook.worksheets.getItem(update.wsName);
    const range = ws.getRange(update.address);
    range.values = update.value;
  });
};

export const deleteWorksheetRangesUp = async (context: Excel.RequestContext, deletionObjs: ExcelDeletionObject[]) => {
  deletionObjs.forEach((obj) => {
    obj.worksheet = context.workbook.worksheets.getItemOrNullObject(obj.wsName);
  });
  await context.sync();
  deletionObjs.forEach((obj) => {
    const range = obj.worksheet && obj.worksheet.getRange(obj.range);
    range.delete("Up");
  });
};

export const deleteWorksheetRangeDown = (context: Excel.RequestContext, wsName: string, range: string) => {
  const sheet = context.workbook.worksheets.getItem(wsName);
  const wsRange = sheet.getRange(range);
  wsRange.delete(Excel.DeleteShiftDirection.up);
};

export const highlightEditableRanges = (context: Excel.RequestContext, sheet: EditableWorksheet) => {
  const ws = context.workbook.worksheets.getItem(sheet.name);
  sheet.editableRowRanges.forEach((range) => {
    sheet.definedCols.forEach((col) => {
      if (!col.isDeleted && col.isMutable) {
        const colLetter = colNumToLetter(sheet.getCurrentColumn(col.colNumberOrig));
        const colRange = `${colLetter}${range.firstRow}:${colLetter}${range.lastRow}`;
        const wsColRange = ws.getRange(colRange);
        wsColRange.format.fill.color = "yellow";
      }
    });
  });
};

export const unhighlightEditableRanges = (context: Excel.RequestContext, sheet: EditableWorksheet) => {
  const ws = context.workbook.worksheets.getActiveWorksheet();
  sheet.editableRowRanges.forEach((range) => {
    sheet.definedCols.forEach((col) => {
      if (!col.isDeleted && col.isMutable) {
        const colLetter = colNumToLetter(sheet.getCurrentColumn(col.colNumberOrig));
        const colRange = `${colLetter}${range.firstRow}:${colLetter}${range.lastRow}`;
        const wsColRange = ws.getRange(colRange);
        wsColRange.format.fill.clear();
      }
    });
  });
};

export const highlightRanges = (context: Excel.RequestContext, wsName: string, ranges: string[], color: string) => {
  const ws = context.workbook.worksheets.getItem(wsName);
  ranges.forEach((range) => {
    const wsRange = ws.getRange(range);
    wsRange.format.fill.color = color;
  });
};

export const processWorksheetAdditions = async (
  context: Excel.RequestContext,
  session: Session,
  worksheets: ProxyWorksheet[]
) => {
  worksheets.forEach((sheet) => sheet.ws.load(["id", "name"]));
  await context.sync();
  worksheets.forEach((sheet) => session.worksheets.push(new Worksheet(sheet.name, sheet.ws.id)));
};

export const getProxyWorksheet = (session: Session, wsName) => {
  return session.worksheets.find((ws) => ws.name === wsName);
};

export const getOrAddWorksheet = async (
  context: Excel.RequestContext,
  session: Session,
  wsDefaults: WorksheetDefaults
) => {
  const wsName = wsDefaults.name;
  const proxyWs = getProxyWorksheet(session, wsName);
  const worksheets = context.workbook.worksheets;
  return proxyWs ? { ws: worksheets.getItem(wsName) } : await addOneWorksheet(context, session, wsDefaults);
};

export const clearUsedRange = async (context: Excel.RequestContext, worksheet: Excel.Worksheet) => {
  const usedRange = worksheet.getUsedRange();
  usedRange.clear();
  await context.sync();
};
