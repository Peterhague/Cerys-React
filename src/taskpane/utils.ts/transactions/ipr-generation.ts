import { postTFA } from "../../fetching/apiEndpoints";
import { fetchOptionsIP } from "../../fetching/generateOptions";
import { applyWorkhseetHeader, worksheetHeader } from "../../workbook views/components/schedule-header";
import { updateNomCode } from "../helperFunctions";
import { addWorksheet } from "../worksheet";

export function createRelTransIP(session) {
  const relevantTrans = [];
  session.activeAssignment.transactions.forEach((tran) => {
    if (tran.cerysCategory === "Investment property") {
      relevantTrans.push(tran);
    }
  });
  createIPTransSumm(session, relevantTrans);
}

export async function createIPTransSumm(session, relevantTrans) {
  try {
    await Excel.run(async (context) => {
      const ws = addWorksheet(context, "IP Transactions");
      //let activeClient;
      // this should run when session.activeAssignment is defined
      //session.customer.clients.forEach((client) => {
      //  if (client._id === session.activeAssignment.clientId) {
      //    activeClient = client;
      //  }
      //});
      const bodyContent = [];
      session["IPTransactions"] = [];
      relevantTrans.forEach((i) => {
        if (i.clientTB) {
          const trans = {};
          session.activeAssignment.clientNL.forEach((tran) => {
            if (tran.code === i.clientNominalCode) {
              trans["cerysCategory"] = i.cerysCategory;
              //trans.assetCategory = i.assetCategory;
              //trans.assetCategoryNo = i.assetCategoryNo;
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
              trans["rowNumber"] = session["IPTransactions"].length + 3;
            }
          });
          session["IPTransactions"].push(trans);
        } else {
          i.rowNumber = session["IPTransactions"].length + 3;
          i.assetNarrative = i.narrative;
          session["IPTransactions"].push(i);
        }
      });
      session["IPTransactions"].forEach((tran) => {
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
        // if (tran.cerysName[0] === "G") {
        //     transVals.push(activeClient.amortBasisGwill);
        //     transVals.push(activeClient.amortRateGwill);
        // } else if (tran.cerysName[0] === "P") {
        //     transVals.push(activeClient.amortBasisPatsLics);
        //     transVals.push(activeClient.amortRatePatsLics);
        // } else if (tran.cerysName[0] === "D") {
        //     transVals.push(activeClient.amortBasisDevCosts);
        //     transVals.push(activeClient.amortRateDevCosts);
        // } else if (tran.cerysName[0] === "C") {
        //     transVals.push(activeClient.amortBasisCompSware);
        //     transVals.push(activeClient.amortRateCompSware);
        // }
        bodyContent.push(transVals);
      });
      let bodyRange;
      const headerRange = ws.getRange("A1:I2");
      headerRange.values = [
        ["CERYS", "CERYS", "POSTING", "CERYS", "CERYS", "CLIENT", "CLIENT", "CLIENT", "DEBIT/"],
        ["DATE", "NARRATIVE", "SOURCE", "CODE", "NOMINAL", "NC", "NOMINAL", "NARRATIVE", "(CREDIT)"],
      ];
      bodyRange = ws.getRange(`A3:I${bodyContent.length + 2}`);
      headerRange.format.font.bold = true;
      bodyRange.values = bodyContent;
      const rangeA = ws.getRange("A:A");
      rangeA.numberFormat = "dd/mm/yyyy";
      const rangeI = ws.getRange("I:I");
      rangeI.numberFormat = "#,##0.00;(#,##0.00);-";
      const rangeAI = ws.getRange("A:I");
      rangeAI.format.autofitColumns();
      const rangeD = ws.getRange(`D3:D${bodyContent.length + 2}`);
      rangeD.format.fill.color = "yellow";
      // CHANGE CODE BELOW:
      ws.onChanged.add(async (e) => captureIPRSummChange(context, e, session["IPTransactions"], ws));
      await context.sync();
      //const submitBtn = buttonGenerator(
      //  "submitIPRTrans",
      //  ["noclass"],
      //  "CREATE IP REGISTER",
      //  createIPR,
      //  context,
      //  session,
      //  transToPost
      //);
      //div.appendChild(submitBtn);
    });
  } catch (e) {
    console.error(e);
  }
}

