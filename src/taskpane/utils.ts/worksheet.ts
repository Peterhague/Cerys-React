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
  return { ws: ws, range: sheetRange };
}

export async function gotToWorksheet(context, sheetName) {
  const sheet = context.workbook.worksheets.getItem(sheetName);
  sheet.activate();
}
