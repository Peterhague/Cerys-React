import { Client } from "../../classes/client";
import { EditableWorksheet } from "../../classes/editable-worksheet";
import { ActiveJournal, Journal } from "../../classes/journal";
import { QuasiEventObject } from "../../classes/quasi-event-object";
import { Session } from "../../classes/session";
import { AssetTransaction, Transaction } from "../../classes/transaction";
import { AssetSubTransaction, FATransaction, JournalDetailsProps } from "../../interfaces/interfaces";
import { colNumToLetter } from "../excel-col-conversion";
import { calculateDiffInDays, convertExcelDate, getTransRowNumber } from "../helper-functions";
import { setExcelRangeValue } from "../worksheet";
import { AssetRegisterPromptDetails } from "../../classes/asset-register";
/*global Excel */

export const checkTransUnregisteredAssets = (session: Session) => {
  const registersToPrompt = session.assignment.getRegisterPrompts(session);
  const mapped = registersToPrompt.map((reg) => new AssetRegisterPromptDetails(session, reg));
  return mapped;
};

export const populateDepnCols = (
  session: Session,
  activeClient: Client,
  transVals: (string | number)[],
  transaction: AssetTransaction,
  registerType: string
) => {
  const cerysCodeObj = transaction.getCerysCodeObj(session);
  if (registerType === "IFA") {
    if (cerysCodeObj.assetCategoryNo === 1) {
      transVals.push(activeClient.amortBasisGwill);
      transVals.push(activeClient.amortRateGwill);
      transaction.amortBasis = activeClient.amortBasisGwill;
      transaction.amortRate = activeClient.amortRateGwill;
    } else if (cerysCodeObj.assetCategoryNo === 2) {
      transVals.push(activeClient.amortBasisPatsLics);
      transVals.push(activeClient.amortRatePatsLics);
      transaction.amortBasis = activeClient.amortBasisPatsLics;
      transaction.amortRate = activeClient.amortRatePatsLics;
    } else if (cerysCodeObj.assetCategoryNo === 3) {
      transVals.push(activeClient.amortBasisDevCosts);
      transVals.push(activeClient.amortRateDevCosts);
      transaction.amortBasis = activeClient.amortBasisDevCosts;
      transaction.amortRate = activeClient.amortRateDevCosts;
    } else if (cerysCodeObj.assetCategoryNo === 4) {
      transVals.push(activeClient.amortBasisCompSware);
      transVals.push(activeClient.amortRateCompSware);
      transaction.amortBasis = activeClient.amortBasisCompSware;
      transaction.amortRate = activeClient.amortRateCompSware;
    }
  } else if (registerType === "TFA") {
    if (cerysCodeObj.assetCategoryNo === 1) {
      transaction.depnBasis = activeClient.depnBasisFholdProp;
      transaction.depnRate = activeClient.depnRateFholdProp;
      transVals.push(activeClient.depnBasisFholdProp);
      transVals.push(activeClient.depnRateFholdProp);
    } else if (cerysCodeObj.assetCategoryNo === 2) {
      transaction.depnBasis = activeClient.depnBasisShortLhold;
      transaction.depnRate = activeClient.depnRateShortLhold;
      transVals.push(activeClient.depnBasisShortLhold);
      transVals.push(activeClient.depnRateShortLhold);
    } else if (cerysCodeObj.assetCategoryNo === 3) {
      transaction.depnBasis = activeClient.depnBasisLongLhold;
      transaction.depnRate = activeClient.depnRateLongLhold;
      transVals.push(activeClient.depnBasisLongLhold);
      transVals.push(activeClient.depnRateLongLhold);
    } else if (cerysCodeObj.assetCategoryNo === 4) {
      transaction.depnBasis = activeClient.depnBasisImprovements;
      transaction.depnRate = activeClient.depnRateImprovements;
      transVals.push(activeClient.depnBasisImprovements);
      transVals.push(activeClient.depnRateImprovements);
    } else if (cerysCodeObj.assetCategoryNo === 5) {
      transaction.depnBasis = activeClient.depnBasisPlantMachinery;
      transaction.depnRate = activeClient.depnRatePlantMachinery;
      transVals.push(activeClient.depnBasisPlantMachinery);
      transVals.push(activeClient.depnRatePlantMachinery);
    } else if (cerysCodeObj.assetCategoryNo === 6) {
      transaction.depnBasis = activeClient.depnBasisFixFittings;
      transaction.depnRate = activeClient.depnRateFixFittings;
      transVals.push(activeClient.depnBasisFixFittings);
      transVals.push(activeClient.depnRateFixFittings);
    } else if (cerysCodeObj.assetCategoryNo === 7) {
      transaction.depnBasis = activeClient.depnBasisMotorVehicles;
      transaction.depnRate = activeClient.depnRateMotorVehicles;
      transVals.push(activeClient.depnBasisMotorVehicles);
      transVals.push(activeClient.depnRateMotorVehicles);
    } else if (cerysCodeObj.assetCategoryNo === 8) {
      transaction.depnBasis = activeClient.depnBasisCompEquip;
      transaction.depnRate = activeClient.depnRateCompEquip;
      transVals.push(activeClient.depnBasisCompEquip);
      transVals.push(activeClient.depnRateCompEquip);
    } else if (cerysCodeObj.assetCategoryNo === 9) {
      transaction.depnBasis = activeClient.depnBasisOfficeEquip;
      transaction.depnRate = activeClient.depnRateOfficeEquip;
      transVals.push(activeClient.depnBasisOfficeEquip);
      transVals.push(activeClient.depnRateOfficeEquip);
    }
  } else if (registerType === "IP") {
    if (cerysCodeObj.assetCategoryNo === 1) {
      transVals.push(activeClient.depnBasisIPOwned);
      transVals.push(activeClient.depnRateIPOwned);
      transaction.depnBasis = activeClient.depnBasisIPOwned;
      transaction.depnRate = activeClient.depnRateIPOwned;
    } else if (cerysCodeObj.assetCategoryNo === 2) {
      transVals.push(activeClient.depnBasisIPLeased);
      transVals.push(activeClient.depnRateIPLeased);
      transaction.depnBasis = activeClient.depnBasisIPLeased;
      transaction.depnRate = activeClient.depnRateIPLeased;
    }
  }
};

