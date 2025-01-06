import { createEditableWorksheet, EditableWorksheet } from "../../classes/editable-worksheet";
import { Journal } from "../../classes/journal";
import { Session } from "../../classes/session";
import { AssetTransaction, Transaction } from "../../classes/transaction";
import { TransactionMap } from "../../classes/transaction-map";
import {
  AssetSubTransaction,
  BaseCerysCodeObject,
  Client,
  FATransaction,
  JournalDetailsProps,
  QuasiEventObject,
} from "../../interfaces/interfaces";
import { colNumToLetter } from "../excel-col-conversion";
import { accessExcelContext, calculateDiffInDays, convertExcelDate, getTransRowNumber } from "../helperFunctions";
import { addOneWorksheet, deleteManyWorksheets, setExcelRangeValue } from "../worksheet";
import _ from "lodash";
/*global Excel */

export const identifyLikelyAdditions = async (session: Session, registerType: string, setView) => {
  console.log("next step working");
  const bFTransLikelyAddns: Transaction[] = session.assignment.getBFTransLikelyAdditions(session, registerType);
  console.log(bFTransLikelyAddns);
  if (bFTransLikelyAddns.length > 0) {
    await createLikelyAdditionsSumm(session, bFTransLikelyAddns, registerType);
    setView("confirmBFAreAddns");
    createTransactionUpdates(session, bFTransLikelyAddns);
  } else {
    previewRelTrans(session, registerType, setView);
  }
};

export const previewRelTrans = (session: Session, registerType: string, setView) => {
  accessExcelContext(deleteManyWorksheets, [[`${registerType} Possible Additions`]]);
  createRelTrans(session, registerType);
  setView("confirm");
  session.options[`${registerType}RCreationSetting`] = "confirm";
};

export async function createRelTrans(session: Session, registerType: string) {
  const relevantTrans: AssetTransaction[] = [];
  session.assignment.transactions.forEach((tran) => {
    const cerysCodeObj = tran.getCerysCodeObj(session);
    if (
      (registerType === "IFA" &&
        cerysCodeObj.cerysCategory === "Intangible assets" &&
        cerysCodeObj.assetCodeType === "iFACostAddns") ||
      (registerType === "TFA" &&
        cerysCodeObj.cerysCategory === "Tangible assets" &&
        cerysCodeObj.assetCodeType === "tFACostAddns") ||
      (registerType === "IP" &&
        cerysCodeObj.cerysCategory === "Investment property" &&
        cerysCodeObj.assetCodeType === "iPCostAddns")
    ) {
      relevantTrans.push(new AssetTransaction(session, tran));
      tran.processedAsAsset = true;
    }
  });
  createTransSumm(session, relevantTrans, registerType);
  console.log(relevantTrans);
}

