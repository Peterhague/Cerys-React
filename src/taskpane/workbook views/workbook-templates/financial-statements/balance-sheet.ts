import { Assignment } from "../../../classes/assignment";
import { Session } from "../../../classes/session";
import { BALANCE_SHEET } from "../../../static-values/worksheet-defaults";
import { clearUsedRange, getOrAddWorksheet } from "../../../utils/worksheet";
import { applyWorkhseetHeader, worksheetHeader } from "../../components/schedule-header";
/* global Excel */

export async function wsBalanceSheet(context: Excel.RequestContext, session: Session) {
  const { ws } = await getOrAddWorksheet(context, session, BALANCE_SHEET);
  await clearUsedRange(context, ws);
  const headerValues = worksheetHeader(session, BALANCE_SHEET.name);
  applyWorkhseetHeader(ws, headerValues);
  const values = [
    ["", "", "", "", "£", "£"],
    ["", "", "", "", "", ""],
  ];
  if (
    session.assignment.activeCategories.includes("Intangible assets") ||
    session.assignment.activeCategories.includes("Tangible assets") ||
    session.assignment.activeCategories.includes("Fixed asset investments") ||
    session.assignment.activeCategories.includes("Investment property")
  ) {
    const nextArrays = displayFixedAssets(session.assignment);
    nextArrays.forEach((arr) => {
      values.push(arr);
    });
  }
  if (
    session.assignment.activeCategories.includes("Stocks") ||
    session.assignment.activeCategories.includes("Debtors") ||
    session.assignment.activeCategories.includes("Financial assets") ||
    session.assignment.activeCategories.includes("Cash")
  ) {
    const arrays = displayCurrentAssets(session.assignment);
    arrays.forEach((arr) => {
      values.push(arr);
    });
  }
  if (session.assignment.activeCategories.includes("Creditors < 1 year")) {
    const nextArrays = displayCurrentLiabilities(session.assignment);
    nextArrays.forEach((arr) => {
      values.push(arr);
    });
  }
  values.push(["", "", "", "", "", ""]);
  const netCA = calculateNCA(session.assignment);
  if (netCA) {
    if (netCA > 0) {
      values.push(["Net current assets", "", "", "", "", netCA.toString()]);
    } else {
      values.push(["Net current liabilities", "", "", "", "", netCA.toString()]);
    }
  }
  values.push(["", "", "", "", "", ""]);
  const tALCL = totalAssetsLessCL(session.assignment);
  if (tALCL >= 0) {
    values.push(["Total assets less current liabilities", "", "", "", "", tALCL.toString()]);
  } else {
    values.push(["Current liabilities less total assets", "", "", "", "", tALCL.toString()]);
  }
  if (session.assignment.activeCategories.includes("Creditors > 1 year")) {
    const nextArrays = displayNonCurrentLiabilities(session.assignment);
    nextArrays.forEach((arr) => {
      values.push(arr);
    });
  }
  if (session.assignment.activeCategories.includes("Provisions for liabilities")) {
    const nextArrays = displayProvisions(session.assignment);
    nextArrays.forEach((arr) => {
      values.push(arr);
    });
  }
  values.push(["", "", "", "", "", ""]);
  const netAssets = calculateNetAssets(session.assignment);
  if (netAssets >= 0) {
    values.push(["Net assets", "", "", "", "", netAssets.toString()]);
  } else {
    values.push(["Net liabilities", "", "", "", "", netAssets.toString()]);
  }
  if (netAssets !== 0) {
    const arrs = [
      ["", "", "", "", "", ""],
      ["", "", "", "", "", ""],
      ["Capital and reserves", "", "", "", "", ""],
      ["", "", "", "", "", ""],
    ];
    arrs.forEach((arr) => {
      values.push(arr);
    });
  }
  if (session.assignment.activeCategories.includes("Share capital")) {
    const arr = displayShareCapital(session.assignment);
    values.push(arr);
  }
  if (session.assignment.activeCategories.includes("Share premium")) {
    const arr = displaySharePremium(session.assignment);
    values.push(arr);
  }
  if (session.assignment.activeCategories.includes("Capital redemption reserve")) {
    const arr = displayCRR(session.assignment);
    values.push(arr);
  }
  if (session.assignment.activeCategories.includes("Other reserves 1")) {
    const arr = displayOtherRes(session.assignment);
    values.push(arr);
  }
  if (session.assignment.activeCategories.includes("Fair value reserve")) {
    const arr = displayFVRes(session.assignment);
    values.push(arr);
  }
  if (session.assignment.activeCategories.includes("Other reserves 2")) {
    const arr = displayOtherRes2(session.assignment);
    values.push(arr);
  }
  if (session.assignment.activeCategories.includes("Other reserves 3")) {
    const arr = displayOtherRes3(session.assignment);
    values.push(arr);
  }
  if (session.assignment.activeCategories.includes("Other reserves 4")) {
    const arr = displayOtherRes4(session.assignment);
    values.push(arr);
  }
  if (session.assignment.activeCategories.includes("Other reserves 5")) {
    const arr = displayOtherRes5(session.assignment);
    values.push(arr);
  }
  if (session.assignment.activeCategories.includes("Minority interest")) {
    const arr = displayMinorityInt(session.assignment);
    values.push(arr);
  }
  if (session.assignment.activeCategories.includes("Profit & loss reserve") || session.assignment.profit !== 0) {
    const arr = displayPLRes(session.assignment);
    values.push(arr);
  }
  values.push(["", "", "", "", "", ""]);
  let equity = 0;
  session.assignment.activeCategoriesDetails.forEach((obj) => {
    if (obj.cerysCategory === "Capital & reserves") equity = obj.value / 100;
  });
  session.assignment.activeCategoriesDetails.forEach((obj) => {
    if (obj.cerysCategory === "Profit & loss reserve") equity += obj.value / 100;
  });
  values.push(["Total equity", "", "", "", "", (-equity + session.assignment.profit / 100).toString()]);
  const range = ws.getRange(`a9:f${values.length + 8}`);
  const numbersRange = ws.getRange(`e11:f${values.length + 8}`);
  numbersRange.numberFormat = [["#,##0;(#,##0);-"]];
  const cleansedValues = cleanseValues(values);
  range.values = cleansedValues;
  const currencyRange = ws.getRange("E9:F9");
  currencyRange.format.horizontalAlignment = "Right";
  currencyRange.format.font.bold = true;
  wsBSAccountFormat(ws, values);
}

