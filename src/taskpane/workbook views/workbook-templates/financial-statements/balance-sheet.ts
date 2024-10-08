import { addWorksheet, deleteWorksheet } from "../../../utils.ts/worksheet";
import { applyWorkhseetHeader, worksheetHeader } from "../../components/schedule-header";

export async function wsBalanceSheet(session) {
  try {
    await Excel.run(async (context) => {
      const check = context.workbook.worksheets.getItemOrNullObject("Balance Sheet");
      check.load("values");
      await context.sync();
      if (!check.isNullObject) deleteWorksheet(context, "Balance Sheet");
      const ws = addWorksheet(context, "Balance Sheet");
      const headerValues = worksheetHeader(session, "Balance Sheet");
      applyWorkhseetHeader(ws, headerValues);
      const values = [
        ["", "", "", "", "£", "£"],
        ["", "", "", "", "", ""],
      ];
      if (
        session.activeAssignment.activeCategories.includes("Intangible assets") ||
        session.activeAssignment.activeCategories.includes("Tangible assets") ||
        session.activeAssignment.activeCategories.includes("Fixed asset investments") ||
        session.activeAssignment.activeCategories.includes("Investment property")
      ) {
        const nextArrays = displayFixedAssets(session.activeAssignment);
        nextArrays.forEach((arr) => {
          values.push(arr);
        });
      }
      if (
        session.activeAssignment.activeCategories.includes("Stocks") ||
        session.activeAssignment.activeCategories.includes("Debtors") ||
        session.activeAssignment.activeCategories.includes("Financial assets") ||
        session.activeAssignment.activeCategories.includes("Cash")
      ) {
        const arrays = displayCurrentAssets(session.activeAssignment);
        arrays.forEach((arr) => {
          values.push(arr);
        });
      }
      if (session.activeAssignment.activeCategories.includes("Creditors < 1 year")) {
        const nextArrays = displayCurrentLiabilities(session.activeAssignment);
        nextArrays.forEach((arr) => {
          values.push(arr);
        });
      }
      values.push(["", "", "", "", "", ""]);
      const netCA = calculateNCA(session.activeAssignment);
      if (netCA) {
        if (netCA > 0) {
          values.push(["Net current assets", "", "", "", "", netCA]);
        } else {
          values.push(["Net current liabilities", "", "", "", "", netCA]);
        }
      }
      values.push(["", "", "", "", "", ""]);
      const tALCL = totalAssetsLessCL(session.activeAssignment);
      if (tALCL >= 0) {
        values.push(["Total assets less current liabilities", "", "", "", "", tALCL.toString()]);
      } else {
        values.push(["Current liabilities less total assets", "", "", "", "", tALCL.toString()]);
      }
      if (session.activeAssignment.activeCategories.includes("Creditors > 1 year")) {
        const nextArrays = displayNonCurrentLiabilities(session.activeAssignment);
        nextArrays.forEach((arr) => {
          values.push(arr);
        });
      }
      if (session.activeAssignment.activeCategories.includes("Provisions for liabilities")) {
        const nextArrays = displayProvisions(session.activeAssignment);
        nextArrays.forEach((arr) => {
          values.push(arr);
        });
      }
      values.push(["", "", "", "", "", ""]);
      const netAssets = calculateNetAssets(session.activeAssignment);
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
      if (session.activeAssignment.activeCategories.includes("Share capital")) {
        const arr = displayShareCapital(session.activeAssignment);
        values.push(arr);
      }
      if (session.activeAssignment.activeCategories.includes("Share premium")) {
        const arr = displaySharePremium(session.activeAssignment);
        values.push(arr);
      }
      if (session.activeAssignment.activeCategories.includes("Capital redemption reserve")) {
        const arr = displayCRR(session.activeAssignment);
        values.push(arr);
      }
      if (session.activeAssignment.activeCategories.includes("Other reserves 1")) {
        const arr = displayOtherRes(session.activeAssignment);
        values.push(arr);
      }
      if (session.activeAssignment.activeCategories.includes("Fair value reserve")) {
        const arr = displayFVRes(session.activeAssignment);
        values.push(arr);
      }
      if (session.activeAssignment.activeCategories.includes("Other reserves 2")) {
        const arr = displayOtherRes2(session.activeAssignment);
        values.push(arr);
      }
      if (session.activeAssignment.activeCategories.includes("Other reserves 3")) {
        const arr = displayOtherRes3(session.activeAssignment);
        values.push(arr);
      }
      if (session.activeAssignment.activeCategories.includes("Other reserves 4")) {
        const arr = displayOtherRes4(session.activeAssignment);
        values.push(arr);
      }
      if (session.activeAssignment.activeCategories.includes("Other reserves 5")) {
        const arr = displayOtherRes5(session.activeAssignment);
        values.push(arr);
      }
      if (session.activeAssignment.activeCategories.includes("Minority interest")) {
        const arr = displayMinorityInt(session.activeAssignment);
        values.push(arr);
      }
      if (
        session.activeAssignment.activeCategories.includes("Profit & loss reserve") ||
        session.activeAssignment.profit !== 0
      ) {
        const arr = displayPLRes(session.activeAssignment);
        values.push(arr);
      }
      values.push(["", "", "", "", "", ""]);
      let equity = 0;
      session.activeAssignment.activeCategoriesDetails.forEach((obj) => {
        if (obj.cerysCategory === "Capital & reserves") equity = obj.value / 100;
      });
      session.activeAssignment.activeCategoriesDetails.forEach((obj) => {
        if (obj.cerysCategory === "Profit & loss reserve") equity += obj.value / 100;
      });
      values.push(["Total equity", "", "", "", "", (-equity + session.activeAssignment.profit / 100).toString()]);
      const range = ws.getRange(`a9:f${values.length + 8}`);
      const numbersRange = ws.getRange(`e11:f${values.length + 8}`);
      numbersRange.numberFormat = "#,##0;(#,##0);-";
      const cleansedValues = cleanseValues(values);
      range.values = cleansedValues;
      const currencyRange = ws.getRange("E9:F9");
      currencyRange.format.horizontalAlignment = "Right";
      currencyRange.format.font.bold = true;
      wsBSAccountFormat(ws, values);
    });
  } catch (e) {
    console.error(e);
  }
}

