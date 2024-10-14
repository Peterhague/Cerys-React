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

export const highlightEditableRanges = async (sheet) => {
  await Excel.run(async (context) => {
    const ws = context.workbook.worksheets.getActiveWorksheet();
    sheet.editableRanges.forEach((edRange) => {
      const range = ws.getRange(edRange);
      range.format.fill.color = "yellow";
    });
    await context.sync();
  });
};

export const unhighlightEditableRanges = async (sheet) => {
  await Excel.run(async (context) => {
    const ws = context.workbook.worksheets.getActiveWorksheet();
    sheet.editableRanges.forEach((edRange) => {
      const range = ws.getRange(edRange);
      range.clear("Formats");
      const dateRange = ws.getRange(sheet.dateDetails.range);
      dateRange.numberFormat = sheet.dateDetails.format;
      console.log(range);
    });
    await context.sync();
  });
};