export async function wsBSAccountFormat(ws: Excel.Worksheet, values: string[][]) {
  let bold = [];
  let italic = [];
  const topBorder = [];
  const botttomBorder = [];
  const totalBorders = [];
  for (let i = 0; i < values.length; i++) {
    if (values[i][0] === "Fixed assets") {
      bold.push(i);
      italic.push(i);
    } else if (values[i][0] === "Current assets") {
      bold.push(i);
      italic.push(i);
    } else if (values[i][0] === "Current liabilities") {
      bold.push(i);
      italic.push(i);
    } else if (values[i][0] === "Net current assets") {
      bold.push(i);
      italic.push(i);
    } else if (values[i][0] === "Total assets less current liabilities") {
      bold.push(i);
      italic.push(i);
    } else if (values[i][0] === "Creditors due in > 1 year") {
      bold.push(i);
      italic.push(i);
    } else if (values[i][0] === "Provisions for liabilities") {
      bold.push(i);
      italic.push(i);
    } else if (values[i][0] === "Net assets") {
      bold.push(i);
      italic.push(i);
      totalBorders.push(i);
    } else if (values[i][0] === "Capital and reserves") {
      bold.push(i);
      italic.push(i);
    } else if (values[i][0] === "Total equity") {
      bold.push(i);
      italic.push(i);
      totalBorders.push(i);
    } else if (values[i][0] === "subtotal") {
      topBorder.push(i);
    } else if (values[i][0] === "subtotalBottom") {
      botttomBorder.push(i);
    }
  }
  bold.forEach((i) => {
    const aCell = ws.getRange(`A${i + 9}:A${i + 9}`);
    aCell.format.font.bold = true;
  });
  italic.forEach((i) => {
    const aCell = ws.getRange(`A${i + 9}:A${i + 9}`);
    aCell.format.font.italic = true;
  });
  topBorder.forEach((i) => {
    const fCell = ws.getRange(`F${i + 9}:F${i + 9}`);
    const edgeTop = fCell.format.borders.getItem("EdgeTop");
    edgeTop.style = "Continuous";
  });
  botttomBorder.forEach((i) => {
    const eCell = ws.getRange(`E${i + 9}:E${i + 9}`);
    const edgeBottom = eCell.format.borders.getItem("EdgeBottom");
    edgeBottom.style = "Continuous";
  });
  totalBorders.forEach((i) => {
    const fCell = ws.getRange(`F${i + 9}:F${i + 9}`);
    const edgeTop = fCell.format.borders.getItem("EdgeTop");
    edgeTop.style = "Continuous";
    const edgeBottom = fCell.format.borders.getItem("EdgeBottom");
    edgeBottom.style = "Double";
  });
}

