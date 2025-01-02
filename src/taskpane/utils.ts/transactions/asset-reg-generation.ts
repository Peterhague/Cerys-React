import { createEditableWorksheet, EditableWorksheet } from "../../classes/editable-worksheet";
import { Session } from "../../classes/session";
import { TransactionMap } from "../../classes/transaction-map";
import { FATransaction, QuasiEventObject } from "../../interfaces/interfaces";
import { colNumToLetter } from "../excel-col-conversion";
import { accessExcelContext, calculateDiffInDays, convertExcelDate, getTransRowNumber } from "../helperFunctions";
import { addOneWorksheet, deleteManyWorksheets, setExcelRangeValue } from "../worksheet";
import _ from "lodash";
/*global Excel */

export const identifyLikelyAdditions = async (session: Session, registerType, setView) => {
  console.log("next step working");
  const bFTransLikelyAddns = [];
  //session.activeAssignment.transactions.forEach((tran) => {
  //  if (
  //    (tran.cerysCategory === "Intangible assets" && tran.assetCodeType === "iFACostBF") ||
  //    (tran.cerysCategory === "Tangible assets" && tran.assetCodeType === "tFACostBF") ||
  //    (tran.cerysCategory === "Investment property" && tran.assetCodeType === "iPCostBF")
  //  ) {
  //    const test = calculateDiffInDays(session.activeAssignment.reportingPeriod.periodStart, tran.transactionDate);
  //    test > 0 && bFTransLikelyAddns.push(tran);
  //  }
  //});
  console.log(session.newFATransactions);
  session.newFATransactions.forEach((tran) => {
    if (
      (registerType === "IFA" && tran.cerysCategory === "Intangible assets" && tran.assetCodeType === "iFACostBF") ||
      (registerType === "TFA" && tran.cerysCategory === "Tangible assets" && tran.assetCodeType === "tFACostBF") ||
      (registerType === "IP" && tran.cerysCategory === "Investment property" && tran.assetCodeType === "iPCostBF")
    ) {
      const test = calculateDiffInDays(session.activeAssignment.reportingPeriod.periodStart, tran.transactionDate);
      console.log(test);
      //test > 0 && bFTransLikelyAddns.push(tran);
      bFTransLikelyAddns.push(tran);
      tran.processedAsAsset = true;
    }
  });
  console.log(bFTransLikelyAddns);
  if (bFTransLikelyAddns.length > 0) {
    await createLikelyAdditionsSumm(session, bFTransLikelyAddns, registerType);
    setView("confirmBFAreAddns");
    createTransactionUpdates(session, bFTransLikelyAddns);
  } else {
    previewRelTrans(session, registerType, setView);
  }
};

export const previewRelTrans = (session: Session, registerType, setView) => {
  accessExcelContext(deleteManyWorksheets, [[`${registerType} Possible Additions`]]);
  createRelTrans(session, registerType);
  setView("confirm");
  session.options[`${registerType}RCreationSetting`] = "confirm";
};

export async function createRelTrans(session: Session, registerType) {
  console.log(session.newFATransactions);
  const relevantTrans = [];
  //session.activeAssignment.transactions.forEach((tran) => {
  //  if (
  //    (tran.cerysCategory === "Intangible assets" && tran.assetCodeType === "iFACostAddns") ||
  //    (tran.cerysCategory === "Tangible assets" && tran.assetCodeType === "tFACostAddns") ||
  //    (tran.cerysCategory === "Investment property" && tran.assetCodeType === "iPCostAddns")
  //  ) {
  //    relevantTrans.push(tran);
  //  }
  //});
  session.newFATransactions.forEach((tran) => {
    if (
      (registerType === "IFA" && tran.cerysCategory === "Intangible assets" && tran.assetCodeType === "iFACostAddns") ||
      (registerType === "TFA" && tran.cerysCategory === "Tangible assets" && tran.assetCodeType === "tFACostAddns") ||
      (registerType === "IP" && tran.cerysCategory === "Investment property" && tran.assetCodeType === "iPCostAddns")
    ) {
      relevantTrans.push(tran);
      tran.processedAsAsset = true;
    }
  });
  createTransSumm(session, relevantTrans, registerType);
  console.log(relevantTrans);
}

