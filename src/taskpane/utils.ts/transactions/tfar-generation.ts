import { createTFARegister, updateAssignmentUrl, updateTFARegister } from "../../fetching/apiEndpoints";
import { fetchOptionsTFA, fetchOptionsUpdateAssignment } from "../../fetching/generateOptions";
import { applyWorkhseetHeader, worksheetHeader } from "../../workbook views/components/schedule-header";
import { calculateDiffInDays } from "../helperFunctions";
import { addWorksheet, deleteManyWorksheets } from "../worksheet";
import { createCurrentPeriodRegister } from "./asset-reg-generation";
import { populateAssetRegWs } from "./asset-reg-population";

//export function createRelTransTFA(session, setView) {
//  const relevantTrans = [];
//  session.activeAssignment.transactions.forEach((tran) => {
//    if (
//      tran.cerysCategory === "Tangible assets" &&
//      (tran.assetCodeType === "tFACostAddns" || tran.assetCodeType === "tFACostBF")
//    ) {
//      relevantTrans.push(tran);
//    }
//  });
//  const bFTransLikelyAddns = [];
//  console.log(relevantTrans);
//  relevantTrans.forEach((tran) => {
//    if (tran.assetSubCatCode === 1) {
//      const test = calculateDiffInDays(session.activeAssignment.reportingPeriod.periodStart, tran.transactionDate);
//      test > 0 && bFTransLikelyAddns.push(tran);
//    }
//  });
//  if (bFTransLikelyAddns.length > 0) {
//    createTFATransSumm(session, bFTransLikelyAddns);
//    setView("confirmBFAreAddns");
//  } else {
//    createTFATransSumm(session, relevantTrans);
//    setView("confirm");
//  }
//}