export async function wsBSAccountFormat(ws, values) {
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

export function cleanseValues(values) {
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

function calculateNCA(activeAssignment) {
  if (activeAssignment.tCA && activeAssignment.tCL) {
    return activeAssignment.tCA + activeAssignment.tCL;
  } else if (activeAssignment.tCA && !activeAssignment.tCL) {
    return activeAssignment.tCA;
  } else if (activeAssignment.tCL && !activeAssignment.tCA) {
    return activeAssignment.tCL;
  } else {
    return;
  }
}

function totalAssetsLessCL(activeAssignment) {
  let fig = 0;
  if (activeAssignment.nonCA) fig += activeAssignment.nonCA;
  if (activeAssignment.tCA) fig += activeAssignment.tCA;
  if (activeAssignment.tCL) fig += activeAssignment.tCL;
  return fig;
}

function calculateNetAssets(activeAssignment) {
  let fig = 0;
  if (activeAssignment.nonCA) fig += activeAssignment.nonCA;
  if (activeAssignment.tCA) fig += activeAssignment.tCA;
  if (activeAssignment.tCL) fig += activeAssignment.tCL;
  if (activeAssignment.nonCL) fig += activeAssignment.nonCL;
  if (activeAssignment.provisions) fig += activeAssignment.provisions;
  return fig;
}

function displayFixedAssets(activeAssignment) {
  const arrays = [
    ["Fixed assets", "", "", "", "", ""],
    ["", "", "", "", "", ""],
  ];
  let subtotal = 0;
  if (activeAssignment.activeCategories.includes("Intangible assets")) {
    let value = 0;
    activeAssignment.activeCategoriesDetails.forEach((cat) => {
      if (cat.cerysCategory === "Intangible assets") {
        value = cat.value;
      }
    });
    const iARow = ["Intangible assets", "", "", "", "", (value / 100).toString()];
    arrays.push(iARow);
    subtotal += value;
  }
  if (activeAssignment.activeCategories.includes("Tangible assets")) {
    let value = 0;
    activeAssignment.activeCategoriesDetails.forEach((cat) => {
      if (cat.cerysCategory === "Tangible assets") {
        value = cat.value;
      }
    });
    const tARow = ["Tangible assets", "", "", "", "", (value / 100).toString()];
    arrays.push(tARow);
    subtotal += value;
  }
  if (activeAssignment.activeCategories.includes("Fixed asset investments")) {
    let value = 0;
    activeAssignment.activeCategoriesDetails.forEach((cat) => {
      if (cat.cerysCategory === "Fixed asset investments") {
        value = cat.value;
      }
    });
    const fAIRow = ["Fixed asset investments", "", "", "", "", (value / 100).toString()];
    arrays.push(fAIRow);
    subtotal += value;
  }
  if (activeAssignment.activeCategories.includes("Investment property")) {
    let value = 0;
    activeAssignment.activeCategoriesDetails.forEach((cat) => {
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
  activeAssignment.nonCA = subtotal / 100;
  return arrays;
}

function displayCurrentAssets(activeAssignment) {
  const arrays = [
    ["Current assets", "", "", "", "", ""],
    ["", "", "", "", "", ""],
  ];
  let subtotal = 0;
  if (activeAssignment.activeCategories.includes("Stocks")) {
    let value = 0;
    activeAssignment.activeCategoriesDetails.forEach((cat) => {
      if (cat.cerysCategory === "Stocks") {
        value = cat.value;
      }
    });
    const stocksRow = ["Stocks", "", "", "", (value / 100).toString(), ""];
    arrays.push(stocksRow);
    subtotal += value;
  }
  if (activeAssignment.activeCategories.includes("Debtors")) {
    let value = 0;
    activeAssignment.activeCategoriesDetails.forEach((cat) => {
      if (cat.cerysCategory === "Debtors") {
        value = cat.value;
      }
    });
    const debtorsRow = ["Debtors", "", "", "", (value / 100).toString(), ""];
    arrays.push(debtorsRow);
    subtotal += value;
  }
  if (activeAssignment.activeCategories.includes("Financial assets")) {
    let value = 0;
    activeAssignment.activeCategoriesDetails.forEach((cat) => {
      if (cat.cerysCategory === "Financial assets") {
        value = cat.value;
      }
    });
    const finAssetsRow = ["Financial assets", "", "", "", (value / 100).toString(), ""];
    arrays.push(finAssetsRow);
    subtotal += value;
  }
  if (activeAssignment.activeCategories.includes("Cash")) {
    let value = 0;
    activeAssignment.activeCategoriesDetails.forEach((cat) => {
      if (cat.cerysCategory === "Cash") {
        value = cat.value;
      }
    });
    const cashRow = ["Cash at bank and in hand", "", "", "", (value / 100).toString(), ""];
    arrays.push(cashRow);
    subtotal += value;
  }
  arrays.push(["subtotalBottom", "", "", "", "", (subtotal / 100).toString()]);
  activeAssignment.tCA = subtotal / 100;
  return arrays;
}

function displayCurrentLiabilities(activeAssignment) {
  const arrays = [
    ["Current liabilities", "", "", "", "", ""],
    ["", "", "", "", "", ""],
  ];
  let subtotal = 0;
  let value = 0;
  activeAssignment.activeCategoriesDetails.forEach((cat) => {
    if (cat.cerysCategory === "Creditors < 1 year") {
      value = cat.value;
    }
  });
  const curCredRow = ["Creditors due in < 1 year", "", "", "", (value / 100).toString(), ""];
  arrays.push(curCredRow);
  subtotal += value;
  arrays.push(["subtotalBottom", "", "", "", "", (subtotal / 100).toString()]);
  activeAssignment.tCL = subtotal / 100;
  return arrays;
}

function displayNonCurrentLiabilities(activeAssignment) {
  const arrays = [["", "", "", "", "", ""]];
  let subtotal = 0;
  let value = 0;
  activeAssignment.activeCategoriesDetails.forEach((cat) => {
    if (cat.cerysCategory === "Creditors > 1 year") {
      value = cat.value;
    }
  });
  const nonCurCredRow = ["Creditors due in > 1 year", "", "", "", "", (value / 100).toString()];
  arrays.push(nonCurCredRow);
  subtotal += value;
  activeAssignment.nonCL = subtotal / 100;
  return arrays;
}

function displayProvisions(activeAssignment) {
  const arrays = [["", "", "", "", "", ""]];
  let subtotal = 0;
  let value = 0;
  activeAssignment.activeCategoriesDetails.forEach((cat) => {
    if (cat.cerysCategory === "Provisions for liabilities") {
      value = cat.value;
    }
  });
  const provisionsRow = ["Provisions for liabilities", "", "", "", "", (value / 100).toString()];
  arrays.push(provisionsRow);
  subtotal += value;
  activeAssignment.provisions = subtotal / 100;
  return arrays;
}

function displayShareCapital(activeAssignment) {
  let subtotal = 0;
  let value = 0;
  activeAssignment.activeCategoriesDetails.forEach((cat) => {
    if (cat.cerysCategory === "Share capital") {
      value = cat.value;
    }
  });
  const shareCapRow = ["Share capital", "", "", "", "", (-value / 100).toString()];
  subtotal += value;
  activeAssignment.shareCapital = subtotal / 100;
  return shareCapRow;
}

function displaySharePremium(activeAssignment) {
  let subtotal = 0;
  let value = 0;
  activeAssignment.activeCategoriesDetails.forEach((cat) => {
    if (cat.cerysCategory === "Share premium") {
      value = cat.value;
    }
  });
  const sharePremRow = ["Share premium", "", "", "", "", (-value / 100).toString()];
  subtotal += value;
  activeAssignment.sharePremium = subtotal / 100;
  return sharePremRow;
}

function displayPLRes(activeAssignment) {
  const profit = activeAssignment.profit;
  let subtotal = 0;
  let value = 0;
  activeAssignment.activeCategoriesDetails.forEach((cat) => {
    if (cat.cerysCategory === "Profit & loss reserve") {
      value = cat.value;
    }
  });
  const pLReserveRow = ["Profit & loss reserve", "", "", "", "", ((profit - value) / 100).toString()];
  subtotal += value;
  activeAssignment.profLossRes = subtotal / 100;
  return pLReserveRow;
}

function displayCRR(activeAssignment) {
  let subtotal = 0;
  let value = 0;
  activeAssignment.activeCategoriesDetails.forEach((cat) => {
    if (cat.cerysCategory === "Capital redemption reserve") {
      value = cat.value;
    }
  });
  const crrRow = ["Capital redemption reserve", "", "", "", "", (-value / 100).toString()];
  subtotal += value;
  activeAssignment.capRedRes = subtotal / 100;
  return crrRow;
}

function displayOtherRes(activeAssignment) {
  let subtotal = 0;
  let value = 0;
  activeAssignment.activeCategoriesDetails.forEach((cat) => {
    if (cat.cerysCategory === "Other reserves 1") {
      value = cat.value;
    }
  });
  const otherResRow = ["Other reserves", "", "", "", "", (-value / 100).toString()];
  subtotal += value;
  activeAssignment.otherRes = subtotal / 100;
  return otherResRow;
}

function displayFVRes(activeAssignment) {
  let subtotal = 0;
  let value = 0;
  activeAssignment.activeCategoriesDetails.forEach((cat) => {
    if (cat.cerysCategory === "Fair value reserve") {
      value = cat.value;
    }
  });
  const fVRow = ["Fair value reserve", "", "", "", "", (-value / 100).toString()];
  subtotal += value;
  activeAssignment.fVRes = subtotal / 100;
  return fVRow;
}

function displayOtherRes2(activeAssignment) {
  let subtotal = 0;
  let value = 0;
  activeAssignment.activeCategoriesDetails.forEach((cat) => {
    if (cat.cerysCategory === "Other reserves 2") {
      value = cat.value;
    }
  });
  const otherRes2Row = ["Other reserves 2", "", "", "", "", (-value / 100).toString()];
  subtotal += value;
  activeAssignment.otherRes2 = subtotal / 100;
  return otherRes2Row;
}

function displayOtherRes3(activeAssignment) {
  let subtotal = 0;
  let value = 0;
  activeAssignment.activeCategoriesDetails.forEach((cat) => {
    if (cat.cerysCategory === "Other reserves 3") {
      value = cat.value;
    }
  });
  const otherRes3Row = ["Other reserves 3", "", "", "", "", (-value / 100).toString()];
  subtotal += value;
  activeAssignment.otherRes3 = subtotal / 100;
  return otherRes3Row;
}

function displayOtherRes4(activeAssignment) {
  let subtotal = 0;
  let value = 0;
  activeAssignment.activeCategoriesDetails.forEach((cat) => {
    if (cat.cerysCategory === "Other reserves 4") {
      value = cat.value;
    }
  });
  const otherRes4Row = ["Other reserves 4", "", "", "", "", (-value / 100).toString()];
  subtotal += value;
  activeAssignment.otherRes4 = subtotal / 100;
  return otherRes4Row;
}

function displayOtherRes5(activeAssignment) {
  let subtotal = 0;
  let value = 0;
  activeAssignment.activeCategoriesDetails.forEach((cat) => {
    if (cat.cerysCategory === "Other reserves 5") {
      value = cat.value;
    }
  });
  const otherRes5Row = ["Other reserves 5", "", "", "", "", (-value / 100).toString()];
  subtotal += value;
  activeAssignment.otherRes5 = subtotal / 100;
  return otherRes5Row;
}

function displayMinorityInt(activeAssignment) {
  let subtotal = 0;
  let value = 0;
  activeAssignment.activeCategoriesDetails.forEach((cat) => {
    if (cat.cerysCategory === "Minority interest") {
      value = cat.value;
    }
  });
  const minIntRow = ["Minority interest", "", "", "", "", (-value / 100).toString()];
  subtotal += value;
  activeAssignment.minorityInt = subtotal / 100;
  return minIntRow;
}