export const convertNewFATrans = (session: Session) => {
  const updatedTrans = [];
  session.assignment.transactions.forEach((tran) => {
    const cerysCodeObj = tran.getCerysCodeObj(session);
    const clientNL = session.assignment.clientNL;
    for (let i = 0; i < clientNL.length; i++) {
      if (clientNL[i].code === tran.clientNominalCode) {
        const trans = { ...tran };
        delete trans._id;
        trans["transactionDate"] = convertExcelDate(clientNL[i].date);
        trans["assetSubCatCodes"] = [trans["assetSubCatCode"]];
        trans["subTransactions"] = [
          {
            assetSubCategory: cerysCodeObj.assetSubCategory,
            assetSubCatCode: cerysCodeObj.assetSubCatCode,
            regColNameOne: cerysCodeObj.regColNameOne,
            regColNameTwo: cerysCodeObj.regColNameTwo,
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
};

export async function createTransSumm(session: Session, relevantTrans: AssetTransaction[], registerType: string) {
  try {
    await Excel.run(async (context) => {
      const sheetMapping = [];
      const name = `${registerType} Transactions`;
      const { ws } = await addOneWorksheet(context, session, { name, addListeners: undefined });
      const activeClient: Client = session.customer.clients.find(
        (client) => client._id === session.assignment.clientId
      );
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
      relevantTrans.forEach((tran) => {
        //i.rowNumber = session[`${registerType}Transactions`].length + 3;
        //i.assetNarrative = i.narrative;
        const map = new TransactionMap(tran._id, session[`${registerType}Transactions`].length + 3); // Issue: is this right?? don't think so...
        sheetMapping.push(map);
      });
      //const transMap = relevantTrans.map(tran => session.assignment.transactions.find(item => item._id === tran._id));
      relevantTrans.forEach((assetTran) => {
        const transaction = assetTran.getTransaction(session);
        const cerysCodeObj = transaction.getCerysCodeObj(session);
        const transVals = [];
        transVals.push(transaction.transactionNumber);
        if (transaction.transactionDate) {
          const dateString =
            typeof transaction.transactionDate === "string" && transaction.transactionDate.split("T")[0];
          const dateStringSplit = dateString.split("-");
          const dateConverted = `${dateStringSplit[1]}/${dateStringSplit[2]}/${dateStringSplit[0]}`;
          transVals.push(dateConverted);
          transaction.transactionDateUser = dateConverted;
        } else if (transaction.transactionDateClt) {
          transVals.push(transaction.transactionDateClt);
        } else {
          transVals.push("Not provided");
        }
        transVals.push(transaction.narrative);
        if (transaction.journal) {
          transVals.push("Journal");
        } else if (transaction.finalJournal) {
          transVals.push("Final journal");
        } else if (transaction.reviewJournal) {
          transVals.push("Review journal");
        } else if (transaction.clientTB) {
          transVals.push("Client TB");
        } else if (transaction.clientAdjustment) {
          transVals.push("Client adjustment");
        } else {
          transVals.push("Sticking plaster");
        }
        transVals.push(assetTran.cerysCode);
        transVals.push(cerysCodeObj.cerysShortName);
        if (transaction.clientNominalCode >= 0) {
          transVals.push(transaction.clientNominalCode);
        } else {
          transVals.push("NA");
        }
        if (transaction.clientNominalName) {
          transVals.push(transaction.clientNominalName);
        } else {
          transVals.push("NA");
        }
        if (assetTran.assetNarrative) {
          transVals.push(assetTran.assetNarrative);
        } else {
          transVals.push("NA");
        }
        transVals.push(transaction.value / 100);
        const transDtls = { assetTran, transaction, cerysCodeObj };
        populateDepnCols(activeClient, transVals, transDtls, registerType);
        calculateCharge(session, transDtls, registerType);
        assetTran.amortChg ? transVals.push(assetTran.amortChg / 100) : transVals.push(assetTran.depnChg / 100);
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
      const transactions = _.cloneDeep(session[`${registerType}Transactions`]);
      createEditableWorksheet(session, transactions, ws, valuesToPost, "FATransactions", sheetMapping);
      await context.sync();
      ws.activate();
    });
  } catch (e) {
    console.error(e);
  }
}

export async function createLikelyAdditionsSumm(session: Session, transactions: Transaction[], registerType: string) {
  try {
    await Excel.run(async (context) => {
      const name = `${registerType} Possible Additions`;
      const { ws } = await addOneWorksheet(context, session, { name, addListeners: undefined });
      const valuesToPost = [
        ["TRANSACTION", "CERYS", "CERYS", "POSTING", "CERYS", "CERYS", "CLIENT", "CLIENT", "CLIENT", "DEBIT/"],
        ["NUMBER", "DATE", "NARRATIVE", "SOURCE", "CODE", "NOMINAL", "NC", "NOMINAL", "NARRATIVE", "(CREDIT)"],
      ];
      transactions.forEach((transaction) => {
        const assetTran = new AssetTransaction(session, transaction);
        const cerysCodeObj = transaction.getCerysCodeObj(session);
        const transVals = [];
        transVals.push(transaction.transactionNumber);
        if (transaction.transactionDate) {
          const dateString =
            typeof transaction.transactionDate === "string" && transaction.transactionDate.split("T")[0];
          const dateStringSplit = dateString.split("-");
          const dateConverted: string = `${dateStringSplit[1]}/${dateStringSplit[2]}/${dateStringSplit[0]}`;
          transVals.push(dateConverted);
          transaction.transactionDateUser = dateConverted;
        } else if (transaction.transactionDateClt) {
          transVals.push(transaction.transactionDateClt);
        } else {
          transVals.push("Not provided");
        }
        transVals.push(transaction.narrative);
        if (transaction.journal) {
          transVals.push("Journal");
        } else if (transaction.finalJournal) {
          transVals.push("Final journal");
        } else if (transaction.reviewJournal) {
          transVals.push("Review journal");
        } else if (transaction.clientTB) {
          transVals.push("Client TB");
        } else if (transaction.clientAdjustment) {
          transVals.push("Client adjustment");
        }
        transVals.push(transaction.cerysCode);
        transVals.push(cerysCodeObj.cerysShortName);
        if (transaction.clientNominalCode >= 0) {
          transVals.push(transaction.clientNominalCode);
        } else {
          transVals.push("NA");
        }
        if (transaction.clientNominalName) {
          transVals.push(transaction.clientNominalName);
        } else {
          transVals.push("NA");
        }
        if (assetTran.assetNarrative) {
          transVals.push(assetTran.assetNarrative);
        } else {
          transVals.push("NA");
        }
        transVals.push(transaction.value / 100);
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

export const populateDepnCols = (
  activeClient: Client,
  transVals: string[],
  transactionDetails: { assetTran: AssetTransaction; transaction: Transaction; cerysCodeObj: BaseCerysCodeObject },
  registerType: string
) => {
  const { assetTran, cerysCodeObj } = transactionDetails;
  if (registerType === "IFA") {
    if (cerysCodeObj.assetCategoryNo === 1) {
      transVals.push(activeClient.amortBasisGwill);
      transVals.push(activeClient.amortRateGwill);
      assetTran.amortBasis = activeClient.amortBasisGwill;
      assetTran.amortRate = activeClient.amortRateGwill;
    } else if (cerysCodeObj.assetCategoryNo === 2) {
      transVals.push(activeClient.amortBasisPatsLics);
      transVals.push(activeClient.amortRatePatsLics);
      assetTran.amortBasis = activeClient.amortBasisPatsLics;
      assetTran.amortRate = activeClient.amortRatePatsLics;
    } else if (cerysCodeObj.assetCategoryNo === 3) {
      transVals.push(activeClient.amortBasisDevCosts);
      transVals.push(activeClient.amortRateDevCosts);
      assetTran.amortBasis = activeClient.amortBasisDevCosts;
      assetTran.amortRate = activeClient.amortRateDevCosts;
    } else if (cerysCodeObj.assetCategoryNo === 4) {
      transVals.push(activeClient.amortBasisCompSware);
      transVals.push(activeClient.amortRateCompSware);
      assetTran.amortBasis = activeClient.amortBasisCompSware;
      assetTran.amortRate = activeClient.amortRateCompSware;
    }
  } else if (registerType === "TFA") {
    if (cerysCodeObj.assetCategoryNo === 1) {
      assetTran.depnBasis = activeClient.depnBasisFholdProp;
      assetTran.depnRate = activeClient.depnRateFholdProp;
      transVals.push(activeClient.depnBasisFholdProp);
      transVals.push(activeClient.depnRateFholdProp);
    } else if (cerysCodeObj.assetCategoryNo === 2) {
      assetTran.depnBasis = activeClient.depnBasisShortLhold;
      assetTran.depnRate = activeClient.depnRateShortLhold;
      transVals.push(activeClient.depnBasisShortLhold);
      transVals.push(activeClient.depnRateShortLhold);
    } else if (cerysCodeObj.assetCategoryNo === 3) {
      assetTran.depnBasis = activeClient.depnBasisLongLhold;
      assetTran.depnRate = activeClient.depnRateLongLhold;
      transVals.push(activeClient.depnBasisLongLhold);
      transVals.push(activeClient.depnRateLongLhold);
    } else if (cerysCodeObj.assetCategoryNo === 4) {
      assetTran.depnBasis = activeClient.depnBasisImprovements;
      assetTran.depnRate = activeClient.depnRateImprovements;
      transVals.push(activeClient.depnBasisImprovements);
      transVals.push(activeClient.depnRateImprovements);
    } else if (cerysCodeObj.assetCategoryNo === 5) {
      assetTran.depnBasis = activeClient.depnBasisPlantMachinery;
      assetTran.depnRate = activeClient.depnRatePlantMachinery;
      transVals.push(activeClient.depnBasisPlantMachinery);
      transVals.push(activeClient.depnRatePlantMachinery);
    } else if (cerysCodeObj.assetCategoryNo === 6) {
      assetTran.depnBasis = activeClient.depnBasisFixFittings;
      assetTran.depnRate = activeClient.depnRateFixFittings;
      transVals.push(activeClient.depnBasisFixFittings);
      transVals.push(activeClient.depnRateFixFittings);
    } else if (cerysCodeObj.assetCategoryNo === 7) {
      assetTran.depnBasis = activeClient.depnBasisMotorVehicles;
      assetTran.depnRate = activeClient.depnRateMotorVehicles;
      transVals.push(activeClient.depnBasisMotorVehicles);
      transVals.push(activeClient.depnRateMotorVehicles);
    } else if (cerysCodeObj.assetCategoryNo === 8) {
      assetTran.depnBasis = activeClient.depnBasisCompEquip;
      assetTran.depnRate = activeClient.depnRateCompEquip;
      transVals.push(activeClient.depnBasisCompEquip);
      transVals.push(activeClient.depnRateCompEquip);
    } else if (cerysCodeObj.assetCategoryNo === 9) {
      assetTran.depnBasis = activeClient.depnBasisOfficeEquip;
      assetTran.depnRate = activeClient.depnRateOfficeEquip;
      transVals.push(activeClient.depnBasisOfficeEquip);
      transVals.push(activeClient.depnRateOfficeEquip);
    }
  } else if (registerType === "IP") {
    if (cerysCodeObj.assetCategoryNo === 1) {
      transVals.push(activeClient.depnBasisIPOwned);
      transVals.push(activeClient.depnRateIPOwned);
      assetTran.depnBasis = activeClient.depnBasisIPOwned;
      assetTran.depnRate = activeClient.depnRateIPOwned;
    } else if (cerysCodeObj.assetCategoryNo === 2) {
      transVals.push(activeClient.depnBasisIPLeased);
      transVals.push(activeClient.depnRateIPLeased);
      assetTran.depnBasis = activeClient.depnBasisIPLeased;
      assetTran.depnRate = activeClient.depnRateIPLeased;
    }
  }
};

export function calculateCharge(
  session: Session,
  transactionDetails: { assetTran: AssetTransaction; transaction: Transaction; cerysCodeObj: BaseCerysCodeObject },
  registerType: string
) {
  const { assetTran, transaction } = transactionDetails;
  const periodEnd = session.assignment.reportingPeriod.reportingDateOrig;
  const daysHeld = calculateDiffInDays(transaction.transactionDate, periodEnd) + 1;
  const daysInPeriod = session.assignment.reportingPeriod.noOfDays;
  const rate = assetTran.amortRate ? assetTran.amortRate : assetTran.depnRate;
  const charge = Math.round(transaction.value * (parseInt(rate) / 100) * (daysHeld / daysInPeriod));
  console.log(charge);
  let amortOrDepn: string;
  if (registerType === "IFA") {
    amortOrDepn = "Amort";
    assetTran.amortChg = charge;
  } else {
    amortOrDepn = "Depn";
    assetTran.depnChg = charge;
  }
  const subCatCode = registerType === "IP" ? 12 : 11;
  assetTran.assetSubCatCodes.push(subCatCode);
  const subTran: AssetSubTransaction = {
    assetSubCatCode: subCatCode,
    assetSubCategory: `${amortOrDepn} chg`,
    regColNameOne: `${amortOrDepn}`,
    regColNameTwo: "Charge",
    value: charge,
  };
  assetTran.subTransactions.push(subTran);
  const jnls = buildAutoDepnJnls(session, transactionDetails, registerType);
  session.activeJournal.journals.push(new Journal(session, jnls.debit));
  const debitNumberValue = typeof jnls.debit.value === "string" ? parseInt(jnls.debit.value) : jnls.debit.value;
  session.activeJournal.netValue += debitNumberValue;
  session.activeJournal.journals.push(new Journal(session, jnls.credit));
  const creditNumberValue = typeof jnls.credit.value === "string" ? parseInt(jnls.credit.value) : jnls.credit.value;
  session.activeJournal.netValue += creditNumberValue;
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
  const periodEnd = session.assignment.reportingPeriod.reportingDateOrig;
  const daysHeld = calculateDiffInDays(mongoDate, periodEnd) + 1;
  const daysInPeriod = session.assignment.reportingPeriod.noOfDays;
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

export const buildAutoDepnJnls = (
  session: Session,
  transactionDetails: { assetTran: AssetTransaction; transaction: Transaction; cerysCodeObj: BaseCerysCodeObject },
  registerType: string
) => {
  const { assetTran, cerysCodeObj } = transactionDetails;
  const catNo = cerysCodeObj.assetCategoryNo;
  let amortOrDepn: string;
  let jnls: { debit: number; credit: number };
  if (registerType === "IFA") {
    jnls = setAutoAmortNominals(catNo);
    amortOrDepn = "Amortisation";
  } else if (registerType === "TFA") {
    jnls = setAutoDepnNominals(catNo);
    amortOrDepn = "Depreciation";
  } else if (registerType === "IP") {
    jnls = setAutoDepnIPNominals(catNo);
  }
  const narrative = `${amortOrDepn} charged automatically`;
  const transactionDate = session.assignment.reportingPeriod.reportingDateOrig;
  const transactionType = "auto depreciation";
  const debit: JournalDetailsProps = {
    cerysCode: jnls.debit,
    value: assetTran.amortChg ? assetTran.amortChg : assetTran.depnChg,
    narrative,
    transactionDate,
    transactionType,
    clientTB: false,
    journal: false,
  };
  const credit: JournalDetailsProps = {
    cerysCode: jnls.debit,
    value: assetTran.amortChg ? assetTran.amortChg * -1 : assetTran.depnChg * -1,
    narrative,
    transactionDate,
    transactionType,
    clientTB: false,
    journal: false,
  };
  return { debit, credit };
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
//      session.assignment = assignment;
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
  const periodId = session.assignment.reportingPeriod._id;
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
  const reportingPeriod = session.assignment.reportingPeriod;
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
