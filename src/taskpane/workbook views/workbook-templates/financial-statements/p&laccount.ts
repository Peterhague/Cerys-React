import { CalcSwtiches, ReversedProfLossFigures } from "../../../classes/p&laccount";
import { Session } from "../../../classes/session";
import { PL_ACCOUNT } from "../../../static-values/worksheet-defaults";
import { clearUsedRange, getOrAddWorksheet } from "../../../utils/worksheet";
import { applyWorkhseetHeader, worksheetHeader } from "../../components/schedule-header";
/* global Excel */

export async function wsPLAccount(context: Excel.RequestContext, session: Session) {
  const { ws } = await getOrAddWorksheet(context, session, PL_ACCOUNT);
  await clearUsedRange(context, ws);
  const headerValues = worksheetHeader(session, PL_ACCOUNT.name);
  applyWorkhseetHeader(ws, headerValues);
  const values = [];
  values.push(["", "", "", "", "", "£"]);
  values.push(["", "", "", "", "", ""]);
  const currencyRange = ws.getRange("F9:F9");
  currencyRange.format.horizontalAlignment = "Center";
  currencyRange.format.font.bold = true;
  const { turnover, COS, otherOpIncome, distCosts, adminExes, valAdjs, intRec, intPayable, tax } =
    new ReversedProfLossFigures(session);
  let calcSwitches = new CalcSwtiches();
  let runningTotal = 0;
  if (session.assignment.activeCategories.includes("Turnover")) {
    values.push(["Turnover", "", "", "", "", turnover]);
    runningTotal += turnover;
    values.push(["", "", "", "", "", ""]);
  }
  if (session.assignment.activeCategories.includes("Cost of sales")) {
    values.push(["Cost of sales", "", "", "", "", COS]);
    runningTotal += COS;
    values.push(["", "", "", "", "", ""]);
  }
  if (session.assignment.activeCategories.includes("Other operating income")) {
    values.push(["Other operating income", "", "", "", "", otherOpIncome]);
    runningTotal += otherOpIncome;
    values.push(["", "", "", "", "", ""]);
  }
  if (session.assignment.activeCategories.includes("Value adjustments on fixed assets and current asset investments")) {
    values.push(["Value adjustments on fixed assets", "", "", "", "", valAdjs]);
    values.push(["and current asset investments", "", "", "", "", ""]);
    runningTotal += valAdjs;
    values.push(["", "", "", "", "", ""]);
  }
  if (runningTotal >= 0) {
    values.push(["Gross profit", "", "", "", "", runningTotal]);
  } else {
    values.push(["Gross loss", "", "", "", "", runningTotal]);
  }
  values.push(["", "", "", "", "", ""]);
  if (session.assignment.activeCategories.includes("Distribution costs")) {
    values.push(["Distribution costs", "", "", "", "", distCosts]);
    runningTotal += distCosts;
    calcSwitches.calcOpProf = true;
    values.push(["", "", "", "", "", ""]);
  }
  if (session.assignment.activeCategories.includes("Administrative expenses")) {
    values.push(["Administrative expenses", "", "", "", "", adminExes]);
    runningTotal += adminExes;
    calcSwitches.calcOpProf = true;
    values.push(["", "", "", "", "", ""]);
  }
  if (runningTotal >= 0) {
    values.push(["Operating profit", "", "", "", "", runningTotal]);
  } else {
    values.push(["Operating loss", "", "", "", "", runningTotal]);
  }
  values.push(["", "", "", "", "", ""]);
  calcSwitches.calcOrdActs = false;
  if (runningTotal >= 0) {
    values.push(["Profit on ordinary activities before interest", "", "", "", "", runningTotal]);
  } else {
    values.push(["Loss on ordinary activities before interest", "", "", "", "", runningTotal]);
  }
  values.push(["", "", "", "", "", ""]);
  if (session.assignment.activeCategories.includes("Other interest receivable and similar income")) {
    values.push(["Interest receivable and other income", "", "", "", "", intRec]);
    runningTotal += intRec;
    calcSwitches.calcPBIT = true;
    values.push(["", "", "", "", "", ""]);
  }
  if (runningTotal >= 0) {
    values.push(["Profit before interest and taxation", "", "", "", "", runningTotal]);
  } else {
    values.push(["Loss before interest and taxation", "", "", "", "", runningTotal]);
  }
  values.push(["", "", "", "", "", ""]);
  if (session.assignment.activeCategories.includes("Interest payable and similar charges")) {
    values.push(["Interest payable and similar charges", "", "", "", "", intPayable]);
    runningTotal += intPayable;
    calcSwitches.calcPBT = true;
    values.push(["", "", "", "", "", ""]);
  }
  if (runningTotal >= 0) {
    values.push(["Profit before taxation", "", "", "", "", runningTotal]);
  } else {
    values.push(["Loss before taxation", "", "", "", "", runningTotal]);
  }
  values.push(["", "", "", "", "", ""]);
  if (session.assignment.activeCategories.includes("Taxation")) {
    if (runningTotal >= 0) {
      values.push(["Taxation on profit", "", "", "", "", tax]);
    } else {
      values.push(["Taxation on loss", "", "", "", "", tax]);
    }
    runningTotal += tax;
    values.push(["", "", "", "", "", ""]);
  }
  values.push(["", "", "", "", "", ""]);
  if (runningTotal >= 0) {
    values.push(["Profit for the financial year", "", "", "", "", runningTotal]);
  } else {
    values.push(["Loss for the financial year", "", "", "", "", runningTotal]);
  }
  const range = ws.getRange(`A9:F${values.length + 8}`);
  range.values = values;
  const numbersRange = ws.getRange("F:F");
  numbersRange.numberFormat = [["#,##0;(#,##0);-"]];
  wsPLAccountFormat(ws, values, calcSwitches);
  session.assignment.profit = runningTotal * 100;
}