export const convertNewFATrans = (session: Session) => {
  const updatedTrans = [];
  session.newFATransactions.forEach((origTran) => {
    //session.activeAssignment.clientNL.forEach((tran) => {
    //  if (tran.code === origTran.clientNominalCode) {
    //    const trans = { ...origTran };
    //    delete trans._id;
    //    trans["transactionDate"] = convertExcelDate(tran.date);
    //    trans["assetSubCatCodes"] = [trans["assetSubCatCode"]];
    //    trans["subTransactions"] = [
    //      {
    //        assetSubCategory: origTran.assetSubCategory,
    //        assetSubCatCode: origTran.assetSubCatCode,
    //        regColNameOne: origTran.regColNameOne,
    //        regColNameTwo: origTran.regColNameTwo,
    //        value: tran.value,
    //      },
    //    ];
    //    trans["transactionDateClt"] = tran.date;
    //    trans["clientNominalCode"] = tran.code;
    //    trans["clientNominalName"] = tran.name;
    //    trans["assetNarrative"] = tran.detail;
    //    trans["value"] = tran.value;
    //    updatedTrans.push(trans);
    //  }
    //});
    const clientNL = session.activeAssignment.clientNL;
    for (let i = 0; i < clientNL.length; i++) {
      if (clientNL[i].code === origTran.clientNominalCode) {
        const trans = { ...origTran };
        delete trans._id;
        trans["transactionDate"] = convertExcelDate(clientNL[i].date);
        trans["assetSubCatCodes"] = [trans["assetSubCatCode"]];
        trans["subTransactions"] = [
          {
            assetSubCategory: origTran.assetSubCategory,
            assetSubCatCode: origTran.assetSubCatCode,
            regColNameOne: origTran.regColNameOne,
            regColNameTwo: origTran.regColNameTwo,
            value: clientNL[i].value,
          },
        ];
        trans["transactionDateClt"] = clientNL[i].date;
        trans["clientNominalCode"] = clientNL[i].code;
        trans["clientNominalName"] = clientNL[i].name;
        trans["assetNarrative"] = clientNL[i].detail;
        trans["value"] = clientNL[i].value;
        updatedTrans.push(trans);
      }
    }
  });
  console.log(updatedTrans);
  session.newFATransactions = updatedTrans;
};