//export async function createTFATransSumm(session, relevantTrans) {
//  const context = await getExcelContext();
//  console.log(relevantTrans);
//  const ws = addWorksheet(context, "TFA Transactions");
//  let activeClient;
//  session.customer.clients.forEach((client) => {
//    if (client._id === session.activeAssignment.clientId) {
//      activeClient = client;
//    }
//  });
//  const bodyContent = [];
//  session["TFATransactions"] = [];
//  relevantTrans.forEach((i) => {
//    if (i.clientTB) {
//      console.log("here");
//      let trans;
//      console.log(session.activeAssignment.clientNL);
//      session.activeAssignment.clientNL.forEach((tran) => {
//        if (tran.code === i.clientNominalCode) {
//          trans = i;
//          trans["assetSubCatCodes"] = [trans["assetSubCatCode"]];
//          trans["subTransactions"] = [
//            {
//              assetSubCategory: i.assetSubCategory,
//              assetSubCatCode: i.assetSubCatCode,
//              regColNameOne: i.regColNameOne,
//              regColNameTwo: i.regColNameTwo,
//              value: tran.value,
//            },
//          ];
//          trans["transactionDate"] = convertExcelDate(tran.date);
//          trans["transactionDateClt"] = tran.date;
//          trans["transactionDateExcel"] = tran.date;
//          trans["clientNominalCode"] = tran.code;
//          trans["clientNominalName"] = tran.name;
//          trans["assetNarrative"] = tran.detail;
//          trans["value"] = tran.value;
//          trans["rowNumber"] = session["TFATransactions"].length + 3;
//        }
//      });
//      session["TFATransactions"].push(trans);
//    } else {
//      i.rowNumber = session["TFATransactions"].length + 3;
//      i.assetNarrative = i.narrative;
//      i.assetSubCatCodes = [i.assetSubCatCode];
//      i["subTransactions"] = [
//        {
//          assetSubCategory: i.assetSubCategory,
//          assetSubCatCode: i.assetSubCatCode,
//          regColNameOne: i.regColNameOne,
//          regColNameTwo: i.regColNameTwo,
//          value: i.value,
//        },
//      ];
//      session["TFATransactions"].push(i);
//    }
//  });
//  session.activeJournal.clientTB = false;
//  session.activeJournal.journal = false;
//  session.activeJournal.journalType = "auto-journal";
//  session["TFATransactions"].forEach((tran) => {
//    const transVals = [];
//    console.log(tran);
//    if (tran.transactionDate) {
//      const dateString = tran.transactionDate.split("T")[0];
//      console.log(dateString);
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
//    if (tran.assetCategoryNo === 1) {
//      tran.depnBasis = activeClient.depnBasisFholdProp;
//      tran.depnRate = activeClient.depnRateFholdProp;
//      transVals.push(activeClient.depnBasisFholdProp);
//      transVals.push(activeClient.depnRateFholdProp);
//    } else if (tran.assetCategoryNo === 2) {
//      tran.depnBasis = activeClient.depnBasisShortLhold;
//      tran.depnRate = activeClient.depnRateShortLhold;
//      transVals.push(activeClient.depnBasisShortLhold);
//      transVals.push(activeClient.depnRateShortLhold);
//    } else if (tran.assetCategoryNo === 3) {
//      tran.depnBasis = activeClient.depnBasisLongLhold;
//      tran.depnRate = activeClient.depnRateLongLhold;
//      transVals.push(activeClient.depnBasisLongLhold);
//      transVals.push(activeClient.depnRateLongLhold);
//    } else if (tran.assetCategoryNo === 4) {
//      tran.depnBasis = activeClient.depnBasisImprovements;
//      tran.depnRate = activeClient.depnRateImprovements;
//      transVals.push(activeClient.depnBasisImprovements);
//      transVals.push(activeClient.depnRateImprovements);
//    } else if (tran.assetCategoryNo === 5) {
//      tran.depnBasis = activeClient.depnBasisPlantMachinery;
//      tran.depnRate = activeClient.depnRatePlantMachinery;
//      transVals.push(activeClient.depnBasisPlantMachinery);
//      transVals.push(activeClient.depnRatePlantMachinery);
//    } else if (tran.assetCategoryNo === 6) {
//      tran.depnBasis = activeClient.depnBasisFixFittings;
//      tran.depnRate = activeClient.depnRateFixFittings;
//      transVals.push(activeClient.depnBasisFixFittings);
//      transVals.push(activeClient.depnRateFixFittings);
//    } else if (tran.assetCategoryNo === 7) {
//      tran.depnBasis = activeClient.depnBasisMotorVehicles;
//      tran.depnRate = activeClient.depnRateMotorVehicles;
//      transVals.push(activeClient.depnBasisMotorVehicles);
//      transVals.push(activeClient.depnRateMotorVehicles);
//    } else if (tran.assetCategoryNo === 8) {
//      tran.depnBasis = activeClient.depnBasisCompEquip;
//      tran.depnRate = activeClient.depnRateCompEquip;
//      transVals.push(activeClient.depnBasisCompEquip);
//      transVals.push(activeClient.depnRateCompEquip);
//    } else if (tran.assetCategoryNo === 9) {
//      tran.depnBasis = activeClient.depnBasisOfficeEquip;
//      tran.depnRate = activeClient.depnRateOfficeEquip;
//      transVals.push(activeClient.depnBasisOfficeEquip);
//      transVals.push(activeClient.depnRateOfficeEquip);
//    }
//    calculateDepnChg(session, tran);
//    transVals.push(tran.depnChg / 100);
//    bodyContent.push(transVals);
//  });
//  let bodyRange;
//  const headerRange = ws.getRange("A1:L2");
//  headerRange.values = [
//    ["CERYS", "CERYS", "POSTING", "CERYS", "CERYS", "CLIENT", "CLIENT", "CLIENT", "DEBIT/", "DEPN", "DEPN", "DEPN"],
//    [
//      "DATE",
//      "NARRATIVE",
//      "SOURCE",
//      "CODE",
//      "NOMINAL",
//      "NC",
//      "NOMINAL",
//      "NARRATIVE",
//      "(CREDIT)",
//      "BASIS",
//      "RATE",
//      "CHARGE",
//    ],
//  ];
//  bodyRange = ws.getRange(`A3:L${bodyContent.length + 2}`);
//  headerRange.format.font.bold = true;
//  bodyRange.values = bodyContent;
//  const rangeA = ws.getRange("A:A");
//  rangeA.numberFormat = "dd/mm/yyyy";
//  const rangeI = ws.getRange("I:I");
//  rangeI.numberFormat = "#,##0.00;(#,##0.00);-";
//  const rangeAK = ws.getRange("A:l");
//  rangeAK.format.autofitColumns();
//  const rangeD = ws.getRange(`D3:D${bodyContent.length + 2}`);
//  const rangeJK = ws.getRange(`J3:K${bodyContent.length + 2}`);
//  rangeD.format.fill.color = "yellow";
//  rangeJK.format.fill.color = "yellow";
//  //ws.onChanged.add(async (e) => captureTFARSummChange(context, e, session["TFATransactions"], ws));
//  await context.sync();
//}

export function calculateDepnChg(session, tran) {
  console.log(tran);
  const periodEnd = session.activeAssignment.reportingPeriod.reportingDateOrig;
  const daysHeld = calculateDiffInDays(tran.transactionDate, periodEnd) + 1;
  const daysInPeriod = session.activeAssignment.reportingPeriod.noOfDays;
  const charge = Math.round(tran.value * (parseInt(tran.depnRate) / 100) * (daysHeld / daysInPeriod));
  console.log(charge);
  tran.depnChg = charge;
  tran.assetSubCatCodes.push(11);
  const subTran = {
    assetSubCatCode: 11,
    assetSubCategory: "Depn chg",
    regColNameOne: "Depn",
    regColNameTwo: "Charge",
    value: charge,
  };
  tran.subTransactions.push(subTran);
  const jnls = buildAutoDepnJnls(session, tran);
  session.activeJournal.journals.push(jnls.debit);
  session.activeJournal.netValue += jnls["debit"]["value"];
  session.activeJournal.journals.push(jnls.credit);
  session.activeJournal.netValue += jnls["credit"]["value"];
}

