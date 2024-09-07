import { postTFA } from "../../fetching/apiEndpoints";
import { fetchOptionsTFA } from "../../fetching/generateOptions";
import { applyWorkhseetHeader, worksheetHeader } from "../../workbook views/components/schedule-header";
import { updateNomCode } from "../helperFunctions";
import { addWorksheet } from "../worksheet";

export function createRelTransTFA(session) {
  const relevantTrans = [];
  session.activeAssignment.transactions.forEach((tran) => {
    if (tran.cerysCategory === "Tangible assets") {
      relevantTrans.push(tran);
    }
  });
  createTFATransSumm(session, relevantTrans);
}

export async function createTFATransSumm(session, relevantTrans) {
  try {
    await Excel.run(async (context) => {
      const ws = addWorksheet(context, "TFA Transactions");
      let activeClient;
      // this should run when session.activeAssignment is defined
      session.customer.clients.forEach((client) => {
        if (client._id === session.activeAssignment.clientId) {
          activeClient = client;
        }
      });
      const bodyContent = [];
      session["TFATransactions"] = [];
      console.log(relevantTrans);
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
              trans["rowNumber"] = session["TFATransactions"].length + 3;
            }
          });
          session["TFATransactions"].push(trans);
        } else {
          i.rowNumber = session["TFATransactions"].length + 3;
          i.assetNarrative = i.narrative;
          //i.userDate = //convert i.transactionDate here
          session["TFATransactions"].push(i);
        }
      });
      console.log(activeClient);
      session["TFATransactions"].forEach((tran) => {
        console.log(tran);
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
        if (tran.cerysName[0] === "F" && tran.cerysName[1] === "r") {
          tran.depnBasis = activeClient.depnBasisFholdProp;
          tran.depnRate = activeClient.depnRateFholdProp;
          transVals.push(activeClient.depnBasisFholdProp);
          transVals.push(activeClient.depnRateFholdProp);
        } else if (tran.cerysName[0] === "S") {
          tran.depnBasis = activeClient.depnBasisShortLhold;
          tran.depnRate = activeClient.depnRateShortLhold;
          transVals.push(activeClient.depnBasisShortLhold);
          transVals.push(activeClient.depnRateShortLhold);
        } else if (tran.cerysName[0] === "L") {
          tran.depnBasis = activeClient.depnBasisLongLhold;
          tran.depnRate = activeClient.depnRateLongLhold;
          transVals.push(activeClient.depnBasisLongLhold);
          transVals.push(activeClient.depnRateLongLhold);
        } else if (tran.cerysName[0] === "P") {
          tran.depnBasis = activeClient.depnBasisPlantMachinery;
          tran.depnRate = activeClient.depnRatePlantMachinery;
          transVals.push(activeClient.depnBasisPlantMachinery);
          transVals.push(activeClient.depnRatePlantMachinery);
        } else if (tran.cerysName[0] === "F" && tran.cerysName[1] === "i") {
          tran.depnBasis = activeClient.depnBasisFixFittings;
          tran.depnRate = activeClient.depnRateFixFittings;
          transVals.push(activeClient.depnBasisFixFittings);
          transVals.push(activeClient.depnRateFixFittings);
        } else if (tran.cerysName[0] === "M") {
          tran.depnBasis = activeClient.depnBasisMotorVehicles;
          tran.depnRate = activeClient.depnRateMotorVehicles;
          transVals.push(activeClient.depnBasisMotorVehicles);
          transVals.push(activeClient.depnRateMotorVehicles);
        } else if (tran.cerysName[0] === "C") {
          tran.depnBasis = activeClient.depnBasisCompEquip;
          tran.depnRate = activeClient.depnRateCompEquip;
          transVals.push(activeClient.depnBasisCompEquip);
          transVals.push(activeClient.depnRateCompEquip);
        } else if (tran.cerysName[0] === "O") {
          tran.depnBasis = activeClient.depnBasisOfficeEquip;
          tran.depnRate = activeClient.depnRateOfficeEquip;
          transVals.push(activeClient.depnBasisOfficeEquip);
          transVals.push(activeClient.depnRateOfficeEquip);
        }
        bodyContent.push(transVals);
      });
      let bodyRange;
      const headerRange = ws.getRange("A1:K2");
      headerRange.values = [
        ["CERYS", "CERYS", "POSTING", "CERYS", "CERYS", "CLIENT", "CLIENT", "CLIENT", "DEBIT/", "DEPN", "DEPN"],
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
      ws.onChanged.add(async (e) => captureTFARSummChange(context, e, session["TFATransactions"], ws));
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
}