export function cleanseValues(values: string[][]) {
  const cleansedValues = [];
  values.forEach((arr) => {
    const newArr = [];
    arr.forEach((i) => {
      if (i === "subtotal" || i === "subtotalBottom") {
        newArr.push("");
      } else {
        newArr.push(i);
      }
    });
    cleansedValues.push(newArr);
  });
  return cleansedValues;
}

function calculateNCA(assignment: Assignment) {
  if (assignment.tCA && assignment.tCL) {
    return assignment.tCA + assignment.tCL;
  } else if (assignment.tCA && !assignment.tCL) {
    return assignment.tCA;
  } else if (assignment.tCL && !assignment.tCA) {
    return assignment.tCL;
  } else {
    return null;
  }
}

function totalAssetsLessCL(assignment: Assignment) {
  let fig = 0;
  if (assignment.nonCA) fig += assignment.nonCA;
  if (assignment.tCA) fig += assignment.tCA;
  if (assignment.tCL) fig += assignment.tCL;
  return fig;
}

function calculateNetAssets(assignment: Assignment) {
  let fig = 0;
  if (assignment.nonCA) fig += assignment.nonCA;
  if (assignment.tCA) fig += assignment.tCA;
  if (assignment.tCL) fig += assignment.tCL;
  if (assignment.nonCL) fig += assignment.nonCL;
  if (assignment.provisions) fig += assignment.provisions;
  return fig;
}

function displayFixedAssets(assignment: Assignment) {
  const arrays = [
    ["Fixed assets", "", "", "", "", ""],
    ["", "", "", "", "", ""],
  ];
  let subtotal = 0;
  if (assignment.activeCategories.includes("Intangible assets")) {
    let value = 0;
    assignment.activeCategoriesDetails.forEach((cat) => {
      if (cat.cerysCategory === "Intangible assets") {
        value = cat.value;
      }
    });
    const iARow = ["Intangible assets", "", "", "", "", (value / 100).toString()];
    arrays.push(iARow);
    subtotal += value;
  }
  if (assignment.activeCategories.includes("Tangible assets")) {
    let value = 0;
    assignment.activeCategoriesDetails.forEach((cat) => {
      if (cat.cerysCategory === "Tangible assets") {
        value = cat.value;
      }
    });
    const tARow = ["Tangible assets", "", "", "", "", (value / 100).toString()];
    arrays.push(tARow);
    subtotal += value;
  }
  if (assignment.activeCategories.includes("Fixed asset investments")) {
    let value = 0;
    assignment.activeCategoriesDetails.forEach((cat) => {
      if (cat.cerysCategory === "Fixed asset investments") {
        value = cat.value;
      }
    });
    const fAIRow = ["Fixed asset investments", "", "", "", "", (value / 100).toString()];
    arrays.push(fAIRow);
    subtotal += value;
  }
  if (assignment.activeCategories.includes("Investment property")) {
    let value = 0;
    assignment.activeCategoriesDetails.forEach((cat) => {
      if (cat.cerysCategory === "Investment property") {
        value = cat.value;
      }
    });
    const iPRow = ["Investment property", "", "", "", "", (value / 100).toString()];
    arrays.push(iPRow);
    subtotal += value;
  }
  arrays.push(["", "", "", "", "", ""]);
  arrays.push(["subtotal", "", "", "", "", (subtotal / 100).toString()]);
  assignment.nonCA = subtotal / 100;
  return arrays;
}