export async function captureIPRSummChange(context, e, transToPost, ws) {
  const eRowNumber = parseInt(e.address.substr(1));
  const callingCell = ws.getRange(`${e.address}:${e.address}`);
  callingCell.format.fill.color = "lightGreen";
  await context.sync();
  if (e.address[0] === "D") {
    transToPost = updateNomCode(e, transToPost, eRowNumber);
  }
}

//export function updateDepnBasis(e, transToPost, eRowNumber) {
//  const updatedTransToPost = [];
//  transToPost.forEach((i) => {
//    if (i.rowNumber === eRowNumber) {
//      i.depnBasis = e.details.valueAfter;
//      updatedTransToPost.push(i);
//    } else {
//      updatedTransToPost.push(i);
//    }
//  });
//  return updatedTransToPost;
//}

//export function updateDepnRate(e, transToPost, eRowNumber) {
//  const updatedTransToPost = [];
//  transToPost.forEach((i) => {
//    if (i.rowNumber === eRowNumber) {
//      i.depnRate = e.details.valueAfter;
//      updatedTransToPost.push(i);
//    } else {
//      updatedTransToPost.push(i);
//    }
//  });
//  return updatedTransToPost;
//}

export async function createIPR(session) {
  try {
    await Excel.run(async (context) => {
      await postIPtoDB(session);
      createIPRWs(context, session);
    });
  } catch (e) {
    console.error(e);
  }
}

export async function postIPtoDB(session) {
  const options = fetchOptionsIP(session);
  const updatedCustAndAssDb = await fetch(postTFA, options);
  const updatedCustAndAss = await updatedCustAndAssDb.json();
  console.log(updatedCustAndAss);
  session["customer"] = updatedCustAndAss.customer;
  session["activeAssignment"] = updatedCustAndAss.assignment;
}

export async function createIPRWs(context, session) {
  const transToPost = session["IPTransactions"];
  const wsName = "IP Register";
  const ws = addWorksheet(context, wsName);
  const wsHeaders = worksheetHeader(session, "Investment property register");
  applyWorkhseetHeader(ws, wsHeaders);
  await context.sync();
  populateIPRWs(context, transToPost, ws);
}

export async function populateIPRWs(context, transToPost, ws) {
  const iPRBodyVals = [];
  const underlineA = [];
  const underlineAO = [];
  const formatTotal = [];
  let rowNumber = 10;
  let additionsTotal = 0;
  const blankLine = [];
  for (let i = 0; i < 15; i++) {
    blankLine.push("");
  }
  const registerColNamesOne = [
    "Date",
    "Description",
    "Days of",
    "Cost",
    "Cost of",
    "Cost of",
    "Cost",
    "",
    "FV Adjustment",
    "FV Adjustment",
    "FV Adjustment",
    "FV Adjustment",
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
    "in Year",
    "Elim on Disposal",
    "C/Fwd",
    "",
    "C/Fwd",
    "B/Fwd",
  ];
  iPRBodyVals.push(registerColNamesOne);
  underlineAO.push(rowNumber);
  rowNumber++;
  iPRBodyVals.push(registerColNamesTwo);
  underlineAO.push(rowNumber);
  rowNumber++;
  iPRBodyVals.push(blankLine);
  rowNumber++;
  transToPost.forEach((tran) => {
    const assetLine = [];
    if (tran.transactionDateClt) {
      assetLine.push(tran.transactionDateClt);
    } else if (tran.transactionDateUser) {
      assetLine.push(tran.transactionDateUser);
    }
    assetLine.push(tran.assetNarrative);
    assetLine.push(`=IF(B3-A${rowNumber} > 365, 365, B3-A${rowNumber})`);
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
    iPRBodyVals.push(assetLine);
    rowNumber++;
    additionsTotal += tran.value / 100;
  });
  iPRBodyVals.push(blankLine);
  rowNumber++;
  const totalsLine = ["", "", "", 0, additionsTotal, 0, additionsTotal, "", 0, 0, 0, 0, "", additionsTotal, 0];
  iPRBodyVals.push(totalsLine);
  formatTotal.push(rowNumber);
  rowNumber++;
  const iFARBodyRange = ws.getRange(`A10:O${iPRBodyVals.length + 9}`);
  iFARBodyRange.values = iPRBodyVals;
  const rangeA = ws.getRange("A:A");
  rangeA.numberFormat = "dd/mm/yyyy";
  const rangeC = ws.getRange("C:C");
  rangeC.numberFormat = "0";
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