export async function captureTFARSummChange(context, e, transToPost, ws) {
  const eRowNumber = parseInt(e.address.substr(1));
  //let updatedTransToPost;
  const callingCell = ws.getRange(`${e.address}:${e.address}`);
  callingCell.format.fill.color = "lightGreen";
  await context.sync();
  if (e.address[0] === "D") {
    transToPost = updateNomCode(e, transToPost, eRowNumber);
  } else if (e.address[0] === "J") {
    transToPost = updateDepnBasis(e, transToPost, eRowNumber);
  } else if (e.address[0] === "K") {
    transToPost = updateDepnRate(e, transToPost, eRowNumber);
  }
}

export function updateDepnBasis(e, transToPost, eRowNumber) {
  const updatedTransToPost = [];
  transToPost.forEach((i) => {
    if (i.rowNumber === eRowNumber) {
      i.depnBasis = e.details.valueAfter;
      updatedTransToPost.push(i);
    } else {
      updatedTransToPost.push(i);
    }
  });
  return updatedTransToPost;
}

export function updateDepnRate(e, transToPost, eRowNumber) {
  const updatedTransToPost = [];
  transToPost.forEach((i) => {
    if (i.rowNumber === eRowNumber) {
      i.depnRate = e.details.valueAfter;
      updatedTransToPost.push(i);
    } else {
      updatedTransToPost.push(i);
    }
  });
  return updatedTransToPost;
}

export async function createTFAR(session) {
  try {
    await Excel.run(async (context) => {
      await postTFAtoDB(session);
      createTFARWs(context, session);
    });
  } catch (e) {
    console.error(e);
  }
}

export async function postTFAtoDB(session) {
  const options = fetchOptionsTFA(session);
  const updatedCustAndAssDb = await fetch(postTFA, options);
  const updatedCustAndAss = await updatedCustAndAssDb.json();
  console.log(updatedCustAndAss);
  session["customer"] = updatedCustAndAss.customer;
  session["activeAssignment"] = updatedCustAndAss.assignment;
}

export async function createTFARWs(context, session) {
  const transToPost = session["TFATransactions"];
  const TFAActiveCats = [];
  transToPost.forEach((i) => {
    if (!TFAActiveCats.includes(i.assetCategory)) {
      TFAActiveCats.push(i);
    }
  });
  TFAActiveCats.sort((a, b) => {
    return a.assetCategoryNo - b.assetCategoryNo;
  });
  const wsName = "TFA Register";
  const ws = addWorksheet(context, wsName);
  const wsHeaders = worksheetHeader(session, "Tangible fixed assets register");
  applyWorkhseetHeader(ws, wsHeaders);
  await context.sync();
  populateTFARWs(context, TFAActiveCats, transToPost, ws);
}

export async function populateTFARWs(context, TFAActiveCats, transToPost, ws) {
  const tFARBodyVals = [];
  const underlineA = [];
  const underlineAO = [];
  const formatTotal = [];
  let rowNumber = 10;
  TFAActiveCats.forEach((cat) => {
    //rowNumber ++;
    let additionsTotal = 0;
    const catHeader = [];
    catHeader.push(cat.assetCategory);
    for (let i = 0; i < 14; i++) {
      catHeader.push("");
    }
    tFARBodyVals.push(catHeader);
    underlineA.push(rowNumber);
    rowNumber++;
    const blankLine = [];
    for (let i = 0; i < 15; i++) {
      blankLine.push("");
    }
    tFARBodyVals.push(blankLine);
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
      "Dep'n",
      "Dep'n",
      "Dep'n Elim",
      "Dep'n",
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
    tFARBodyVals.push(registerColNamesOne);
    underlineAO.push(rowNumber);
    rowNumber++;
    tFARBodyVals.push(registerColNamesTwo);
    underlineAO.push(rowNumber);
    rowNumber++;
    tFARBodyVals.push(blankLine);
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
        assetLine.push("placeholder");
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
        tFARBodyVals.push(assetLine);
        rowNumber++;
        additionsTotal += tran.value / 100;
      }
    });
    tFARBodyVals.push(blankLine);
    rowNumber++;
    const catTotalsLine = ["", "", "", 0, additionsTotal, 0, additionsTotal, "", 0, 0, 0, 0, "", additionsTotal, 0];
    tFARBodyVals.push(catTotalsLine);
    formatTotal.push(rowNumber);
    rowNumber++;
    tFARBodyVals.push(blankLine);
    rowNumber++;
  });
  const tFARBodyRange = ws.getRange(`A10:O${tFARBodyVals.length + 9}`);
  tFARBodyRange.values = tFARBodyVals;
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
