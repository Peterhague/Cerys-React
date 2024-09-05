import { getWorksheet } from "../worksheet";

export function tbForPosting(tb) {
  const tbArray = [];
  tb.sort((a, b) => {
    return a.code - b.code;
  });
  tb.forEach((line) => {
    const lineArr = [];
    lineArr.push(line.code);
    lineArr.push(line.name);
    lineArr.push(line.value / 100);
    tbArray.push(lineArr);
  });
  return tbArray;
}
export async function postTbToWbook(tbExcel) {
  try {
    await Excel.run(async (context) => {
      const ws = getWorksheet(context, "Trial Balance");
      //const usedRange = ws.getUsedRange();
      //usedRange.delete(Excel.DeleteShiftDirection.up);
      //addTbHeadingWs(session, ws);
      //await context.sync();
      const headersRange = ws.getRange("A9:C10");
      //const headers = [
      //  ["Nominal", "Nominal", "Debit/"],
      //  ["Code", "Name", "(Credit)"],
      //];
      //headersRange.values = headers;
      headersRange.format.font.bold = true;
      const range = ws.getRange(`A11:C${tbExcel.length + 10}`);
      range.format.font.bold = false;
      range.values = tbExcel;
      range.format.horizontalAlignment = "Left";
      const total = ws.getRange(`C${tbExcel.length + 12}: C${tbExcel.length + 12}`);
      total.values = [[0]];
      const drCrRange = ws.getRange(`C11:C${tbExcel.length + 12}`);
      drCrRange.numberFormat = "#,##0.00;(#,##0.00);-";
      range.format.autofitColumns();
      total.format.font.bold = true;
      const colC = ws.getRange("C:C");
      colC.format.horizontalAlignment = "Right";
      const topBorder = total.format.borders.getItem("EdgeTop");
      const bottomBorder = total.format.borders.getItem("EdgeBottom");
      topBorder.style = "Continuous";
      bottomBorder.style = "Double";
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
}
