import { FSCategoryLinePL } from "../../../classes/accounts-category-line";
import { createControlledWorksheet, updateControlledWorksheet } from "../../../classes/controlled-worksheet";
import { Session } from "../../../classes/session";
import { PL_ACCOUNT } from "../../../static-values/worksheet-defaults";
import { clearUsedRange, getOrAddWorksheet } from "../../../utils/worksheet";
import { applyWorkhseetHeader, worksheetHeader } from "../../components/schedule-header";
/* global Excel */

export async function wsPLAccount(context: Excel.RequestContext, session: Session) {
  const pLoss = session.assignment.getPLAccount();
  console.log(pLoss);
  const { ws } = await getOrAddWorksheet(context, session, PL_ACCOUNT);
  await clearUsedRange(context, ws);
  const headerValues = worksheetHeader(session, PL_ACCOUNT.name);
  applyWorkhseetHeader(ws, headerValues);
  const pLValues = [];
  pLValues.push(["", "", "", "", "", "£"]);
  pLoss.forEach((item) => {
    pLValues.push(["", "", "", "", "", ""]);
    item.total && pLValues.push(["", "", "", "", "", ""]);
    pLValues.push([item.short, "", "", "", "", item.fSValue]);
    item.rowNumber = pLValues.length + 8;
    item.shortTwo && pLValues.push([item.shortTwo, "", "", "", "", ""]);
  });
  console.log(pLValues);
  const currencyRange = ws.getRange("F9:F9");
  currencyRange.format.horizontalAlignment = "Center";
  currencyRange.format.font.bold = true;
  const range = ws.getRange(`A9:F${pLValues.length + 8}`);
  range.values = pLValues;
  const numbersRange = ws.getRange("F:F");
  numbersRange.numberFormat = [["#,##0;(#,##0);-"]];
  wsPLAccountFormat(ws, pLoss);
  // if (session.controlledSheets.find((ws) => ws.name === PL_WSNAME)) {
  //   updateControlledWorksheet(session, trialBalance, tBValues, sheetMapping, excelRangeObj, 1, TB_WSNAME);
  // } else {
  //   createControlledWorksheet(session, trialBalance, ws, tBValues, sheetMapping, excelRangeObj, 1, "cerysCode");
  // }
}

export function wsPLAccountFormat(ws: Excel.Worksheet, profLossAccount: FSCategoryLinePL[]) {
  profLossAccount.forEach((line) => {
    if (line.sum) ws.getRange(`A${line.rowNumber}:A${line.rowNumber}`).format.font.bold = true;
    if (line.calculated)
      ws.getRange(`F${line.rowNumber}:F${line.rowNumber}`).format.borders.getItem("EdgeTop").style = "Continuous";
    if (line.total) {
      const cell = ws.getRange(`F${line.rowNumber}:F${line.rowNumber}`);
      cell.format.borders.getItem("EdgeBottom").style = "Double";
    }
  });
}