export async function createTransSumm(session: Session, relevantTrans, registerType) {
  try {
    await Excel.run(async (context) => {
      const sheetMapping = [];
      const name = `${registerType} Transactions`;
      const { ws } = await addOneWorksheet(context, session, { name, addListeners: undefined });
      let activeClient;
      session.customer.clients.forEach((client) => {
        if (client._id === session.activeAssignment.clientId) {
          activeClient = client;
        }
      });
      const amortOrDepn = registerType === "IFA" ? "AMORT" : "DEPN";
      const valuesToPost = [
        [
          "TRANSACTION",
          "CERYS",
          "CERYS",
          "POSTING",
          "CERYS",
          "CERYS",
          "CLIENT",
          "CLIENT",
          "CLIENT",
          "DEBIT/",
          amortOrDepn,
          amortOrDepn,
          amortOrDepn,
        ],
        [
          "NUMBER",
          "DATE",
          "NARRATIVE",
          "SOURCE",
          "CODE",
          "NOMINAL",
          "NC",
          "NOMINAL",
          "NARRATIVE",
          "(CREDIT)",
          "BASIS",
          "RATE",
          "CHARGE",
        ],
      ];
      session[`${registerType}Transactions`] = [];
      //relevantTrans.forEach((i) => {
      //  if (i.clientTB) {
      //    let trans;
      //    session.activeAssignment.clientNL.forEach((tran) => {
      //      if (tran.code === i.clientNominalCode) {
      //        trans = i;
      //        trans["transactionDate"] = convertExcelDate(tran.date);
      //        trans["assetSubCatCodes"] = [trans["assetSubCatCode"]];
      //        trans["subTransactions"] = [
      //          {
      //            assetSubCategory: i.assetSubCategory,
      //            assetSubCatCode: i.assetSubCatCode,
      //            regColNameOne: i.regColNameOne,
      //            regColNameTwo: i.regColNameTwo,
      //            value: tran.value,
      //          },
      //        ];
      //        trans["transactionDateClt"] = tran.date;
      //        trans["clientNominalCode"] = tran.code;
      //        trans["clientNominalName"] = tran.name;
      //        trans["assetNarrative"] = tran.detail;
      //        trans["value"] = tran.value;
      //        trans["rowNumber"] = session[`${registerType}Transactions`].length + 3;
      //      }
      //    });
      //    session[`${registerType}Transactions`].push(trans);
      //  } else {
      //    i.rowNumber = session[`${registerType}Transactions`].length + 3;
      //    i.assetNarrative = i.narrative;
      //    i.assetSubCatCodes = [i.assetSubCatCode];
      //    i["subTransactions"] = [
      //      {
      //        assetSubCategory: i.assetSubCategory,
      //        assetSubCatCode: i.assetSubCatCode,
      //        regColNameOne: i.regColNameOne,
      //        regColNameTwo: i.regColNameTwo,
      //        value: i.value,
      //      },
      //    ];
      //    session[`${registerType}Transactions`].push(i);
      //  }
      //});
      relevantTrans.forEach((i) => {
        //i.rowNumber = session[`${registerType}Transactions`].length + 3;
        //i.assetNarrative = i.narrative;
        const map = new TransactionMap(i._id, session[`${registerType}Transactions`].length + 3); // Issue: is this right?? don't think so...
        sheetMapping.push(map);
        i.assetSubCatCodes = [i.assetSubCatCode];
        i["subTransactions"] = [
          {
            assetSubCategory: i.assetSubCategory,
            assetSubCatCode: i.assetSubCatCode,
            regColNameOne: i.regColNameOne,
            regColNameTwo: i.regColNameTwo,
            value: i.value,
          },
        ];
        session[`${registerType}Transactions`].push(i);
      });
      session[`${registerType}Transactions`].forEach((tran) => {
        const transVals = [];
        transVals.push(tran.transactionNumber);
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
        } else {
          transVals.push("Sticking plaster");
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
        populateDepnCols(activeClient, transVals, tran, registerType);
        calculateCharge(session, tran, registerType);
        tran.amortChg ? transVals.push(tran.amortChg / 100) : transVals.push(tran.depnChg / 100);
        valuesToPost.push(transVals);
      });
      const headerRange = ws.getRange("A1:M2");
      headerRange.format.font.bold = true;
      const range = ws.getRange(`A1:M${valuesToPost.length}`);
      console.log(valuesToPost);
      range.values = valuesToPost;
      const rangeB = ws.getRange("B:B");
      rangeB.numberFormat = [["dd/mm/yyyy"]];
      const rangeJ = ws.getRange("J:J");
      rangeJ.numberFormat = [["#,##0.00;(#,##0.00);-"]];
      const rangeM = ws.getRange("M:M");
      rangeM.numberFormat = [["#,##0.00;(#,##0.00);-"]];
      const rangeAM = ws.getRange("A:M");
      rangeAM.format.autofitColumns();
      // const definedCols = [
      //   {
      //     type: "transNo",
      //     colNumber: 1,
      //     mutable: false,
      //     format: "0",
      //     deleted: false,
      //   },
      //   {
      //     type: "date",
      //     colNumber: 2,
      //     mutable: true,
      //     format: "dd/mm/yyyy",
      //     deleted: false,
      //     updateKey: "updatedDate",
      //   },
      //   {
      //     type: "cerysNarrative",
      //     colNumber: 3,
      //     mutable: true,
      //     format: "",
      //     deleted: false,
      //     updateKey: "updatedNarrative",
      //   },
      //   {
      //     type: "transType",
      //     colNumber: 4,
      //     mutable: false,
      //     format: "",
      //     deleted: false,
      //   },
      //   {
      //     type: "cerysCode",
      //     colNumber: 5,
      //     mutable: true,
      //     format: "0",
      //     deleted: false,
      //     updateKey: "updatedCode",
      //   },
      //   {
      //     type: "cerysName",
      //     colNumber: 6,
      //     mutable: false,
      //     format: "",
      //     deleted: false,
      //   },
      //   {
      //     type: "clientCode",
      //     colNumber: 7,
      //     mutable: false,
      //     format: "0",
      //     deleted: false,
      //   },
      //   {
      //     type: "clientNominal",
      //     colNumber: 8,
      //     mutable: false,
      //     format: "",
      //     deleted: false,
      //   },
      //   {
      //     type: "clientNarrative",
      //     colNumber: 9,
      //     mutable: false,
      //     format: "",
      //     deleted: false,
      //   },
      //   {
      //     type: "value",
      //     colNumber: 10,
      //     mutable: false,
      //     format: "#,##0.00;(#,##0.00);-",
      //     deleted: false,
      //   },
      //   {
      //     type: "depnBasis",
      //     colNumber: 11,
      //     mutable: true,
      //     format: "",
      //     deleted: false,
      //     updateKey: "updatedDepnBasis",
      //   },
      //   {
      //     type: "depnRate",
      //     colNumber: 12,
      //     mutable: true,
      //     format: "0",
      //     deleted: false,
      //     updateKey: "updatedDepnRate",
      //   },
      //   {
      //     type: "depnCharge",
      //     colNumber: 13,
      //     format: "#,##0.00;(#,##0.00);-",
      //     deleted: false,
      //   },
      // ];
      const transactions = _.cloneDeep(session[`${registerType}Transactions`]);
      createEditableWorksheet(session, transactions, ws, valuesToPost, "FATransactions", sheetMapping);
      await context.sync();
      ws.activate();
    });
  } catch (e) {
    console.error(e);
  }
}