export function calculateCharge(session: Session, transaction: AssetTransaction, registerType: string) {
  const periodEnd = session.assignment.reportingPeriod.reportingDateOrig;
  const daysHeld = calculateDiffInDays(transaction.transactionDate, periodEnd) + 1;
  const daysInPeriod = session.assignment.reportingPeriod.noOfDays;
  const rate = transaction.amortRate ? transaction.amortRate : transaction.depnRate;
  const charge = Math.round(transaction.value * (parseInt(rate) / 100) * (daysHeld / daysInPeriod));
  let amortOrDepn: string;
  if (registerType === "IFA") {
    amortOrDepn = "Amort";
    transaction.amortChg = charge;
  } else {
    amortOrDepn = "Depn";
    transaction.depnChg = charge;
  }
  const subCatCode = registerType === "IP" ? 12 : 11;
  transaction.assetSubCatCodes.push(subCatCode);
  const subTran: AssetSubTransaction = {
    assetSubCatCode: subCatCode,
    assetSubCategory: `${amortOrDepn} chg`,
    regColNameOne: `${amortOrDepn}`,
    regColNameTwo: "Charge",
    value: charge,
  };
  transaction.subTransactions.push(subTran);
  const journals: Journal[] = [];
  const jnls = buildAutoDepnJnls(session, transaction, registerType);
  journals.push(new Journal(session, jnls.debit));
  journals.push(new Journal(session, jnls.credit));
  return journals;
}

