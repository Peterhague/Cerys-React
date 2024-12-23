import { postIP } from "../../fetching/apiEndpoints";
import { fetchOptionsIP } from "../../fetching/generateOptions";
import { applyWorkhseetHeader, worksheetHeader } from "../../workbook views/components/schedule-header";
import { getExcelContext } from "../helperFunctions";
import { addWorksheet, deleteManyWorksheets } from "../worksheet";
import { populateAssetRegWs } from "./asset-reg-population";

//export function createRelTransIP(session) {
//  const relevantTrans = [];
//  session.activeAssignment.transactions.forEach((tran) => {
//    if (
//      tran.cerysCategory === "Investment property" &&
//      (tran.assetCodeType === "iPCostAddns" || tran.assetCodeType === "iPCostBF")
//    ) {
//      relevantTrans.push(tran);
//    }
//  });
//  createIPTransSumm(session, relevantTrans);
//}

//export async function createIPTransSumm(session, relevantTrans) {
//  const context = await getExcelContext();
//  const ws = addWorksheet(context, "IP Transactions");
//  const bodyContent = [];
//  session["IPTransactions"] = [];
//  relevantTrans.forEach((i) => {
//    if (i.clientTB) {
//      const trans = {};
//      session.activeAssignment.clientNL.forEach((tran) => {
//        if (tran.code === i.clientNominalCode) {
//          trans["cerysCategory"] = i.cerysCategory;
//          trans["assetCategoryNo"] = i.assetCategoryNo;
//          trans["assetCategory"] = i.assetCategory;
//          trans["assetSubCategory"] = i.assetSubCategory;
//          trans["assetSubCatCode"] = i.assetSubCatCode;
//          trans["regColNameOne"] = i.regColNameOne;
//          trans["regColNameTwo"] = i.regColNameTwo;
//          trans["cerysName"] = i.cerysName;
//          trans["cerysCode"] = i.cerysCode;
//          trans["cerysShortName"] = i.cerysShortName;
//          trans["clientAdjustment"] = i.clientAdjustment;
//          trans["clientTB"] = i.clientTB;
//          trans["clientNominalCode"] = i.clientNominalCode;
//          trans["narrative"] = i.narrative;
//          trans["transactionType"] = i.transactionType;
//          trans["value"] = i.value;
//          trans["transactionDateClt"] = tran.date;
//          trans["clientNominalCode"] = tran.code;
//          trans["clientNominalName"] = tran.name;
//          trans["assetNarrative"] = tran.detail;
//          trans["value"] = tran.value;
//          trans["rowNumber"] = session["IPTransactions"].length + 3;
//        }
//      });
//      session["IPTransactions"].push(trans);
//    } else {
//      i.rowNumber = session["IPTransactions"].length + 3;
//      i.assetNarrative = i.narrative;
//      session["IPTransactions"].push(i);
//    }
//  });
//  session["IPTransactions"].forEach((tran) => {
//    const transVals = [];
//    if (tran.transactionDate) {
//      const dateString = tran.transactionDate.split("T")[0];
//      const dateStringSplit = dateString.split("-");
//      const dateConverted = `${dateStringSplit[2]}/${dateStringSplit[1]}/${dateStringSplit[0]}`;
//      transVals.push(dateConverted);
//      tran.transactionDateUser = dateConverted;
//    } else if (tran.transactionDateClt) {
//      transVals.push(tran.transactionDateClt);
//    } else {
//      transVals.push("Not provided");
//    }
//    transVals.push(tran.narrative);
//    if (tran.journal) {
//      transVals.push("Journal");
//    } else if (tran.finalJournal) {
//      transVals.push("Final journal");
//    } else if (tran.reviewJournal) {
//      transVals.push("Review journal");
//    } else if (tran.clientTB) {
//      transVals.push("Client TB");
//    } else if (tran.clientAdjustment) {
//      transVals.push("Client adjustment");
//    }
//    transVals.push(tran.cerysCode);
//    transVals.push(tran.cerysShortName);
//    if (tran.clientNominalCode >= 0) {
//      transVals.push(tran.clientNominalCode);
//    } else {
//      transVals.push("NA");
//    }
//    if (tran.clientNominalName) {
//      transVals.push(tran.clientNominalName);
//    } else {
//      transVals.push("NA");
//    }
//    if (tran.assetNarrative) {
//      transVals.push(tran.assetNarrative);
//    } else {
//      transVals.push("NA");
//    }
//    transVals.push(tran.value / 100);
//    // if (tran.cerysName[0] === "G") {
//    //     transVals.push(activeClient.amortBasisGwill);
//    //     transVals.push(activeClient.amortRateGwill);
//    // } else if (tran.cerysName[0] === "P") {
//    //     transVals.push(activeClient.amortBasisPatsLics);
//    //     transVals.push(activeClient.amortRatePatsLics);
//    // } else if (tran.cerysName[0] === "D") {
//    //     transVals.push(activeClient.amortBasisDevCosts);
//    //     transVals.push(activeClient.amortRateDevCosts);
//    // } else if (tran.cerysName[0] === "C") {
//    //     transVals.push(activeClient.amortBasisCompSware);
//    //     transVals.push(activeClient.amortRateCompSware);
//    // }
//    bodyContent.push(transVals);
//  });
//  let bodyRange;
//  const headerRange = ws.getRange("A1:I2");
//  headerRange.values = [
//    ["CERYS", "CERYS", "POSTING", "CERYS", "CERYS", "CLIENT", "CLIENT", "CLIENT", "DEBIT/"],
//    ["DATE", "NARRATIVE", "SOURCE", "CODE", "NOMINAL", "NC", "NOMINAL", "NARRATIVE", "(CREDIT)"],
//  ];
//  bodyRange = ws.getRange(`A3:I${bodyContent.length + 2}`);
//  headerRange.format.font.bold = true;
//  bodyRange.values = bodyContent;
//  const rangeA = ws.getRange("A:A");
//  rangeA.numberFormat = "dd/mm/yyyy";
//  const rangeI = ws.getRange("I:I");
//  rangeI.numberFormat = "#,##0.00;(#,##0.00);-";
//  const rangeAI = ws.getRange("A:I");
//  rangeAI.format.autofitColumns();
//  const rangeD = ws.getRange(`D3:D${bodyContent.length + 2}`);
//  rangeD.format.fill.color = "yellow";
//  // CHANGE CODE BELOW:
//  //ws.onChanged.add(async (e) => captureIPRSummChange(context, e, session["IPTransactions"], ws));
//  await context.sync();
//  //const submitBtn = buttonGenerator(
//  //  "submitIPRTrans",
//  //  ["noclass"],
//  //  "CREATE IP REGISTER",
//  //  createIPR,
//  //  context,
//  //  session,
//  //  transToPost
//  //);
//  //div.appendChild(submitBtn);
//}

