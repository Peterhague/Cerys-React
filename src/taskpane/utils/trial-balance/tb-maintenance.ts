import { createControlledWorksheet, updateControlledWorksheet } from "../../classes/controlled-worksheet";
import { ExcelRangeObject } from "../../classes/excel-range-object";
import { Session } from "../../classes/session";
import { ControlledInputMap } from "../../classes/transaction-map";
import { TRIAL_BALANCE } from "../../static-values/worksheet-defaults";
import { STANDARD_NUMBER_FORMAT } from "../../static-values/worksheet-formats";
import { TB_WSNAME } from "../../static-values/worksheet-names";
import { applyWorkhseetHeader, worksheetHeader } from "../../workbook views/components/schedule-header";
import { clearUsedRange, getOrAddWorksheet } from "../worksheet";
/* global Excel */

export async function wsTrialBalance(context: Excel.RequestContext, session: Session) {
  const { ws } = await getOrAddWorksheet(context, session, TRIAL_BALANCE);
  await clearUsedRange(context, ws);
  const headerValues = worksheetHeader(session, TRIAL_BALANCE.name);
  applyWorkhseetHeader(ws, headerValues);
  const headersRange = ws.getRange("A9:C10");
  const headers = [
    ["Nominal", "Nominal", "Debit/"],
    ["Code", "Name", "(Credit)"],
  ];
  headersRange.values = headers;
  headersRange.format.font.bold = true;
  const trialBalance = session.assignment.tb;
  const tBValues = [];
  const sheetMapping = [];
  trialBalance.forEach((line) => {
    tBValues.push([`${line.cerysCode}`, `${line.cerysName}`, `${line.value / 100}`]);
    sheetMapping.push(new ControlledInputMap(line, "_id", sheetMapping.length + 11));
  });
  const excelRangeObj = new ExcelRangeObject({ row: 11, col: 1 }, tBValues);
  const range = ws.getRange(excelRangeObj.address);
  range.format.font.bold = false;
  range.values = tBValues;
  range.format.horizontalAlignment = "Left";
  const total = ws.getRange(`C${tBValues.length + 12}: C${tBValues.length + 12}`);
  total.values = [[0]];
  const drCrRange = ws.getRange(`C11:C${tBValues.length + 12}`);
  drCrRange.numberFormat = STANDARD_NUMBER_FORMAT;
  range.format.autofitColumns();
  total.format.font.bold = true;
  const colC = ws.getRange("C:C");
  colC.format.horizontalAlignment = "Right";
  const topBorder = total.format.borders.getItem("EdgeTop");
  const bottomBorder = total.format.borders.getItem("EdgeBottom");
  topBorder.style = "Continuous";
  bottomBorder.style = "Double";
  if (session.controlledSheets.find((ws) => ws.name === TB_WSNAME)) {
    updateControlledWorksheet(session, trialBalance, tBValues, sheetMapping, excelRangeObj, 1, TB_WSNAME);
  } else {
    createControlledWorksheet(session, trialBalance, ws, tBValues, sheetMapping, excelRangeObj, 1, "cerysCode");
  }
}
