import { postIFA } from "../../fetching/apiEndpoints";
import { fetchOptionsIFA } from "../../fetching/generateOptions";
import { applyWorkhseetHeader, worksheetHeader } from "../../workbook views/components/schedule-header";
import { updateNomCode } from "../helperFunctions";
import { addWorksheet } from "../worksheet";

export function createRelTransIFA(session) {
  const relevantTrans = [];
  session.activeAssignment.transactions.forEach((tran) => {
    if (tran.cerysCategory === "Intangible assets") {
      relevantTrans.push(tran);
    }
  });
  createIFATransSumm(session, relevantTrans);
}

export async function createIFATransSumm(session, relevantTrans) {
  try {
    await Excel.run(async (context) => {
      const ws = addWorksheet(context, "IFA Transactions");
      let activeClient;
      session.customer.clients.forEach((client) => {
        if (client._id === session.activeAssignment.clientId) {
          activeClient = client;
        }
      });
      const bodyContent = [];
      session["IFATransactions"] = [];
      relevantTrans.forEach((i) => {
        if (i.clientTB) {
          const trans = {};
          session.activeAssignment.clientNL.forEach((tran) => {
            if (tran.code === i.clientNominalCode) {
              trans["cerysCategory"] = i.cerysCategory;
              trans["assetCategory"] = i.assetCategory;
              trans["assetCategoryNo"] = i.assetCategoryNo;
              trans["cerysName"] = i.cerysName;
              trans["cerysCode"] = i.cerysCode;
              trans["cerysShortName"] = i.cerysShortName;
              trans["clientAdjustment"] = i.clientAdjustment;
              trans["clientTB"] = i.clientTB;
              trans["clientNominalCode"] = i.clientNominalCode;
              trans["narrative"] = i.narrative;
              trans["transactionType"] = i.transactionType;
              trans["value"] = i.value;
              trans["transactionDateClt"] = tran.date;
              trans["clientNominalCode"] = tran.code;
              trans["clientNominalName"] = tran.name;
              trans["assetNarrative"] = tran.detail;
              trans["value"] = tran.value;
              trans["rowNumber"] = session["IFATransactions"].length + 3;
            }
          });
          session["IFATransactions"].push(trans);
        } else {
          i.rowNumber = session["IFATransactions"].length + 3;
          i.assetNarrative = i.narrative;
          session["IFATransactions"].push(i);
        }
      });
      session["IFATransactions"].forEach((tran) => {
        const transVals = [];
        if (tran.transactionDate) {
          const dateString = tran.transactionDate.split("T")[0];
          const dateStringSplit = dateString.split("-");
          const dateConverted = `${dateStringSplit[2]}/${dateStringSplit[1]}/${dateStringSplit[0]}`;
          transVals.push(dateConverted);
          tran.transactionDateUser = dateConverted;
        } else if (tran.transactionDateClt) {
          transVals.push(tran.transactionDateClt);
        } else {
          transVals.push("Not provided");
        }
        transVals.push(tran.narrative);
        if (tran.journal) {
          transVals.push("Journal");
        } else if (tran.finalJournal) {
          transVals.push("Final journal");
        } else if (tran.reviewJournal) {
          transVals.push("Review journal");
        } else if (tran.clientTB) {
          transVals.push("Client TB");
        } else if (tran.clientAdjustment) {
          transVals.push("Client adjustment");
        }
        transVals.push(tran.cerysCode);
        transVals.push(tran.cerysShortName);
        if (tran.clientNominalCode >= 0) {
          transVals.push(tran.clientNominalCode);
        } else {
          transVals.push("NA");
        }
        if (tran.clientNominalName) {
          transVals.push(tran.clientNominalName);
        } else {
          transVals.push("NA");
        }
        if (tran.assetNarrative) {
          transVals.push(tran.assetNarrative);
        } else {
          transVals.push("NA");
        }
        transVals.push(tran.value / 100);
        if (tran.cerysName[0] === "G") {
          transVals.push(activeClient.amortBasisGwill);
          transVals.push(activeClient.amortRateGwill);
        } else if (tran.cerysName[0] === "P") {
          transVals.push(activeClient.amortBasisPatsLics);
          transVals.push(activeClient.amortRatePatsLics);
        } else if (tran.cerysName[0] === "D") {
          transVals.push(activeClient.amortBasisDevCosts);
          transVals.push(activeClient.amortRateDevCosts);
        } else if (tran.cerysName[0] === "C") {
          transVals.push(activeClient.amortBasisCompSware);
          transVals.push(activeClient.amortRateCompSware);
        }
        bodyContent.push(transVals);
      });
      let bodyRange;
      const headerRange = ws.getRange("A1:K2");
      headerRange.values = [
        ["CERYS", "CERYS", "POSTING", "CERYS", "CERYS", "CLIENT", "CLIENT", "CLIENT", "DEBIT/", "AMORT", "AMORT"],
        ["DATE", "NARRATIVE", "SOURCE", "CODE", "NOMINAL", "NC", "NOMINAL", "NARRATIVE", "(CREDIT)", "BASIS", "RATE"],
      ];
      bodyRange = ws.getRange(`A3:K${bodyContent.length + 2}`);
      headerRange.format.font.bold = true;
      bodyRange.values = bodyContent;
      const rangeA = ws.getRange("A:A");
      rangeA.numberFormat = "dd/mm/yyyy";
      const rangeI = ws.getRange("I:I");
      rangeI.numberFormat = "#,##0.00;(#,##0.00);-";
      const rangeAK = ws.getRange("A:K");
      rangeAK.format.autofitColumns();
      const rangeD = ws.getRange(`D3:D${bodyContent.length + 2}`);
      const rangeJK = ws.getRange(`J3:K${bodyContent.length + 2}`);
      rangeD.format.fill.color = "yellow";
      rangeJK.format.fill.color = "yellow";
      ws.onChanged.add(async (e) => captureIFARSummChange(context, e, session["IFATransactions"], ws));
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
}

export async function captureIFARSummChange(context, e, transToPost, ws) {
  const eRowNumber = parseInt(e.address.substr(1));
  const callingCell = ws.getRange(`${e.address}:${e.address}`);
  callingCell.format.fill.color = "lightGreen";
  await context.sync();
  if (e.address[0] === "D") {
    transToPost = updateNomCode(e, transToPost, eRowNumber);
  } else if (e.address[0] === "J") {
    transToPost = updateAmortBasis(e, transToPost, eRowNumber);
  } else if (e.address[0] === "K") {
    transToPost = updateAmortRate(e, transToPost, eRowNumber);
  }
}

export function updateAmortBasis(e, transToPost, eRowNumber) {
  const updatedTransToPost = [];
  transToPost.forEach((i) => {
    if (i.rowNumber === eRowNumber) {
      i.amortBasis = e.details.valueAfter;
      updatedTransToPost.push(i);
    } else {
      updatedTransToPost.push(i);
    }
  });
  return updatedTransToPost;
}

export function updateAmortRate(e, transToPost, eRowNumber) {
  const updatedTransToPost = [];
  transToPost.forEach((i) => {
    if (i.rowNumber === eRowNumber) {
      i.amortRate = e.details.valueAfter;
      updatedTransToPost.push(i);
    } else {
      updatedTransToPost.push(i);
    }
  });
  return updatedTransToPost;
}

export async function createIFAR(session) {
  try {
    await Excel.run(async (context) => {
      await postIFAtoDB(session);
      createIFARWs(context, session);
    });
  } catch (e) {
    console.error(e);
  }
}

export async function postIFAtoDB(session) {
  const options = fetchOptionsIFA(session);
  const updatedCustAndAssDb = await fetch(postIFA, options);
  const updatedCustAndAss = await updatedCustAndAssDb.json();
  session["customer"] = updatedCustAndAss.customer;
  session["activeAssignment"] = updatedCustAndAss.assignment;
}

export async function createIFARWs(context, session) {
  const transToPost = session["IFATransactions"];
  const IFAActiveCats = [];
  transToPost.forEach((i) => {
    if (!IFAActiveCats.includes(i.assetCategory)) {
      IFAActiveCats.push(i);
    }
  });
  IFAActiveCats.sort((a, b) => {
    return a.assetCategoryNo - b.assetCategoryNo;
  });
  const wsName = "IFA Register";
  const ws = addWorksheet(context, wsName);
  const wsHeaders = worksheetHeader(session, "Intangible fixed assets register");
  applyWorkhseetHeader(ws, wsHeaders);
  await context.sync();
  populateIFARWs(context, IFAActiveCats, transToPost, ws);
}

export async function populateIFARWs(context, IFAActiveCats, transToPost, ws) {
  const iFARBodyVals = [];
  const underlineA = [];
  const underlineAO = [];
  const formatTotal = [];
  let rowNumber = 10;
  IFAActiveCats.forEach((cat) => {
    let additionsTotal = 0;
    const catHeader = [];
    catHeader.push(cat.assetCategory);
    for (let i = 0; i < 14; i++) {
      catHeader.push("");
    }
    iFARBodyVals.push(catHeader);
    underlineA.push(rowNumber);
    rowNumber++;
    const blankLine = [];
    for (let i = 0; i < 15; i++) {
      blankLine.push("");
    }
    iFARBodyVals.push(blankLine);
    rowNumber++;
    const registerColNamesOne = [
      "Date",
      "Description",
      "Days of",
      "Cost",
      "Cost of",
      "Cost of",
      "Cost",
      "",
      "Amort",
      "Amort",
      "Amort Elim",
      "Amort",
      "",
      "NBV",
      "NBV",
    ];
    const registerColNamesTwo = [
      "",
      "",
      "Year Held",
      "B/Fwd",
      "Additions",
      "Disposals",
      "C/Fwd",
      "",
      "B/Fwd",
      "Charge",
      "on Disposal",
      "C/Fwd",
      "",
      "C/Fwd",
      "B/Fwd",
    ];
    iFARBodyVals.push(registerColNamesOne);
    underlineAO.push(rowNumber);
    rowNumber++;
    iFARBodyVals.push(registerColNamesTwo);
    underlineAO.push(rowNumber);
    rowNumber++;
    iFARBodyVals.push(blankLine);
    rowNumber++;
    transToPost.forEach((tran) => {
      if (tran.assetCategory === cat.assetCategory) {
        const assetLine = [];
        if (tran.transactionDateClt) {
          assetLine.push(tran.transactionDateClt);
        } else if (tran.transactionDateUser) {
          assetLine.push(tran.transactionDateUser);
        }
        assetLine.push(tran.assetNarrative);
        assetLine.push(`=(B3-A${rowNumber})`);
        assetLine.push(0);
        assetLine.push(tran.value / 100);
        assetLine.push("placeholder");
        assetLine.push(tran.value / 100);
        assetLine.push("");
        assetLine.push(0);
        assetLine.push(0);
        assetLine.push(0);
        assetLine.push(0);
        assetLine.push("");
        assetLine.push(0);
        assetLine.push(0);
        iFARBodyVals.push(assetLine);
        rowNumber++;
        additionsTotal += tran.value / 100;
      }
    });
    iFARBodyVals.push(blankLine);
    rowNumber++;
    const catTotalsLine = ["", "", "", 0, additionsTotal, 0, additionsTotal, "", 0, 0, 0, 0, "", additionsTotal, 0];
    iFARBodyVals.push(catTotalsLine);
    formatTotal.push(rowNumber);
    rowNumber++;
    iFARBodyVals.push(blankLine);
    rowNumber++;
  });
  const iFARBodyRange = ws.getRange(`A10:O${iFARBodyVals.length + 9}`);
  iFARBodyRange.values = iFARBodyVals;
  const rangeA = ws.getRange("A:A");
  rangeA.numberFormat = "dd/mm/yyyy";
  const numbersRange = ws.getRange("D:O");
  numbersRange.numberFormat = "#,##0.00;(#,##0.00);-";
  underlineA.forEach((row) => {
    const range = ws.getRange(`A${row}:A${row}`);
    range.format.font.underline = "single";
  });
  underlineAO.forEach((row) => {
    const range = ws.getRange(`A${row}:O${row}`);
    range.format.font.underline = "single";
  });
  formatTotal.forEach((row) => {
    const range = ws.getRange(`A${row}:O${row}`);
    range.format.font.bold = true;
    const totalRanges = [];
    const totalRangeOne = ws.getRange(`C${row}:G${row}`);
    totalRanges.push(totalRangeOne);
    const totalRangeTwo = ws.getRange(`I${row}:L${row}`);
    totalRanges.push(totalRangeTwo);
    const totalRangeThree = ws.getRange(`N${row}:O${row}`);
    totalRanges.push(totalRangeThree);
    totalRanges.forEach((range) => {
      const edgeTop = range.format.borders.getItem("EdgeTop");
      edgeTop.style = "Continuous";
      const edgeBottom = range.format.borders.getItem("EdgeBottom");
      edgeBottom.style = "Double";
    });
  });
  const colsRange = ws.getRange("B:O");
  colsRange.format.autofitColumns();
  await context.sync();
}
