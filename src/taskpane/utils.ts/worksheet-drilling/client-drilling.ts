import { getExcelContext } from "../helperFunctions";
import { getClientNomDetail } from "../taskpane/client-system-access";
import { addWorksheet, getWorksheet } from "../worksheet";

// Called by a click on the client code in the Cerys code analysis sheets.
// Generates an array of client's relevant transactions and calls
// clientNomDetailView to generate a worksheet-based view to display the data.
export async function showClientNominalDetail(e, session) {
  try {
    await Excel.run(async (context) => {//appropriate
      const address = e.address;
      const ws = context.workbook.worksheets.getActiveWorksheet();
      const range = ws.getRange(`${address}:${address}`);
      const values = range.load("values");
      await context.sync();
      const innerValues = values.values;
      const clientCode = innerValues[0][0];
      const detail = getClientNomDetail(clientCode, session);
      clientNomDetailView(context, detail);
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
}

// called by showClientNominalDetail to generate a worksheet-based view of the client
// nominal activity.
async function clientNomDetailView(context, detail) {
  const ws = await addWorksheet(context, `${detail[0].cerysCode} analysis`);
  const headerRange = ws.getRange("A1:D2");
  const headers = [
    ["Transaction", "Transaction", "Detail", "£"],
    ["Number", "Date", "", ""],
  ];
  headerRange.values = headers;
  headerRange.format.font.bold = true;
  const range = ws.getRange(`A3:D${detail.length + 2}`);
  const valuesToPost = [];
  detail.forEach((line) => {
    let arr = [];
    arr.push(line.number);
    arr.push(line.date);
    arr.push(line.detail);
    arr.push(line.value / 100);
    valuesToPost.push(arr);
  });
  range.values = valuesToPost;
  const rangeB = ws.getRange("B:B");
  rangeB.numberFormat = "dd/mm/yyyy";
  const rangeD = ws.getRange("D:D");
  rangeD.numberFormat = "#,##0.00;(#,##0.00);-";
  rangeD.format.horizontalAlignment = "Right";
  const currencyRange = ws.getRange("D1:D1");
  currencyRange.format.horizontalAlignment = "Center";
  const rangeAB = ws.getRange("A:B");
  rangeAB.format.horizontalAlignment = "Left";
  range.format.autofitColumns();
  ws.activate();
}