export async function createLikelyAdditionsSumm(session: Session, relevantTrans, registerType) {
  try {
    await Excel.run(async (context) => {
      const name = `${registerType} Possible Additions`;
      const { ws } = await addOneWorksheet(context, session, { name, addListeners: undefined });
      const valuesToPost = [
        ["TRANSACTION", "CERYS", "CERYS", "POSTING", "CERYS", "CERYS", "CLIENT", "CLIENT", "CLIENT", "DEBIT/"],
        ["NUMBER", "DATE", "NARRATIVE", "SOURCE", "CODE", "NOMINAL", "NC", "NOMINAL", "NARRATIVE", "(CREDIT)"],
      ];
      relevantTrans.forEach((tran) => {
        const transVals = [];
        transVals.push(tran.transactionNumber);
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
        valuesToPost.push(transVals);
      });
      const headerRange = ws.getRange("A1:J2");
      headerRange.format.font.bold = true;
      const range = ws.getRange(`A1:J${valuesToPost.length}`);
      console.log(valuesToPost);
      range.values = valuesToPost;
      const rangeB = ws.getRange("B:B");
      rangeB.numberFormat = [["dd/mm/yyyy"]];
      const rangeJ = ws.getRange("J:J");
      rangeJ.numberFormat = [["#,##0.00;(#,##0.00);-"]];
      const rangeAJ = ws.getRange("A:J");
      rangeAJ.format.autofitColumns();
      await context.sync();
      ws.activate();
    });
  } catch (e) {
    console.error(e);
  }
}

