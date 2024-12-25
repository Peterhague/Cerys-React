import { createIFARegister, updateIFARegister, updateAssignmentUrl } from "../../fetching/apiEndpoints";
import { fetchOptionsIFA, fetchOptionsUpdateAssignment } from "../../fetching/generateOptions";
import { applyWorkhseetHeader, worksheetHeader } from "../../workbook views/components/schedule-header";
import { calculateDiffInDays } from "../helperFunctions";
import { addOneWorksheet, deleteManyWorksheets } from "../worksheet";
import { createCurrentPeriodRegister } from "./asset-reg-generation";
import { populateAssetRegWs } from "./asset-reg-population";

//export function createRelTransIFA(session) {
//  const relevantTrans = [];
//  session.activeAssignment.transactions.forEach((tran) => {
//    if (
//      tran.cerysCategory === "Intangible assets" &&
//      (tran.assetCodeType === "iFACostAddns" || tran.assetCodeType === "iFACostBF")
//    ) {
//      relevantTrans.push(tran);
//    }
//  });
//  createIFATransSumm(session, relevantTrans);
//}

//export async function createIFATransSumm(session, relevantTrans) {
//  const context = await getExcelContext();
//  const ws = addWorksheet(context, "IFA Transactions");
//  ws.load(["id", "name"]);
//  await context.sync();
//  const sheetMapping = [];
//  let activeClient;
//  session.customer.clients.forEach((client) => {
//    if (client._id === session.activeAssignment.clientId) {
//      activeClient = client;
//    }
//  });
//  const valuesToPost = [
//    [
//      "TRANSACTION",
//      "CERYS",
//      "CERYS",
//      "POSTING",
//      "CERYS",
//      "CERYS",
//      "CLIENT",
//      "CLIENT",
//      "CLIENT",
//      "DEBIT/",
//      "AMORT",
//      "AMORT",
//      "AMORT",
//    ],
//    [
//      "NUMBER",
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
//  session["IFATransactions"] = [];
//  relevantTrans.forEach((i) => {
//    if (i.clientTB) {
//      let trans;
//      session.activeAssignment.clientNL.forEach((tran) => {
//        if (tran.code === i.clientNominalCode) {
//          trans = i;
//          trans["transactionDate"] = convertExcelDate(tran.date);
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
//          trans["transactionDateClt"] = tran.date;
//          trans["clientNominalCode"] = tran.code;
//          trans["clientNominalName"] = tran.name;
//          trans["assetNarrative"] = tran.detail;
//          trans["value"] = tran.value;
//            //trans["rowNumber"] = session["IFATransactions"].length + 3;
//            // Issue: what to use for _id for these client transactions????
//            //const map = new TransactionMap()
//        }
//      });
//      session["IFATransactions"].push(trans);
//    } else {
//        //i.rowNumber = session["IFATransactions"].length + 3;
//        const map = new TransactionMap(i._id, session["IFATransactions"].length + 3)
//        sheetMapping.push(map);
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
//      session["IFATransactions"].push(i);
//    }
//  });
//  //session.activeJournal.clientTB = false;
//  //session.activeJournal.journal = false;
//  //session.activeJournal.journalType = "auto-journal";
//  session["IFATransactions"].forEach((tran) => {
//    const transVals = [];
//    transVals.push(tran.transactionNumber);
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
//    if (tran.assetCategoryNo === 1) {
//      transVals.push(activeClient.amortBasisGwill);
//      transVals.push(activeClient.amortRateGwill);
//      tran.amortBasis = activeClient.amortBasisGwill;
//      tran.amortRate = activeClient.amortRateGwill;
//    } else if (tran.assetCategoryNo === 2) {
//      transVals.push(activeClient.amortBasisPatsLics);
//      transVals.push(activeClient.amortRatePatsLics);
//      tran.amortBasis = activeClient.amortBasisPatsLics;
//      tran.amortRate = activeClient.amortRatePatsLics;
//    } else if (tran.assetCategoryNo === 3) {
//      transVals.push(activeClient.amortBasisDevCosts);
//      transVals.push(activeClient.amortRateDevCosts);
//      tran.amortBasis = activeClient.amortBasisDevCosts;
//      tran.amortRate = activeClient.amortRateDevCosts;
//    } else if (tran.assetCategoryNo === 4) {
//      transVals.push(activeClient.amortBasisCompSware);
//      transVals.push(activeClient.amortRateCompSware);
//      tran.amortBasis = activeClient.amortBasisCompSware;
//      tran.amortRate = activeClient.amortRateCompSware;
//    }
//    calculateAmortChg(session, tran);
//    transVals.push(tran.amortChg / 100);
//    //transVals.push(excelAmortFormula);
//    valuesToPost.push(transVals);
//  });
//  const headerRange = ws.getRange("A1:M2");
//  headerRange.format.font.bold = true;
//  const range = ws.getRange(`A1:M${valuesToPost.length}`);
//  range.values = valuesToPost;
//  const rangeB = ws.getRange("B:B");
//  rangeB.numberFormat = "dd/mm/yyyy";
//  const rangeJ = ws.getRange("J:J");
//  rangeJ.numberFormat = "#,##0.00;(#,##0.00);-";
//  const rangeM = ws.getRange("M:M");
//  rangeM.numberFormat = "#,##0.00;(#,##0.00);-";
//  const rangeAM = ws.getRange("A:M");
//  rangeAM.format.autofitColumns();
//  const definedCols = [
//    {
//      type: "transNo",
//      colNumber: 1,
//      mutable: false,
//      format: "0",
//      deleted: false,
//    },
//    {
//      type: "date",
//      colNumber: 2,
//      mutable: true,
//      format: "dd/mm/yyyy",
//      deleted: false,
//      updateKey: "updatedDate",
//    },
//    {
//      type: "cerysNarrative",
//      colNumber: 3,
//      mutable: true,
//      format: "",
//      deleted: false,
//      updateKey: "updatedNarrative",
//    },
//    {
//      type: "transType",
//      colNumber: 4,
//      mutable: false,
//      format: "",
//      deleted: false,
//    },
//    {
//      type: "cerysCode",
//      colNumber: 5,
//      mutable: true,
//      format: "0",
//      deleted: false,
//      updateKey: "updatedCode",
//    },
//    {
//      type: "cerysName",
//      colNumber: 6,
//      mutable: false,
//      format: "",
//      deleted: false,
//    },
//    {
//      type: "clientCode",
//      colNumber: 7,
//      mutable: false,
//      format: "0",
//      deleted: false,
//    },
//    {
//      type: "clientNominal",
//      colNumber: 8,
//      mutable: false,
//      format: "",
//      deleted: false,
//    },
//    {
//      type: "clientNarrative",
//      colNumber: 9,
//      mutable: false,
//      format: "",
//      deleted: false,
//    },
//    {
//      type: "value",
//      colNumber: 10,
//      mutable: false,
//      format: "#,##0.00;(#,##0.00);-",
//      deleted: false,
//    },
//    {
//      type: "amortBasis",
//      colNumber: 11,
//      mutable: true,
//      format: "",
//      deleted: false,
//      updateKey: "updatedAmortBasis",
//    },
//    {
//      type: "amortRate",
//      colNumber: 12,
//      mutable: true,
//      format: "0",
//      deleted: false,
//      updateKey: "updatedAmortRate",
//    },
//    {
//      type: "amortCharge",
//      colNumber: 13,
//      format: "#,##0.00;(#,##0.00);-",
//      deleted: false,
//    },
//  ];
//  // edit here please
//  const transactions = _.cloneDeep(session.IFATransactions);
//  createEditableWs(session, transactions, ws, definedCols, valuesToPost, "IFARPreview", sheetMapping);
//  await context.sync();
//  ws.activate();
//}