function displayCurrentAssets(assignment: Assignment) {
  const arrays = [
    ["Current assets", "", "", "", "", ""],
    ["", "", "", "", "", ""],
  ];
  let subtotal = 0;
  if (assignment.activeCategories.includes("Stocks")) {
    let value = 0;
    assignment.activeCategoriesDetails.forEach((cat) => {
      if (cat.cerysCategory === "Stocks") {
        value = cat.value;
      }
    });
    const stocksRow = ["Stocks", "", "", "", (value / 100).toString(), ""];
    arrays.push(stocksRow);
    subtotal += value;
  }
  if (assignment.activeCategories.includes("Debtors")) {
    let value = 0;
    assignment.activeCategoriesDetails.forEach((cat) => {
      if (cat.cerysCategory === "Debtors") {
        value = cat.value;
      }
    });
    const debtorsRow = ["Debtors", "", "", "", (value / 100).toString(), ""];
    arrays.push(debtorsRow);
    subtotal += value;
  }
  if (assignment.activeCategories.includes("Financial assets")) {
    let value = 0;
    assignment.activeCategoriesDetails.forEach((cat) => {
      if (cat.cerysCategory === "Financial assets") {
        value = cat.value;
      }
    });
    const finAssetsRow = ["Financial assets", "", "", "", (value / 100).toString(), ""];
    arrays.push(finAssetsRow);
    subtotal += value;
  }
  if (assignment.activeCategories.includes("Cash")) {
    let value = 0;
    assignment.activeCategoriesDetails.forEach((cat) => {
      if (cat.cerysCategory === "Cash") {
        value = cat.value;
      }
    });
    const cashRow = ["Cash at bank and in hand", "", "", "", (value / 100).toString(), ""];
    arrays.push(cashRow);
    subtotal += value;
  }
  arrays.push(["subtotalBottom", "", "", "", "", (subtotal / 100).toString()]);
  assignment.tCA = subtotal / 100;
  return arrays;
}

function displayCurrentLiabilities(assignment: Assignment) {
  const arrays = [
    ["Current liabilities", "", "", "", "", ""],
    ["", "", "", "", "", ""],
  ];
  let subtotal = 0;
  let value = 0;
  assignment.activeCategoriesDetails.forEach((cat) => {
    if (cat.cerysCategory === "Creditors < 1 year") {
      value = cat.value;
    }
  });
  const curCredRow = ["Creditors due in < 1 year", "", "", "", (value / 100).toString(), ""];
  arrays.push(curCredRow);
  subtotal += value;
  arrays.push(["subtotalBottom", "", "", "", "", (subtotal / 100).toString()]);
  assignment.tCL = subtotal / 100;
  return arrays;
}

function displayNonCurrentLiabilities(assignment: Assignment) {
  const arrays = [["", "", "", "", "", ""]];
  let subtotal = 0;
  let value = 0;
  assignment.activeCategoriesDetails.forEach((cat) => {
    if (cat.cerysCategory === "Creditors > 1 year") {
      value = cat.value;
    }
  });
  const nonCurCredRow = ["Creditors due in > 1 year", "", "", "", "", (value / 100).toString()];
  arrays.push(nonCurCredRow);
  subtotal += value;
  assignment.nonCL = subtotal / 100;
  return arrays;
}

function displayProvisions(assignment: Assignment) {
  const arrays = [["", "", "", "", "", ""]];
  let subtotal = 0;
  let value = 0;
  assignment.activeCategoriesDetails.forEach((cat) => {
    if (cat.cerysCategory === "Provisions for liabilities") {
      value = cat.value;
    }
  });
  const provisionsRow = ["Provisions for liabilities", "", "", "", "", (value / 100).toString()];
  arrays.push(provisionsRow);
  subtotal += value;
  assignment.provisions = subtotal / 100;
  return arrays;
}

function displayShareCapital(assignment: Assignment) {
  let subtotal = 0;
  let value = 0;
  assignment.activeCategoriesDetails.forEach((cat) => {
    if (cat.cerysCategory === "Share capital") {
      value = cat.value;
    }
  });
  const shareCapRow = ["Share capital", "", "", "", "", (-value / 100).toString()];
  subtotal += value;
  assignment.shareCapital = subtotal / 100;
  return shareCapRow;
}

function displaySharePremium(assignment: Assignment) {
  let subtotal = 0;
  let value = 0;
  assignment.activeCategoriesDetails.forEach((cat) => {
    if (cat.cerysCategory === "Share premium") {
      value = cat.value;
    }
  });
  const sharePremRow = ["Share premium", "", "", "", "", (-value / 100).toString()];
  subtotal += value;
  assignment.sharePremium = subtotal / 100;
  return sharePremRow;
}