export const populateDepnCols = (activeClient, transVals, tran, registerType) => {
  if (registerType === "IFA") {
    if (tran.assetCategoryNo === 1) {
      transVals.push(activeClient.amortBasisGwill);
      transVals.push(activeClient.amortRateGwill);
      tran.amortBasis = activeClient.amortBasisGwill;
      tran.amortRate = activeClient.amortRateGwill;
    } else if (tran.assetCategoryNo === 2) {
      transVals.push(activeClient.amortBasisPatsLics);
      transVals.push(activeClient.amortRatePatsLics);
      tran.amortBasis = activeClient.amortBasisPatsLics;
      tran.amortRate = activeClient.amortRatePatsLics;
    } else if (tran.assetCategoryNo === 3) {
      transVals.push(activeClient.amortBasisDevCosts);
      transVals.push(activeClient.amortRateDevCosts);
      tran.amortBasis = activeClient.amortBasisDevCosts;
      tran.amortRate = activeClient.amortRateDevCosts;
    } else if (tran.assetCategoryNo === 4) {
      transVals.push(activeClient.amortBasisCompSware);
      transVals.push(activeClient.amortRateCompSware);
      tran.amortBasis = activeClient.amortBasisCompSware;
      tran.amortRate = activeClient.amortRateCompSware;
    }
  } else if (registerType === "TFA") {
    if (tran.assetCategoryNo === 1) {
      tran.depnBasis = activeClient.depnBasisFholdProp;
      tran.depnRate = activeClient.depnRateFholdProp;
      transVals.push(activeClient.depnBasisFholdProp);
      transVals.push(activeClient.depnRateFholdProp);
    } else if (tran.assetCategoryNo === 2) {
      tran.depnBasis = activeClient.depnBasisShortLhold;
      tran.depnRate = activeClient.depnRateShortLhold;
      transVals.push(activeClient.depnBasisShortLhold);
      transVals.push(activeClient.depnRateShortLhold);
    } else if (tran.assetCategoryNo === 3) {
      tran.depnBasis = activeClient.depnBasisLongLhold;
      tran.depnRate = activeClient.depnRateLongLhold;
      transVals.push(activeClient.depnBasisLongLhold);
      transVals.push(activeClient.depnRateLongLhold);
    } else if (tran.assetCategoryNo === 4) {
      tran.depnBasis = activeClient.depnBasisImprovements;
      tran.depnRate = activeClient.depnRateImprovements;
      transVals.push(activeClient.depnBasisImprovements);
      transVals.push(activeClient.depnRateImprovements);
    } else if (tran.assetCategoryNo === 5) {
      tran.depnBasis = activeClient.depnBasisPlantMachinery;
      tran.depnRate = activeClient.depnRatePlantMachinery;
      transVals.push(activeClient.depnBasisPlantMachinery);
      transVals.push(activeClient.depnRatePlantMachinery);
    } else if (tran.assetCategoryNo === 6) {
      tran.depnBasis = activeClient.depnBasisFixFittings;
      tran.depnRate = activeClient.depnRateFixFittings;
      transVals.push(activeClient.depnBasisFixFittings);
      transVals.push(activeClient.depnRateFixFittings);
    } else if (tran.assetCategoryNo === 7) {
      tran.depnBasis = activeClient.depnBasisMotorVehicles;
      tran.depnRate = activeClient.depnRateMotorVehicles;
      transVals.push(activeClient.depnBasisMotorVehicles);
      transVals.push(activeClient.depnRateMotorVehicles);
    } else if (tran.assetCategoryNo === 8) {
      tran.depnBasis = activeClient.depnBasisCompEquip;
      tran.depnRate = activeClient.depnRateCompEquip;
      transVals.push(activeClient.depnBasisCompEquip);
      transVals.push(activeClient.depnRateCompEquip);
    } else if (tran.assetCategoryNo === 9) {
      tran.depnBasis = activeClient.depnBasisOfficeEquip;
      tran.depnRate = activeClient.depnRateOfficeEquip;
      transVals.push(activeClient.depnBasisOfficeEquip);
      transVals.push(activeClient.depnRateOfficeEquip);
    }
  } else if (registerType === "IP") {
    if (tran.assetCategoryNo === 1) {
      transVals.push(activeClient.depnBasisIPOwned);
      transVals.push(activeClient.depnRateIPOwned);
      tran.depnBasis = activeClient.depnBasisIPOwned;
      tran.depnRate = activeClient.depnRateIPOwned;
    } else if (tran.assetCategoryNo === 2) {
      transVals.push(activeClient.depnBasisIPLeased);
      transVals.push(activeClient.depnRateIPLeased);
      tran.depnBasis = activeClient.depnBasisIPLeased;
      tran.depnRate = activeClient.depnRateIPLeased;
    }
  }
};

export function calculateCharge(session: Session, tran, registerType) {
  const periodEnd = session.activeAssignment.reportingPeriod.reportingDateOrig;
  const daysHeld = calculateDiffInDays(tran.transactionDate, periodEnd) + 1;
  console.log(tran);
  console.log(daysHeld);
  const daysInPeriod = session.activeAssignment.reportingPeriod.noOfDays;
  const rate = tran.amortRate ? tran.amortRate : tran.depnRate;
  const charge = Math.round(tran.value * (parseInt(rate) / 100) * (daysHeld / daysInPeriod));
  console.log(charge);
  let amortOrDepn;
  if (registerType === "IFA") {
    amortOrDepn = "Amort";
    tran.amortChg = charge;
  } else {
    amortOrDepn = "Depn";
    tran.depnChg = charge;
  }
  const subCatCode = registerType === "IP" ? 12 : 11;
  tran.assetSubCatCodes.push(subCatCode);
  const subTran = {
    assetSubCatCode: subCatCode,
    assetSubCategory: `${amortOrDepn} chg`,
    regColNameOne: `${amortOrDepn}`,
    regColNameTwo: "Charge",
    value: charge,
  };
  tran.subTransactions.push(subTran);
  const jnls = buildAutoDepnJnls(session, tran, registerType);
  session.activeJournal.journals.push(jnls.debit);
  session.activeJournal.netValue += jnls["debit"]["value"];
  session.activeJournal.journals.push(jnls.credit);
  session.activeJournal.netValue += jnls["credit"]["value"];
}