export const recalculateCharge = async (
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
    if (col.type === "depnCharge") depnChgColNumber = sheet.getCurrentColumn(col.colNumberOrig);
  });
  const colLetter = colNumToLetter(depnChgColNumber);
  const rowNumber = getTransRowNumber(tran, sheet);
  const range = `${colLetter}${rowNumber}:${colLetter}${rowNumber}`;
  await setExcelRangeValue(sheet.name, range, charge / 100);
  session[`${registerType}Transactions`].forEach((i) => {
    if (i._id === tran.cerysTransactionId) {
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

export const updateAssetNarrative = async (
  session: Session,
  sheet: EditableWorksheet,
  tran: Transaction | FATransaction,
  e: Excel.WorksheetChangedEventArgs | QuasiEventObject
) => {
  let registerType;
  if (sheet.type === "IFARPreview") {
    registerType = "IFA";
  } else if (sheet.type === "TFARPreview") {
    registerType = "TFA";
  } else if (sheet.type === "IPRPreview") {
    registerType = "IP";
  }
  session[`${registerType}Transactions`].forEach((i) => {
    if (i._id === tran.cerysTransactionId) {
      i.assetNarrative = e.details.valueAfter;
    }
  });
};

export const buildAutoDepnJnls = (session: Session, transaction: AssetTransaction, registerType: string) => {
  const cerysCodeObj = transaction.getCerysCodeObj(session);
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
  const transactionType = "auto-depreciation";
  const debit: JournalDetailsProps = {
    cerysCode: jnls.debit,
    value: transaction.amortChg ? transaction.amortChg : transaction.depnChg,
    narrative,
    transactionDate,
    transactionType,
  };
  const credit: JournalDetailsProps = {
    cerysCode: jnls.credit,
    value: transaction.amortChg ? transaction.amortChg * -1 : transaction.depnChg * -1,
    narrative,
    transactionDate,
    transactionType,
  };
  return { debit, credit };
};

export const setAutoAmortNominals = (catNo: number) => {
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

export const setAutoDepnNominals = (catNo: number) => {
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

export const setAutoDepnIPNominals = (catNo: number) => {
  switch (catNo) {
    case 1:
      return { debit: 3974, credit: 5712 };
    case 2:
      return { debit: 3974, credit: 5732 };
    default:
      return { debit: 3974, credit: 5012 };
  }
};

export const adjustAutoDepnJnls = (session: Session, tran: FATransaction, charge: number) => {
  console.log(session);
  console.log(tran);
  console.log(charge);
  //trouble - need to reinstate or replace at some point
  // session.activeJournal.journals.forEach((jnl) => {
  //   if (jnl.transactionId === tran._id) {
  //     if (jnl.value > 0) jnl.value = charge;
  //     if (jnl.value < 0) jnl.value = charge * -1;
  //   }
  // });
};

export const createTransactionUpdates = (session: Session, bFTransLikelyAddns: AssetTransaction[]) => {
  const journals: Journal[] = [];
  bFTransLikelyAddns.forEach((tran) => {
    const chart = session.chart;
    for (let i = 0; i < chart.length; i++) {
      if (chart[i].cerysCode === tran.cerysCode + 1) {
        const drJnl: JournalDetailsProps = {
          cerysCode: chart[i].cerysCode,
          value: tran.value,
          transactionDate: tran.transactionDate,
          transactionType: "auto-addition",
          narrative: `${tran.assetNarrative} reanalysed as addition`,
          representsBalanceOfClientCode: tran.representsBalanceOfClientCode,
        };
        drJnl.value = tran.value;
        drJnl.transactionDate = tran.transactionDate;
        drJnl.transactionType = "auto-addition";
        drJnl.narrative = `${tran.assetNarrative} reanalysed as addition`;
        drJnl.representsBalanceOfClientCode = tran.representsBalanceOfClientCode;
        journals.push(new Journal(session, drJnl));
      }
      if (chart[i].cerysCode === tran.cerysCode) {
        const crJnl: JournalDetailsProps = {
          cerysCode: chart[i].cerysCode,
          value: tran.value * -1,
          transactionDate: tran.transactionDate,
          transactionType: "auto-addition",
          narrative: `${tran.assetNarrative} reanalysed as addition`,
          representsBalanceOfClientCode: tran.representsBalanceOfClientCode,
        };
        journals.push(new Journal(session, crJnl));
      }
    }
  });
  return new ActiveJournal({ type: "auto-addition", journals });
};
