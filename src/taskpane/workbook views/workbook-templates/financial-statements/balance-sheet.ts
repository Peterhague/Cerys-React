import { FSCategoryLineBS } from "../../../classes/accounts-category-line";
import { createControlledWorksheet } from "../../../classes/controlled-worksheet";
import { ExcelRangeObject } from "../../../classes/range-objects";
import { Session } from "../../../classes/session";
import { ControlledInputMap } from "../../../classes/transaction-map";
import { BALANCE_SHEET } from "../../../static-values/worksheet-defaults";
import { getOrAddWorksheet } from "../../../utils/worksheet";
import { applyWorkhseetHeader, worksheetHeader } from "../../components/schedule-header";
/* global Excel */

export async function wsBalanceSheet(session: Session) {
  try {
    await Excel.run(async (context) => {
      const balSheet = session.assignment.getBalanceSheet();
      const ws: Excel.Worksheet = await getOrAddWorksheet(context, session, BALANCE_SHEET);
      ws.load(["name", "id"]);
      await context.sync();
      ws.getUsedRange().clear();
      const headerValues = worksheetHeader(session, BALANCE_SHEET.name);
      applyWorkhseetHeader(ws, headerValues);
      const sheetMapping = [];
      const values: any[][] = [
        ["", "", "", "", "£", "£"],
        ["", "", "", "", "", ""],
      ];
      balSheet.forEach((item) => {
        if (item.spaceBefore) values.push(["", "", "", "", "", ""]);
        item.subTotalCol
          ? values.push([item.statementName, "", "", "", item.rawValue, ""])
          : values.push([item.statementName, "", "", "", "", item.rawValue]);
        item.rowNumber = values.length + 8;
        const colNumber = item.subTotalCol ? 5 : 6;
        item.mappable && sheetMapping.push(new ControlledInputMap(item, item.rowNumber, [1, colNumber], null));
        if (item.spaceAfter) values.push(["", "", "", "", "", ""]);
      });
      const excelRangeObj = new ExcelRangeObject({ row: 9, col: 1 }, values);
      const range = ws.getRange(excelRangeObj.address);
      const numbersRange = ws.getRange(`e11:f${values.length + 8}`);
      numbersRange.numberFormat = [["#,##0;(#,##0);-"]];
      range.values = values;
      const currencyRange = ws.getRange("E9:F9");
      currencyRange.format.horizontalAlignment = "Right";
      currencyRange.format.font.bold = true;
      wsBSAccountFormat(ws, balSheet);
      createControlledWorksheet(session, balSheet, ws, values, sheetMapping, excelRangeObj, 1, "cerysCategory");
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
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