export const recalculateCharge = async (
  context: Excel.RequestContext,
  session: Session,
  sheet: EditableWorksheet,
  tran: FATransaction,
  e: Excel.WorksheetChangedEventArgs | QuasiEventObject
) => {
  let registerType;
  let amortOrDepn;
  let amortOrDepnUpper;
  let subCatCode = 11;
  if (sheet.type === "IFARPreview") {
    registerType = "IFA";
    amortOrDepn = "amort";
    amortOrDepnUpper = "Amort";
  } else if (sheet.type === "TFARPreview") {
    registerType = "TFA";
    amortOrDepn = "depn";
    amortOrDepnUpper = "Depn";
  } else if (sheet.type === "IPRPreview") {
    registerType = "IP";
    amortOrDepn = "depn";
    amortOrDepnUpper = "Depn";
    subCatCode = 12;
  }
  const newValue = e.details.valueAfter;
  const mongoDate = convertExcelDate(e.details.valueAfter);
  const periodEnd = session.activeAssignment.reportingPeriod.reportingDateOrig;
  const daysHeld = calculateDiffInDays(mongoDate, periodEnd) + 1;
  const daysInPeriod = session.activeAssignment.reportingPeriod.noOfDays;
  const depnRate = tran.depnRate ? tran.depnRate : tran.amortRate;
  const charge = Math.round(tran.value * (parseInt(depnRate) / 100) * (daysHeld / daysInPeriod));
  let depnChgColNumber;
  sheet.definedCols.forEach((col) => {
    if (col.type === "depnCharge") depnChgColNumber = col.colNumber;
  });
  const colLetter = colNumToLetter(depnChgColNumber);
  const rowNumber = getTransRowNumber(tran, sheet);
  const range = `${colLetter}${rowNumber}:${colLetter}${rowNumber}`;
  setExcelRangeValue(context, sheet.name, range, charge / 100);
  session[`${registerType}Transactions`].forEach((i) => {
    if (i._id === tran._id) {
      i[`${amortOrDepn}Chg`] = charge;
      i.transactionDateExcel = newValue;
      i.subTransactions.forEach((subTran) => {
        if (subTran.assetSubCatCode === subCatCode && subTran.assetSubCategory === `${amortOrDepnUpper} chg`) {
          subTran.value = charge;
        }
      });
    }
  });
  adjustAutoDepnJnls(session, tran, charge);
};

export const updateAssetNarrative = async (session: Session, sheet, tran, e) => {
  let registerType;
  if (sheet.type === "IFARPreview") {
    registerType = "IFA";
  } else if (sheet.type === "TFARPreview") {
    registerType = "TFA";
  } else if (sheet.type === "IPRPreview") {
    registerType = "IP";
  }
  session[`${registerType}Transactions`].forEach((i) => {
    if (i._id === tran._id) {
      i.assetNarrative = e.details.valueAfter;
    }
  });
};

