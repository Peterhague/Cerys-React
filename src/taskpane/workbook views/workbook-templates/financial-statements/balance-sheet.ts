import { FSCategoryLineBS } from "../../../classes/accounts-category-line";
import { Session } from "../../../classes/session";
import { BALANCE_SHEET } from "../../../static-values/worksheet-defaults";
import { clearUsedRange, getOrAddWorksheet } from "../../../utils/worksheet";
import { applyWorkhseetHeader, worksheetHeader } from "../../components/schedule-header";
/* global Excel */

export async function wsBalanceSheet(context: Excel.RequestContext, session: Session) {
  const balSheet = session.assignment.getBalanceSheet();
  console.log(balSheet);
  const { ws } = await getOrAddWorksheet(context, session, BALANCE_SHEET);
  await clearUsedRange(context, ws);
  const headerValues = worksheetHeader(session, BALANCE_SHEET.name);
  applyWorkhseetHeader(ws, headerValues);
  const values: any[][] = [
    ["", "", "", "", "£", "£"],
    ["", "", "", "", "", ""],
  ];
  balSheet.forEach((item) => {
    if (item.spaceBefore) values.push(["", "", "", "", "", ""]);
    item.subTotalCol
      ? values.push([item.short, "", "", "", item.rawValue, ""])
      : values.push([item.short, "", "", "", "", item.rawValue]);
    item.rowNumber = values.length + 8;
    if (item.spaceAfter) values.push(["", "", "", "", "", ""]);
  });
  const range = ws.getRange(`a9:f${values.length + 8}`);
  const numbersRange = ws.getRange(`e11:f${values.length + 8}`);
  numbersRange.numberFormat = [["#,##0;(#,##0);-"]];
  range.values = values;
  const currencyRange = ws.getRange("E9:F9");
  currencyRange.format.horizontalAlignment = "Right";
  currencyRange.format.font.bold = true;
  wsBSAccountFormat(ws, balSheet);
}

export function wsBSAccountFormat(ws: Excel.Worksheet, balanceSheet: FSCategoryLineBS[]) {
  balanceSheet.forEach((line) => {
    if (line.sum) {
      const range = ws.getRange(`A${line.rowNumber}:A${line.rowNumber}`);
      range.format.font.bold = true;
      range.format.font.italic = true;
    }
    if (line.calculated)
      ws.getRange(`F${line.rowNumber}:F${line.rowNumber}`).format.borders.getItem("EdgeTop").style = "Continuous";
    if (line.total) {
      const cell = ws.getRange(`F${line.rowNumber}:F${line.rowNumber}`);
      cell.format.borders.getItem("EdgeBottom").style = "Double";
    }
    if (line.subTotal) {
      const cell = ws.getRange(`E${line.rowNumber}:E${line.rowNumber}`);
      cell.format.borders.getItem("EdgeBottom").style = "Continuous";
    }
  });
}
