import { createControlledWorksheet } from "../../classes/controlled-worksheet";
import { DrillableCollection } from "../../classes/drillable-collection";
import { ExcelRangeObject } from "../../classes/range-objects";
import { Session } from "../../classes/session";
import { ControlledInputMap } from "../../classes/transaction-map";
import { TRIAL_BALANCE } from "../../static-values/worksheet-defaults";
import { STANDARD_NUMBER_FORMAT } from "../../static-values/worksheet-formats";
import { applyWorkhseetHeader, worksheetHeader } from "../../workbook views/components/schedule-header";
import { getOrAddWorksheet } from "../worksheet";
import { cerysNomDetailView } from "../worksheet-drilling/cerys-drilling";
/* global Excel */

export async function wsTrialBalance(session: Session) {
  try {
    await Excel.run(async (context) => {
      const ws: Excel.Worksheet = await getOrAddWorksheet(context, session, TRIAL_BALANCE);
      ws.load(["name", "id"]);
      await context.sync();
      ws.getUsedRange().clear();
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
      const sheetMapping: ControlledInputMap[] = [];
      trialBalance.forEach((line) => {
        tBValues.push([`${line.cerysCode}`, `${line.cerysName}`, `${line.value / 100}`]);
        const transactions = line.getCerysTransactions(session);
        const nomDetailDrillableCollection = new DrillableCollection(transactions, null, [1, 2, 3], cerysNomDetailView);
        sheetMapping.push(
          new ControlledInputMap(line, tBValues.length + 10, [1, 2, 3], [nomDetailDrillableCollection])
        );
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
      createControlledWorksheet(session, trialBalance, ws, tBValues, sheetMapping, excelRangeObj, 1, "cerysCode");
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
}
