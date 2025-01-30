import {
  AssetDb,
  AssetRegisterDb,
  AssetSubTransaction,
  DetailedTransaction,
  RegisterType,
} from "../interfaces/interfaces";
import { registerTypes } from "../static-values/register-types";
import { InTrayItem } from "./in-trays/global";
import { Session } from "./session";

export class AssetRegister {
  registerType: "Tangible" | "Intangible" | "Investment property";
  assets: AssetRegisterItem[];
  constructor(
    session: Session,
    register: AssetRegisterDb,
    registerType: "Tangible" | "Intangible" | "Investment property"
  ) {
    const periodId = session.assignment.reportingPeriod._id;
    this.registerType = registerType;
    this.assets = register.assets.map(
      (asset) => asset.activePeriods.includes(periodId) && new AssetRegisterItem(asset, periodId)
    );
  }
}

class AssetRegisterItem {
  transactionDate: string;
  transactionDateUser: string;
  transactionDateClt: number;
  transactionDateExcel: number;
  narrative: string;
  assetNarrative: string;
  assetCategory: string;
  assetCategoryNo: number;
  cerysCategory: string;
  value: number;
  amortBasis?: string;
  amortRate?: string;
  depnBasis?: string;
  depnRate?: string;
  disposedOf: boolean;
  subTransactions: AssetSubTransaction[];
  _id: string;
  constructor(asset: AssetDb, periodId: string) {
    this.transactionDate = asset.transactionDate;
    this.transactionDateUser = asset.transactionDateUser;
    this.transactionDateClt = asset.transactionDateClt;
    this.transactionDateExcel = asset.transactionDateExcel;
    this.narrative = asset.narrative;
    this.assetNarrative = asset.assetNarrative;
    this.assetCategory = asset.assetCategory;
    this.cerysCategory = asset.cerysCategory;
    this.value = asset.value;
    if (asset.amortBasis) this.amortBasis = asset.amortBasis;
    if (asset.amortRate) this.amortRate = asset.amortRate;
    if (asset.depnBasis) this.depnBasis = asset.depnBasis;
    if (asset.depnRate) this.depnRate = asset.depnRate;
    this.disposedOf = asset.disposedOf;
    this.subTransactions = asset.periods.find((period) => period.reportingPeriodId === periodId).subTransactions;
  }
}

export class ActiveSubCategory {
  assetSubCategory: string;
  assetSubCatCode: number;
  regColNameOne: string;
  regColNameTwo: string;
  regCol?: number;
  constructor(subTransaction: AssetSubTransaction) {
    this.assetSubCategory = subTransaction.assetSubCategory;
    this.assetSubCatCode = subTransaction.assetSubCatCode;
    this.regColNameOne = subTransaction.regColNameOne;
    this.regColNameTwo = subTransaction.regColNameTwo;
  }
}

export class ColumnsIndex {
  costCFNum: number;
  costCFLetter: string;
  depnBFNum: number;
  depnBFLetter: string;
  depnCFNum: number;
  depnCFLetter: string;
  nBVCFNum: number;
  nBVCFLetter: string;
  nBVBFNum: number;
  nBVBFLetter: string;
  costTotalEndLetter: string;
  depnTotalEndLetter: string;
  blankCellOneNum: number;
  blankCellOneLetter: string;
  blankCellTwoNum: number;
  blankCellTwoLetter: string;
  colsToTotal: { number: number; letter: string }[];
  constructor() {
    this.costCFNum = 0;
    this.costCFLetter = "";
    this.depnBFNum = 0;
    this.depnBFLetter = "";
    this.depnCFNum = 0;
    this.depnCFLetter = "";
    this.nBVCFNum = 0;
    this.nBVCFLetter = "";
    this.nBVBFNum = 0;
    this.nBVBFLetter = "";
    this.costTotalEndLetter = "";
    this.depnTotalEndLetter = "";
    this.blankCellOneNum = 0;
    this.blankCellOneLetter = "";
    this.blankCellTwoNum = 0;
    this.blankCellTwoLetter = "";
    this.colsToTotal = [{ number: 4, letter: "D" }];
  }
}

export class RegisterCreationTemplate {
  registerType: "IFA" | "TFA" | "IP";
  register: RegisterType;
  transactions: DetailedTransaction[];
  constructor(session: Session, registerType: "IFA" | "TFA" | "IP") {
    this.registerType = registerType;
    this.register = registerTypes[registerType];
    const relevantTransactions = session.assignment.getUnprocessedFATransByType(session, registerType);
    this.finaliseAssetObjects(session, relevantTransactions);
    this.transactions = relevantTransactions.map((assetTran) => {
      const { transaction, cerysCodeObj } = assetTran.getTranAndCerysCodeObj(session);
      return { ...cerysCodeObj, ...transaction, ...assetTran };
    });
  }

  finaliseAssetObjects(session: Session, relevantTransactions) {
    const reportingPeriod = session.assignment.reportingPeriod;
    relevantTransactions.forEach((asset) => {
      asset.activePeriods = [reportingPeriod._id];
      asset.periods = [
        {
          reportingPeriodNumber: reportingPeriod.periodNumber,
          reportingPeriodId: reportingPeriod._id,
          subTransactions: asset.subTransactions,
        },
      ];
    });
  }
}

export class AssetRegCreationPrompt extends InTrayItem {
  register: RegisterType;
  transactions: DetailedTransaction[];
  constructor(registerTemplate: RegisterCreationTemplate) {
    super({
      title: `Create ${registerTemplate.registerType} register?`,
      getSubtitle: null,
      getSummaryText: null,
      detailsAction: null,
      affirmativeAction: null,
    });
    this.register = registerTemplate.register;
    this.transactions = registerTemplate.transactions;
    this.getSubtitle = this.getIntraySubtitle;
    this.getSummaryText = this.getIntraySummaryText;
    this.affirmativeAction = this.createRegister;
  }

  getIntraySubtitle() {
    return null;
  }

  getIntraySummaryText() {
    return `Your data suggests this client owns ${this.register.longLower}.
          You have not set up a relevant asset register.
          Would you like to create one automatically?`;
  }

  createRegister(session: Session) {
    this.register.createRegister(session, this.transactions);
  }
}