export function calculateAmortChg(session, tran) {
  const periodEnd = session.activeAssignment.reportingPeriod.reportingDateOrig;
  const daysHeld = calculateDiffInDays(tran.transactionDate, periodEnd) + 1;
  const daysInPeriod = session.activeAssignment.reportingPeriod.noOfDays;
  const charge = Math.round(tran.value * (parseInt(tran.amortRate) / 100) * (daysHeld / daysInPeriod));
  tran.amortChg = charge;
  tran.assetSubCatCodes.push(11);
  const subTran = {
    assetSubCatCode: 11,
    assetSubCategory: "Amort chg",
    regColNameOne: "Amort",
    regColNameTwo: "Charge",
    value: charge,
  };
  tran.subTransactions.push(subTran);
  const jnls = buildAutoAmortJnls(session, tran);
  session.activeJournal.journals.push(jnls.debit);
  session.activeJournal.netValue += jnls["debit"]["value"];
  session.activeJournal.journals.push(jnls.credit);
  session.activeJournal.netValue += jnls["credit"]["value"];
  return `=ROUND(SUM((${tran.value / 100})*(${parseInt(tran.amortRate)}/100)*((${session.activeAssignment.reportingPeriod.reportingDateExcel + 1}-B3)/${daysInPeriod})), 2)`;
  //console.log(excelAmortFormula);
}

