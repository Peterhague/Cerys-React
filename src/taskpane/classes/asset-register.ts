import {
  AssetDb,
  AssetRegisterDb,
  AssetSubTransaction,
  DetailedTransaction,
  RegisterType,
} from "../interfaces/interfaces";
import { registerTypes } from "../static-values/register-types";
import { INTRAY_DETAILS } from "../static-values/views";
import { calculateDiffInDays, getUpdatedTransactions, updateAssignmentFigures } from "../utils/helper-functions";
import { previewRelTrans } from "../utils/transactions/asset-reg-generation";
import { checkFATranUpdatesForAssets, processTransBatch, processUpdateBatch } from "../utils/transactions/transactions";
import { InTrayCollection, InTrayItem } from "./in-trays/global";
import { Session } from "./session";
import { AssetTransaction, Transaction } from "./transaction";
/* global Excel */

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
  allTransactions: DetailedTransaction[];
  possibleAdditions: AssetTransaction[];
  refinedTransactions: DetailedTransaction[];
  constructor(session: Session, registerType: "IFA" | "TFA" | "IP") {
    this.registerType = registerType;
    this.register = registerTypes[registerType];
    const relevantTrans = session.assignment.getUnprocessedFATransByType(session, registerType);
    const convertedTrans = [];
    relevantTrans.forEach((tran) => {
      if (tran.clientTB) {
        const clientTrans = tran.getClientTransAsCerysTrans(session);
        convertedTrans.push(...clientTrans);
      } else convertedTrans.push(tran);
    });
    console.log(convertedTrans);
    this.finaliseAssetObjects(session, convertedTrans);
    this.allTransactions = convertedTrans.map((assetTran) => {
      const cerysCodeObj = assetTran.getCerysCodeObj(session);
      return { ...cerysCodeObj, ...assetTran };
    });
    this.possibleAdditions = this.identifyPossibleAdditions(session, convertedTrans, registerType);
    this.refinedTransactions = [];
  }

  finaliseAssetObjects(session: Session, relevantTransactions: AssetTransaction[]) {
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

  identifyPossibleAdditions(
    session: Session,
    relevantTransactions: AssetTransaction[],
    registerType: "IFA" | "TFA" | "IP"
  ) {
    return relevantTransactions.filter((tran) => {
      let test: number;
      if (!tran.processedAsAsset) {
        const cerysCodeObj = tran.getCerysCodeObj(session);
        if (
          (registerType === "IFA" &&
            cerysCodeObj.cerysCategory === "Intangible assets" &&
            cerysCodeObj.assetCodeType === "iFACostBF") ||
          (registerType === "TFA" &&
            cerysCodeObj.cerysCategory === "Tangible assets" &&
            cerysCodeObj.assetCodeType === "tFACostBF") ||
          (registerType === "IP" &&
            cerysCodeObj.cerysCategory === "Investment property" &&
            cerysCodeObj.assetCodeType === "iPCostBF")
        ) {
          console.log(session.assignment.reportingPeriod.periodStart);
          console.log(tran.transactionDate);
          console.log(typeof tran.transactionDate);
          test = calculateDiffInDays(session.assignment.reportingPeriod.periodStart, tran.transactionDate);
          console.log(test);
        }
      }
      return test > 0;
    });
  }
}

export class IdenitfyPossibleAdditionsPrompt extends InTrayItem {
  register: RegisterType;
  transactions: AssetTransaction[];
  constructor(registerTemplate: RegisterCreationTemplate, inTrayCollection: InTrayCollection) {
    super(
      {
        title: `Identify possible ${registerTemplate.registerType}`,
        getSubtitle: null,
        getSummaryText: null,
        detailsAction: null,
        detailsPath: INTRAY_DETAILS,
        affirmativeAction: null,
      },
      inTrayCollection
    );
    this.register = registerTemplate.register;
    this.transactions = registerTemplate.possibleAdditions;
    this.getSubtitle = this.getIntraySubtitle;
    this.getSummaryText = this.getIntraySummaryText;
    this.affirmativeAction = this.handleReanalysis;
  }

  getIntraySubtitle() {
    return null;
  }

  getIntraySummaryText() {
    return `These transactions were posted as b/fwd balances but from their dates would appear to be additions.
          Would you like to repost them as additions?`;
  }

  handleReanalysis = async (session: Session) => {
    try {
      await Excel.run(async (context) => {
        if (getUpdatedTransactions(session).length > 0) {
          await processUpdateBatch(session);
          updateAssignmentFigures(context, session);
          checkFATranUpdatesForAssets(session);
        }
        if (session.activeJournal.journals.length > 0) {
          await processTransBatch(context, session);
          checkFATranUpdatesForAssets(session);
        }
        previewRelTrans(session, this.register.initials);
      });
    } catch (e) {
      console.error(e);
    }
  };
}

export class AssetRegCreationPrompt extends InTrayItem {
  register: RegisterType;
  transactions: DetailedTransaction[];
  constructor(registerTemplate: RegisterCreationTemplate, inTrayCollection: InTrayCollection) {
    super(
      {
        title: `Create ${registerTemplate.registerType} register?`,
        getSubtitle: null,
        getSummaryText: null,
        detailsAction: null,
        detailsPath: INTRAY_DETAILS,
        affirmativeAction: null,
      },
      inTrayCollection
    );
    this.register = registerTemplate.register;
    this.transactions = registerTemplate.refinedTransactions;
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

  async createRegister(session: Session) {
    await this.register.createRegister(session, this.transactions);
  }
}