export const buildAutoDepnJnls = (session: Session, tran, registerType) => {
  const catNo = tran.assetCategoryNo;
  let amortOrDepn;
  let jnls;
  if (registerType === "IFA") {
    jnls = setAutoAmortNominals(catNo);
    amortOrDepn = "Amortisation";
  } else if (registerType === "TFA") {
    jnls = setAutoDepnNominals(catNo);
    amortOrDepn = "Depreciation";
  } else if (registerType === "IP") {
    jnls = setAutoDepnIPNominals(catNo);
  }
  session.chart.forEach((nom) => {
    if (nom.cerysCode === jnls.debit) jnls.debit = nom;
    if (nom.cerysCode === jnls.credit) jnls.credit = nom;
  });
  jnls.debit["transactionId"] = tran._id;
  jnls.credit["transactionId"] = tran._id;
  jnls.debit["value"] = tran.amortChg ? tran.amortChg : tran.depnChg;
  jnls.credit["value"] = tran.amortChg ? tran.amortChg * -1 : tran.depnChg * -1;
  jnls.debit["transactionDate"] = session.activeAssignment.reportingPeriod.reportingDateOrig;
  jnls.credit["transactionDate"] = session.activeAssignment.reportingPeriod.reportingDateOrig;
  jnls.debit["narrative"] = `${amortOrDepn} charged automatically`;
  jnls.debit["narrative"] = `${amortOrDepn} charged automatically`;
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

export const setAutoDepnIPNominals = (catNo) => {
  switch (catNo) {
    case 1:
      return { debit: 3974, credit: 5712 };
    case 2:
      return { debit: 3974, credit: 5732 };
    default:
      return { debit: 3974, credit: 5012 };
  }
};

export const adjustAutoDepnJnls = (session: Session, tran, charge) => {
  session.activeJournal.journals.forEach((jnl) => {
    if (jnl.transactionId === tran._id) {
      if (jnl.value > 0) jnl.value = charge;
      if (jnl.value < 0) jnl.value = charge * -1;
    }
  });
};

export const createTransactionUpdates = (session: Session, bFTransLikelyAddns) => {
  bFTransLikelyAddns.forEach((tran) => {
    if (tran._id) {
      //const newValue = tran.cerysCode + 1;
      //const update = createNewTransactionUpdate(session, tran, newValue, "sheet", "updatedCode"); // Issue: this code is fudged, needs to be looked at... see code commented out below
      //session.chart.forEach((code) => {
      //  if (code.cerysCode === newValue) {
      //      update.cerysCodeObject = code;
      //  }
      //});
      //if (!tran.cerysCodeObject) tran.cerysCodeObject = session.chart.find(code => code.cerysCode = update.value)
      //newArray.push(newUpdate);
      //console.log(update);
    } else {
      const chart = session.chart;
      let drJnl;
      let crJnl;
      for (let i = 0; i < chart.length; i++) {
        if (chart[i].cerysCode === tran.cerysCode + 1) {
          drJnl = { cerysCodeObj: chart[i] };
          drJnl.value = tran.value;
          drJnl.transactionDate = tran.transactionDate;
          drJnl.journal = false;
          drJnl.clientTB = false;
          drJnl.transactionType = "autoAddition";
          drJnl.narrative = `${tran.assetNarrative} reanalysed as addition`;
          drJnl.assetNarrative = tran.assetNarrative;
          drJnl.clientNominalCode = tran.clientNominalCode;
          drJnl.clientNominalName = tran.clientNominalName;
          session.activeJournal.journals.push(drJnl);
        }
        if (chart[i].cerysCode === tran.cerysCode) {
          crJnl = { cerysCodeObj: chart[i] };
          crJnl.value = tran.value * -1;
          crJnl.transactionDate = tran.transactionDate;
          crJnl.journal = false;
          crJnl.clientTB = false;
          crJnl.transactionType = "autoAddition";
          crJnl.narrative = `${tran.assetNarrative} reanalysed as addition`;
          session.activeJournal.journals.push(crJnl);
        }
      }
    }
  });
  if (session.activeJournal.journals.length > 0) {
    session.activeJournal.journal = false;
    session.activeJournal.journalType = "autoAddition";
  }
  console.log(session.activeJournal);
};

//export async function createIFAR(session) {
//  try {
//    await Excel.run(async (context) => {
//      const assignment = await postIFAtoDB(session);
//      session.activeAssignment = assignment;
//      createIFARWs(context, session);
//    });
//  } catch (e) {
//    console.error(e);
//  }
//}

//export async function postIFAtoDB(session) {
//  const options = fetchOptionsIFA(session);
//  const updatedAssignmentDb = await fetch(postIFA, options);
//  const updatedAssignment = await updatedAssignmentDb.json();
//  return updatedAssignment;
//}

export const createCurrentPeriodRegister = (regsiter, session: Session) => {
  const periodId = session.activeAssignment.reportingPeriod._id;
  const currentPeriodRegister = [];
  console.log(regsiter);
  regsiter.assets.forEach((asset) => {
    if (asset.activePeriods.includes(periodId)) {
      const { periods, activePeriods, ...obj } = asset;
      let subTransactions;
      asset.periods.forEach((period) => {
        if (period.reportingPeriodId === periodId) subTransactions = period.subTransactions;
      });
      obj.subTransactions = subTransactions;
      currentPeriodRegister.push(obj);
    }
  });
  console.log(currentPeriodRegister);
  return currentPeriodRegister;
};

export const finaliseAssetObjects = (session: Session, registerType) => {
  const reportingPeriod = session.activeAssignment.reportingPeriod;
  const assets = session[`${registerType}Transactions`];
  assets.forEach((asset) => {
    asset.activePeriods = [reportingPeriod._id];
    asset.periods = [
      {
        reportingPeriodNumber: reportingPeriod.periodNumber,
        reportingPeriodId: reportingPeriod._id,
        subTransactions: asset.subTransactions,
      },
    ];
  });
  console.log(session[`${registerType}Transactions`]);
};