export const buildAutoDepnJnls = (session, tran) => {
  const catNo = tran.assetCategoryNo;
  const jnls = setAutoDepnNominals(catNo);
  session.chart.forEach((nom) => {
    if (nom.cerysCode === jnls.debit) jnls.debit = nom;
    if (nom.cerysCode === jnls.credit) jnls.credit = nom;
  });
  jnls.debit["value"] = tran.depnChg;
  jnls.credit["value"] = tran.depnChg * -1;
  jnls.debit["transactionDate"] = session.activeAssignment.reportingPeriod.reportingDateOrig;
  jnls.credit["transactionDate"] = session.activeAssignment.reportingPeriod.reportingDateOrig;
  jnls.debit["narrative"] = "Depreciation charged automatically";
  jnls.credit["narrative"] = "Depreciation charged automatically";
  return jnls;
};

export const setAutoDepnNominals = (catNo) => {
  switch (catNo) {
    case 1:
      return { debit: 3901, credit: 5132 };
    case 2:
      return { debit: 3902, credit: 5152 };
    case 3:
      return { debit: 3903, credit: 5172 };
    case 4:
      return { debit: 3904, credit: 5192 };
    case 5:
      return { debit: 3905, credit: 5212 };
    case 6:
      return { debit: 3906, credit: 5232 };
    case 7:
      return { debit: 3907, credit: 5252 };
    case 8:
      return { debit: 3908, credit: 5272 };
    case 9:
      return { debit: 3909, credit: 5292 };
    default:
      return undefined;
  }
};

//export async function captureTFARSummChange(context, e, transToPost, ws) {
//  const eRowNumber = parseInt(e.address.substr(1));
//  //let updatedTransToPost;
//  const callingCell = ws.getRange(`${e.address}:${e.address}`);
//  callingCell.format.fill.color = "lightGreen";
//  await context.sync();
//  if (e.address[0] === "D") {
//    transToPost = updateNomCode(e, transToPost, eRowNumber);
//  } else if (e.address[0] === "J") {
//    transToPost = updateDepnBasis(e, transToPost, eRowNumber);
//  } else if (e.address[0] === "K") {
//    transToPost = updateDepnRate(e, transToPost, eRowNumber);
//  }
//}

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

export async function createTFAR(context, session) {
  const assignment = await postTFAtoDB(session);
  session["activeAssignment"] = assignment;
  createTFARWs(context, session);
}

export async function postTFAtoDB(session) {
  let assignment = session.activeAssignment;
  const options = fetchOptionsTFA(session);
  const endpoint = session.activeAssignment.TFARegisterCreated ? updateTFARegister : createTFARegister;
  const tFARDb = await fetch(endpoint, options);
  const tFAR = await tFARDb.json();
  session.TFARegister = createCurrentPeriodRegister(tFAR, session);
  if (!session.activeAssignment.TFARegisterCreated) {
    const options = fetchOptionsUpdateAssignment(
      session.customer._id,
      session.activeAssignment._id,
      "TFARegisterCreated"
    );
    const assignmentDb = await fetch(updateAssignmentUrl, options);
    assignment = await assignmentDb.json();
  }
  //const updatedAssignmentDb = await fetch(postIFA, options);
  //const updatedAssignment = await updatedAssignmentDb.json();
  console.log(assignment);
  return assignment;
}

export async function createTFARWs(context, session) {
  //const transToPost = session["TFATransactions"];
  const transToPost = session.TFARegister;
  const activeCatsNames = [];
  const TFAActiveCats = [];
  transToPost.forEach((i) => {
    if (!activeCatsNames.includes(i.assetCategory)) {
      activeCatsNames.push(i.assetCategory);
      TFAActiveCats.push({
        assetCategory: i.assetCategory,
        assetCategoryNo: i.assetCategoryNo,
      });
    }
  });
  TFAActiveCats.sort((a, b) => {
    return a.assetCategoryNo - b.assetCategoryNo;
  });
  const wsName = "TFA Register";
  const ws = await addWorksheet(context, wsName);
  const wsHeaders = worksheetHeader(session, "Tangible fixed assets register");
  applyWorkhseetHeader(ws, wsHeaders);
  populateAssetRegWs(TFAActiveCats, transToPost, ws, "TFA");
  ws.activate();
  deleteManyWorksheets(context, ["TFA Transactions"]);
}