//export const recalculateAmortChg = async (session, sheet, tran, e) => {
//  const newValue = e.details.valueAfter;
//  const mongoDate = convertExcelDate(e.details.valueAfter);
//  const periodEnd = session.activeAssignment.reportingPeriod.reportingDateOrig;
//  const daysHeld = calculateDiffInDays(mongoDate, periodEnd) + 1;
//  const daysInPeriod = session.activeAssignment.reportingPeriod.noOfDays;
//  const charge = Math.round(tran.value * (parseInt(tran.amortRate) / 100) * (daysHeld / daysInPeriod));
//  let amortChgColNumber;
//  sheet.definedCols.forEach((col) => {
//    if (col.type === "amortCharge") amortChgColNumber = col.colNumber;
//  });
//  const colLetter = colNumToLetter(amortChgColNumber);
//  const rowNumber = getTransRowNumber(tran, sheet);
//  const range = `${colLetter}${rowNumber}:${colLetter}${rowNumber}`;
//  session.options.allowAmortChgEdit = true;
//  await setExcelRangeValue(sheet.name, range, charge / 100);
//  session.IFATransactions.forEach((i) => {
//    if (i._id === tran._id) {
//      i.amortChg = charge;
//      i.transactionDateExcel = newValue;
//      i.subTransactions.forEach((subTran) => {
//        if (subTran.assetSubCatCode === 11 && subTran.assetSubCategory === "Amort chg") {
//          subTran.value = charge;
//        }
//      });
//    }
//  });
//  adjustAutoAmortJnls(session, tran, charge);
//};

export const updateIFANarrative = async (session, tran, e) => {
  session.IFATransactions.forEach((i) => {
    if (i._id === tran._id) {
      i.assetNarrative = e.details.valueAfter;
    }
  });
};

export const buildAutoAmortJnls = (session, tran) => {
  console.log(tran);
  const catNo = tran.assetCategoryNo;
  const jnls = setAutoAmortNominals(catNo);
  session.chart.forEach((nom) => {
    if (nom.cerysCode === jnls.debit) jnls.debit = nom;
    if (nom.cerysCode === jnls.credit) jnls.credit = nom;
  });
  jnls.debit["transactionId"] = tran._id;
  jnls.credit["transactionId"] = tran._id;
  jnls.debit["value"] = tran.amortChg;
  jnls.credit["value"] = tran.amortChg * -1;
  jnls.debit["transactionDate"] = session.activeAssignment.reportingPeriod.reportingDateOrig;
  jnls.credit["transactionDate"] = session.activeAssignment.reportingPeriod.reportingDateOrig;
  jnls.debit["narrative"] = "Amortisation charged automatically";
  jnls.credit["narrative"] = "Amortisation charged automatically";
  return jnls;
};

export const setAutoAmortNominals = (catNo) => {
  switch (catNo) {
    case 1:
      return { debit: 3891, credit: 5032 };
    case 2:
      return { debit: 3892, credit: 5052 };
    case 3:
      return { debit: 3893, credit: 5072 };
    case 4:
      return { debit: 3894, credit: 5092 };
    default:
      return { debit: 3890, credit: 5012 };
  }
};