//export async function captureIPRSummChange(context, e, transToPost, ws) {
//  const eRowNumber = parseInt(e.address.substr(1));
//  const callingCell = ws.getRange(`${e.address}:${e.address}`);
//  callingCell.format.fill.color = "lightGreen";
//  await context.sync();
//  if (e.address[0] === "D") {
//    transToPost = updateNomCode(e, transToPost, eRowNumber);
//  }
//}

export async function createIPR(context, session) {
  await postIPtoDB(session);
  createIPRWs(context, session);
}

export async function postIPtoDB(session) {
  const options = fetchOptionsIP(session);
  const updatedAssignmentDb = await fetch(postIP, options);
  const updatedAssignment = await updatedAssignmentDb.json();
  session.activeAssignment = updatedAssignment;
  console.log(updatedAssignment);
}

export function createIPRWs(context, session) {
  const transToPost = session["IPTransactions"];
  const activeCatsNames = [];
  const IPActiveCats = [];
  transToPost.forEach((i) => {
    if (!activeCatsNames.includes(i.assetCategory)) {
      activeCatsNames.push(i.assetCategory);
      IPActiveCats.push({
        assetCategory: i.assetCategory,
        assetCategoryNo: i.assetCategoryNo,
      });
    }
  });
  IPActiveCats.sort((a, b) => {
    return a.assetCategoryNo - b.assetCategoryNo;
  });
  const wsName = "IP Register";
  const ws = addWorksheet(context, wsName);
  const wsHeaders = worksheetHeader(session, "Investment property register");
  applyWorkhseetHeader(ws, wsHeaders);
  populateAssetRegWs(IPActiveCats, transToPost, ws, "IP");
  ws.activate();
  deleteManyWorksheets(context, ["IP Transactions"]);
}