function displayPLRes(assignment: Assignment) {
  const profit = assignment.profit;
  let subtotal = 0;
  let value = 0;
  assignment.activeCategoriesDetails.forEach((cat) => {
    if (cat.cerysCategory === "Profit & loss reserve") {
      value = cat.value;
    }
  });
  const pLReserveRow = ["Profit & loss reserve", "", "", "", "", ((profit - value) / 100).toString()];
  subtotal += value;
  assignment.profLossRes = subtotal / 100;
  return pLReserveRow;
}

function displayCRR(assignment: Assignment) {
  let subtotal = 0;
  let value = 0;
  assignment.activeCategoriesDetails.forEach((cat) => {
    if (cat.cerysCategory === "Capital redemption reserve") {
      value = cat.value;
    }
  });
  const crrRow = ["Capital redemption reserve", "", "", "", "", (-value / 100).toString()];
  subtotal += value;
  assignment.capRedRes = subtotal / 100;
  return crrRow;
}

function displayOtherRes(assignment: Assignment) {
  let subtotal = 0;
  let value = 0;
  assignment.activeCategoriesDetails.forEach((cat) => {
    if (cat.cerysCategory === "Other reserves 1") {
      value = cat.value;
    }
  });
  const otherResRow = ["Other reserves", "", "", "", "", (-value / 100).toString()];
  subtotal += value;
  assignment.otherRes = subtotal / 100;
  return otherResRow;
}

function displayFVRes(assignment: Assignment) {
  let subtotal = 0;
  let value = 0;
  assignment.activeCategoriesDetails.forEach((cat) => {
    if (cat.cerysCategory === "Fair value reserve") {
      value = cat.value;
    }
  });
  const fVRow = ["Fair value reserve", "", "", "", "", (-value / 100).toString()];
  subtotal += value;
  assignment.fVRes = subtotal / 100;
  return fVRow;
}

function displayOtherRes2(assignment: Assignment) {
  let subtotal = 0;
  let value = 0;
  assignment.activeCategoriesDetails.forEach((cat) => {
    if (cat.cerysCategory === "Other reserves 2") {
      value = cat.value;
    }
  });
  const otherRes2Row = ["Other reserves 2", "", "", "", "", (-value / 100).toString()];
  subtotal += value;
  assignment.otherRes2 = subtotal / 100;
  return otherRes2Row;
}

function displayOtherRes3(assignment: Assignment) {
  let subtotal = 0;
  let value = 0;
  assignment.activeCategoriesDetails.forEach((cat) => {
    if (cat.cerysCategory === "Other reserves 3") {
      value = cat.value;
    }
  });
  const otherRes3Row = ["Other reserves 3", "", "", "", "", (-value / 100).toString()];
  subtotal += value;
  assignment.otherRes3 = subtotal / 100;
  return otherRes3Row;
}

function displayOtherRes4(assignment: Assignment) {
  let subtotal = 0;
  let value = 0;
  assignment.activeCategoriesDetails.forEach((cat) => {
    if (cat.cerysCategory === "Other reserves 4") {
      value = cat.value;
    }
  });
  const otherRes4Row = ["Other reserves 4", "", "", "", "", (-value / 100).toString()];
  subtotal += value;
  assignment.otherRes4 = subtotal / 100;
  return otherRes4Row;
}

function displayOtherRes5(assignment: Assignment) {
  let subtotal = 0;
  let value = 0;
  assignment.activeCategoriesDetails.forEach((cat) => {
    if (cat.cerysCategory === "Other reserves 5") {
      value = cat.value;
    }
  });
  const otherRes5Row = ["Other reserves 5", "", "", "", "", (-value / 100).toString()];
  subtotal += value;
  assignment.otherRes5 = subtotal / 100;
  return otherRes5Row;
}

function displayMinorityInt(assignment: Assignment) {
  let subtotal = 0;
  let value = 0;
  assignment.activeCategoriesDetails.forEach((cat) => {
    if (cat.cerysCategory === "Minority interest") {
      value = cat.value;
    }
  });
  const minIntRow = ["Minority interest", "", "", "", "", (-value / 100).toString()];
  subtotal += value;
  assignment.minorityInt = subtotal / 100;
  return minIntRow;
}