export const adjustAutoAmortJnls = (session, tran, charge) => {
  session.activeJournal.journals.forEach((jnl) => {
    if (jnl.transactionId === tran._id) {
      if (jnl.value > 0) jnl.value = charge;
      if (jnl.value < 0) jnl.value = charge * -1;
    }
  });
};

//export async function captureIFARSummChange(context, e, transToPost, ws) {
//  const eRowNumber = parseInt(e.address.substr(1));
//  const callingCell = ws.getRange(`${e.address}:${e.address}`);
//  callingCell.format.fill.color = "lightGreen";
//  await context.sync();
//  if (e.address[0] === "D") {
//    transToPost = updateNomCode(e, transToPost, eRowNumber, sheet);
//  } else if (e.address[0] === "J") {
//    transToPost = updateAmortBasis(e, transToPost, eRowNumber);
//  } else if (e.address[0] === "K") {
//    transToPost = updateAmortRate(e, transToPost, eRowNumber);
//  }
//}

//export function updateAmortBasis(e, transToPost, eRowNumber) {
//  const updatedTransToPost = [];
//  transToPost.forEach((i) => {
//    if (i.rowNumber === eRowNumber) {
//      i.amortBasis = e.details.valueAfter;
//      updatedTransToPost.push(i);
//    } else {
//      updatedTransToPost.push(i);
//    }
//  });
//  return updatedTransToPost;
//}

//export function updateAmortRate(e, transToPost, eRowNumber) {
//  const updatedTransToPost = [];
//  transToPost.forEach((i) => {
//    if (i.rowNumber === eRowNumber) {
//      i.amortRate = e.details.valueAfter;
//      updatedTransToPost.push(i);
//    } else {
//      updatedTransToPost.push(i);
//    }
//  });
//  return updatedTransToPost;
//}

export async function createIFAR(context, session) {
  const assignment = await postIFAtoDB(session);
  session["activeAssignment"] = assignment;
  createIFARWs(context, session);
}

export async function postIFAtoDB(session) {
  let assignment = session.activeAssignment;
  const options = fetchOptionsIFA(session);
  const endpoint = session.activeAssignment.IFARegisterCreated ? updateIFARegister : createIFARegister;
  const iFARDb = await fetch(endpoint, options);
  const iFAR = await iFARDb.json();
  session.IFARegister = createCurrentPeriodRegister(iFAR, session);
  if (!session.activeAssignment.IFARegisterCreated) {
    const options = fetchOptionsUpdateAssignment(
      session.customer._id,
      session.activeAssignment._id,
      "IFARegisterCreated"
    );
    const assignmentDb = await fetch(updateAssignmentUrl, options);
    assignment = await assignmentDb.json();
  }
  //const updatedAssignmentDb = await fetch(postIFA, options);
  //const updatedAssignment = await updatedAssignmentDb.json();
  console.log(assignment);
  return assignment;
}

export async function createIFARWs(context, session) {
  //const transToPost = session.activeAssignment.IFAR;
  const transToPost = session.IFARegister;
  console.log(transToPost);
  const activeCatsNames = [];
  const IFAActiveCats = [];
  transToPost.forEach((i) => {
    if (!activeCatsNames.includes(i.assetCategory)) {
      activeCatsNames.push(i.assetCategory);
      IFAActiveCats.push({
        assetCategory: i.assetCategory,
        assetCategoryNo: i.assetCategoryNo,
      });
    }
  });
  IFAActiveCats.sort((a, b) => {
    return a.assetCategoryNo - b.assetCategoryNo;
  });
  const wsName = "IFA Register";
  const { ws } = await addOneWorksheet(context, session, { name: wsName, addListeners: undefined });
  const wsHeaders = worksheetHeader(session, "Intangible fixed assets register");
  applyWorkhseetHeader(ws, wsHeaders);
  populateAssetRegWs(IFAActiveCats, transToPost, ws, "IFA");
  ws.activate();
  deleteManyWorksheets(context, ["IFA Transactions"]);
}
