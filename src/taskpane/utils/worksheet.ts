import { EditableWorksheet } from "../classes/editable-worksheet";
import { ExcelDeletionObject, ExcelRangeUpdate } from "../classes/excel-range-editing";
import { Session } from "../classes/session";
import { WorksheetDefaults } from "../interfaces/interfaces";
import { colNumToLetter } from "./excel-col-conversion";
/* global Excel */

export const addDefaultWorksheet = async (
  context: Excel.RequestContext,
  session: Session,
  wsDefaults: WorksheetDefaults
) => {
  const ws = context.workbook.worksheets.add(wsDefaults.name);
  wsDefaults.addListeners && wsDefaults.addListeners.forEach((fn) => fn(context, session));
  return ws;
};

export const addWorksheets = async (context: Excel.RequestContext, sheetNames: string[]) => {
  const worksheets: Excel.Worksheet[] = [];
  sheetNames.forEach((i) => {
    const ws = context.workbook.worksheets.add(i);
    worksheets.push(ws);
  });
  return worksheets;
};

export async function deleteWorksheet(sheetName: string) {
  try {
    await Excel.run(async (context) => {
      context.workbook.worksheets.getItem(sheetName).delete();
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
}

export const deleteManyWorksheets = async (sheetsToDelete: string[]) => {
  try {
    await Excel.run(async (context) => {
      const sheets = [];
      sheetsToDelete.forEach((sheet) => {
        const ws = context.workbook.worksheets.getItemOrNullObject(sheet);
        sheets.push(ws);
      });
      sheets.forEach((sheet) => {
        if (sheet) sheet.delete();
      });
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
};

export const getWorksheet = async (context: Excel.RequestContext, sheetNameOrId: string) => {
  const ws = context.workbook.worksheets.getItem(sheetNameOrId);
  return ws;
};

export const getWorksheetAndRange = async (context: Excel.RequestContext, sheetName: string, range: string) => {
  const ws = context.workbook.worksheets.getItem(sheetName);
  const sheetRange = ws.getRange(range);
  return { ws, range: sheetRange };
};

export const getWorksheetRangeValues = async (wsName: string, range: string) => {
  try {
    const returnVal = await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getItem(wsName);
      const wsRange = sheet.getRange(range);
      wsRange.load("values");
      await context.sync();
      return wsRange.values;
    });
    return returnVal;
  } catch (e) {
    console.error(e);
    return e;
  }
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

export const activateWorksheet = async (wsName: string) => {
  try {
    await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getItem(wsName);
      sheet.activate();
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
};

export const getActiveWorksheetName = async () => {
  try {
    const returnVal = await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      sheet.load("name");
      await context.sync();
      const name = sheet.name;
      await context.sync();
      return name;
    });
    return returnVal;
  } catch (e) {
    console.error(e);
    return e;
  }
};

export const getWorksheetUsedRange = async (wsName: string) => {
  try {
    const returnVal = await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getItem(wsName);
      const range = sheet.getUsedRange();
      range.load("values");
      await context.sync();
      const values = range.values;
      return values;
    });
    return returnVal;
  } catch (e) {
    console.error(e);
    return e;
  }
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

export const setManyExcelRangeValues = async (wsName: string, updates: ExcelRangeUpdate[]) => {
  try {
    await Excel.run(async (context) => {
      const ws = context.workbook.worksheets.getItem(wsName);
      updates.forEach((update) => {
        const range = ws.getRange(update.address);
        range.values = update.value;
      });
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
};

export const setManyWorksheetRangeValues = async (updates: ExcelRangeUpdate[]) => {
  try {
    await Excel.run(async (context) => {
      updates.forEach((update) => {
        const ws = context.workbook.worksheets.getItem(update.wsName);
        const range = ws.getRange(update.address);
        range.values = update.value;
      });
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
};

export const deleteWorksheetRangesUp = async (deletionObjs: ExcelDeletionObject[]) => {
  try {
    await Excel.run(async (context) => {
      deletionObjs.forEach((obj) => {
        obj.worksheet = context.workbook.worksheets.getItemOrNullObject(obj.wsName);
      });
      await context.sync();
      deletionObjs.forEach((obj) => {
        const range = obj.worksheet && obj.worksheet.getRange(obj.range);
        range.delete("Up");
      });
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
};

export const deleteWorksheetRangeDown = async (wsName: string, range: string) => {
  try {
    await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getItem(wsName);
      const wsRange = sheet.getRange(range);
      wsRange.delete(Excel.DeleteShiftDirection.up);
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
};

export const highlightEditableRanges = async (sheet: EditableWorksheet) => {
  try {
    await Excel.run(async (context) => {
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
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
};

export const unhighlightEditableRanges = async (sheet: EditableWorksheet) => {
  try {
    await Excel.run(async (context) => {
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
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
};

export const highlightRanges = async (wsName: string, ranges: string[], color: string) => {
  try {
    await Excel.run(async (context) => {
      const ws = context.workbook.worksheets.getItem(wsName);
      ranges.forEach((range) => {
        const wsRange = ws.getRange(range);
        wsRange.format.fill.color = color;
      });
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
};

export const getOrAddWorksheet = async (
  context: Excel.RequestContext,
  session: Session,
  wsDefaults: WorksheetDefaults
) => {
  const wsName = wsDefaults.name;
  const worksheets = context.workbook.worksheets;
  let ws = worksheets.getItemOrNullObject(wsName);
  await context.sync();
  if (ws.isNullObject) ws = await addDefaultWorksheet(context, session, wsDefaults);
  return ws;
};

export const clearUsedRange = async (worksheet: Excel.Worksheet) => {
  const usedRange = worksheet.getUsedRange();
  usedRange.clear();
};

export const loadWorksheetProperties = async (
  context: Excel.RequestContext,
  ws: Excel.Worksheet,
  properties: string[]
) => {
  ws.load(properties);
  await context.sync();
  const obj = {};
  properties.forEach((prop) => {
    obj[prop] = ws[prop];
  });
  return obj;
};
