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

export function getWorksheet(context, sheetName) {
  return context.workbook.worksheets.getItem(sheetName);
}

export function getWorksheetAndRange(context, sheetName, range) {
  const ws = context.workbook.worksheets.getItem(sheetName);
  const sheetRange = ws.getRange(range);
  return { ws, range: sheetRange };
}

export async function gotToWorksheet(context, sheetName) {
  const sheet = context.workbook.worksheets.getItem(sheetName);
  sheet.activate();
}

export const getActiveWorksheet = async () => {
  const ws = await Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getActiveWorksheet();
    sheet.load("name");
    await context.sync();
    return sheet;
  });
  return ws;
};

export const getActiveWorksheetName = async () => {
  const sheetName = await Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getActiveWorksheet();
    sheet.load("name");
    await context.sync();
    const name = sheet.name;
    return name;
  });
  return sheetName;
};

export const getWorksheetUsedRange = async (wsName) => {
  const usedRange = await Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getItem(wsName);
    const range = sheet.getUsedRange();
    range.load("values");
    await context.sync();
    const values = range.values;
    return values;
  });
  return usedRange;
};

export const setExcelRangeValue = async (wsName, range, value) => {
  await Excel.run(async (context) => {
    const ws = context.workbook.worksheets.getItem(wsName);
    const wsRange = ws.getRange(range);
    wsRange.values = value;
    await context.sync();
  });
};

export const setManyExcelRangeValues = async (wsName, updates) => {
  await Excel.run(async (context) => {
    const ws = context.workbook.worksheets.getItem(wsName);
    updates.forEach((update) => {
      const range = ws.getRange(update.address);
      range.values = update.value;
    });
    await context.sync();
  });
};

export const highlightEditableRanges = async (sheet) => {
  await Excel.run(async (context) => {
    const ws = context.workbook.worksheets.getActiveWorksheet();
    sheet.editableRowRanges.forEach((range) => {
      console.log(sheet);
      if (!sheet.dateColDetails.deleted) {
        const dateRange = `${sheet.dateColDetails.colLetter}${range.firstRow}:${sheet.dateColDetails.colLetter}${range.lastRow}`;
        const wsDateRange = ws.getRange(dateRange);
        wsDateRange.format.fill.color = "yellow";
      }
      if (!sheet.codeColDetails.deleted) {
        const codeRange = `${sheet.codeColDetails.colLetter}${range.firstRow}:${sheet.codeColDetails.colLetter}${range.lastRow}`;
        const wsCodeRange = ws.getRange(codeRange);
        wsCodeRange.format.fill.color = "yellow";
      }
      if (!sheet.narrColDetails.deleted) {
        const narrRange = `${sheet.narrColDetails.colLetter}${range.firstRow}:${sheet.narrColDetails.colLetter}${range.lastRow}`;
        const wsNarrRange = ws.getRange(narrRange);
        wsNarrRange.format.fill.color = "yellow";
      }
    });
    await context.sync();
  });
};

export const unhighlightEditableRanges = async (sheet) => {
  await Excel.run(async (context) => {
    const ws = context.workbook.worksheets.getActiveWorksheet();
    sheet.editableRowRanges.forEach((range) => {
      if (!sheet.dateColDetails.deleted) {
        const dateRange = `${sheet.dateColDetails.colLetter}${range.firstRow}:${sheet.dateColDetails.colLetter}${range.lastRow}`;
        const wsDateRange = ws.getRange(dateRange);
        wsDateRange.format.fill.clear();
      }
      if (!sheet.codeColDetails.deleted) {
        const codeRange = `${sheet.codeColDetails.colLetter}${range.firstRow}:${sheet.codeColDetails.colLetter}${range.lastRow}`;
        const wsCodeRange = ws.getRange(codeRange);
        wsCodeRange.format.fill.clear();
      }
      if (!sheet.narrColDetails.deleted) {
        const narrRange = `${sheet.narrColDetails.colLetter}${range.firstRow}:${sheet.narrColDetails.colLetter}${range.lastRow}`;
        const wsNarrRange = ws.getRange(narrRange);
        wsNarrRange.format.fill.clear();
      }
    });
    await context.sync();
  });
};