export function wsPLAccountFormat(ws: Excel.Worksheet, values: string[][], calcSwitches: CalcSwtiches) {
  const bold = [];
  const topBorder = [];
  const totalBorders = [];
  for (let i = 0; i < values.length; i++) {
    if (values[i][0] === "Gross profit") {
      topBorder.push(i);
      bold.push(i);
    } else if (values[i][0] === "Gross loss") {
      bold.push(i);
      topBorder.push(i);
    } else if (values[i][0] === "Operating profit") {
      bold.push(i);
      if (calcSwitches.calcOpProf) {
        topBorder.push(i);
      }
    } else if (values[i][0] === "Operating loss") {
      bold.push(i);
      if (calcSwitches.calcOpProf) {
        topBorder.push(i);
      }
    } else if (values[i][0] === "Profit on ordinary activities before interest") {
      bold.push(i);
      if (calcSwitches.calcOrdActs) {
        topBorder.push(i);
      }
    } else if (values[i][0] === "Loss on ordinary activities before interest") {
      bold.push(i);
      if (calcSwitches.calcOrdActs) {
        topBorder.push(i);
      }
    } else if (values[i][0] === "Profit before interest and taxation") {
      bold.push(i);
      if (calcSwitches.calcPBIT) {
        topBorder.push(i);
      }
    } else if (values[i][0] === "Loss before interest and taxation") {
      bold.push(i);
      if (calcSwitches.calcPBIT) {
        topBorder.push(i);
      }
    } else if (values[i][0] === "Profit before taxation") {
      bold.push(i);
      if (calcSwitches.calcPBT) {
        topBorder.push(i);
      }
    } else if (values[i][0] === "Loss before taxation") {
      bold.push(i);
      if (calcSwitches.calcPBT) {
        topBorder.push(i);
      }
    } else if (values[i][0] === "Profit for the financial year") {
      bold.push(i);
      totalBorders.push(i);
    } else if (values[i][0] === "Loss for the financial year") {
      bold.push(i);
      totalBorders.push(i);
    }
  }
  bold.forEach((i) => {
    const aCell = ws.getRange(`A${i + 9}:A${i + 9}`);
    aCell.format.font.bold = true;
  });
  topBorder.forEach((i) => {
    const fCell = ws.getRange(`F${i + 9}:F${i + 9}`);
    const edgeTop = fCell.format.borders.getItem("EdgeTop");
    edgeTop.style = "Continuous";
  });
  totalBorders.forEach((i) => {
    const fCell = ws.getRange(`F${i + 9}:F${i + 9}`);
    const edgeTop = fCell.format.borders.getItem("EdgeTop");
    edgeTop.style = "Continuous";
    const edgeBottom = fCell.format.borders.getItem("EdgeBottom");
    edgeBottom.style = "Double";
    const aCell = ws.getRange(`A${i + 9}:A${i + 9}`);
    aCell.format.font.bold = true;
  });
}
