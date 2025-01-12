import {
  AssignmentProps,
  ClientSoftwareDefaultsProps,
  ClientTBLineProps,
  ClientTransaction,
  ReportingPeriod,
  ShortUser,
  TrialBalanceLineProps,
} from "../interfaces/interfaces";
import { calculateDiffInDays } from "../utils.ts/helperFunctions";
import { Session } from "./session";
import { AssetTransaction, Transaction } from "./transaction";

export class Assignment {
  clientId: string;
  clientCode: string;
  clientName: string;
  reportingPeriod: ReportingPeriod;
  assignmentType: string;
  senior: ShortUser;
  manager: ShortUser;
  responsibleIndividual: ShortUser;
  clientSoftwareDefaults: ClientSoftwareDefaultsProps;
  workbookId: string;
  transactions: Transaction[];
  clientNL: ClientTransaction[];
  assignmentStatus: string;
  dateStarted: string;
  dateFinished: string;
  TBInitiated: boolean;
  TBEntered: boolean;
  transactionsPosted: boolean;
  NLEntered: boolean;
  templatesAmended: boolean;
  IFARegisterCreated: boolean;
  TFARegisterCreated: boolean;
  IPRegisterCreated: boolean;
  tb: TrialBalanceLineProps[];
  clientTB: ClientTBLineProps[];
  activeCategories: string[];
  activeCategoriesDetails: {
    cerysCategory: string;
    value: number;
    cerysCodes: number[];
  }[];
  activeAssetCodeTypes: string[];
  transactionBatches: number;
  finalised: boolean;
  _id: string;
  profit?: number;
  tbListenerAdded: boolean;
  pLListenerAdded: boolean;
  bSListenerAdded?: boolean;
  tCA: number;
  tCL: number;
  nonCA: number;
  nonCL: number;
  provisions: number;
  shareCapital: number;
  sharePremium: number;
  profLossRes: number;
  capRedRes: number;
  otherRes: number;
  fVRes: number;
  otherRes2: number;
  otherRes3: number;
  otherRes4: number;
  otherRes5: number;
  minorityInt: number;
  constructor(assignment: AssignmentProps) {
    this.clientId = assignment.clientId;
    this.clientCode = assignment.clientCode;
    this.clientName = assignment.clientName;
    this.reportingPeriod = assignment.reportingPeriod;
    this.assignmentType = assignment.assignmentType;
    this.senior = assignment.senior;
    this.manager = assignment.manager;
    this.responsibleIndividual = assignment.responsibleIndividual;
    this.clientSoftwareDefaults = assignment.clientSoftwareDefaults;
    this.workbookId = assignment.workbookId;
    this.transactions = assignment.transactions.map((tran) => new Transaction(tran));
    this.clientNL = assignment.clientNL;
    this.assignmentStatus = assignment.assignmentStatus;
    this.dateStarted = assignment.dateStarted;
    this.dateFinished = assignment.dateFinished;
    this.TBInitiated = assignment.TBInitiated;
    this.TBEntered = assignment.TBEntered;
    this.transactionsPosted = assignment.transactionsPosted;
    this.NLEntered = assignment.NLEntered;
    this.templatesAmended = assignment.templatesAmended;
    this.IFARegisterCreated = assignment.IFARegisterCreated;
    this.TFARegisterCreated = assignment.TFARegisterCreated;
    this.IPRegisterCreated = assignment.IPRegisterCreated;
    this.tb = assignment.tb;
    this.clientTB = assignment.clientTB;
    this.activeCategories = assignment.activeCategories;
    this.activeCategoriesDetails = assignment.activeCategoriesDetails;
    this.activeAssetCodeTypes = assignment.activeAssetCodeTypes;
    this.transactionBatches = assignment.transactionBatches;
    this.finalised = assignment.finalised;
    this._id = assignment._id;
    this.profit = assignment.profit;
    this.tbListenerAdded = assignment.tbListenerAdded;
    this.pLListenerAdded = assignment.pLListenerAdded;
    this.bSListenerAdded = assignment.bSListenerAdded;
    this.tCA = assignment.tCA;
    this.tCL = assignment.tCL;
    this.nonCA = assignment.nonCA;
    this.nonCL = assignment.nonCL;
    this.provisions = assignment.provisions;
    this.shareCapital = assignment.shareCapital;
    this.sharePremium = assignment.sharePremium;
    this.profLossRes = assignment.profLossRes;
    this.capRedRes = assignment.capRedRes;
    this.otherRes = assignment.otherRes;
    this.fVRes = assignment.fVRes;
    this.otherRes2 = assignment.otherRes2;
    this.otherRes3 = assignment.otherRes3;
    this.otherRes4 = assignment.otherRes4;
    this.otherRes5 = assignment.otherRes5;
    this.minorityInt = assignment.minorityInt;
  }

  getUnprocessedFATransByType(session: Session, registerType: string) {
    const relevantTrans: AssetTransaction[] = [];
    this.transactions.forEach((tran) => {
      if (!tran.processedAsAsset) {
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
        }
      }
    });
    return relevantTrans;
  }

  getNextRegisterPrompt(session: Session) {
    const relevantTrans = this.transactions.filter((tran) => !tran.processedAsAsset);
    let nextRegisterPrompt: "IFA" | "TFA" | "IP" | null = null;
    relevantTrans.forEach((tran) => {
      const cerysCodeObj = tran.getCerysCodeObj(session);
      if (cerysCodeObj.assetCodeType === "iPCostAddns" || cerysCodeObj.assetCodeType === "iPCostBF") {
        nextRegisterPrompt = "IP";
      } else if (cerysCodeObj.assetCodeType === "tFACostAddns" || cerysCodeObj.assetCodeType === "tFACostBF") {
        nextRegisterPrompt = "TFA";
      } else if (cerysCodeObj.assetCodeType === "iFACostAddns" || cerysCodeObj.assetCodeType === "iFACostBF") {
        nextRegisterPrompt = "IFA";
      }
    });
    return nextRegisterPrompt;
  }

  getBFTransLikelyAdditions(session: Session, registerType: string) {
    const filteredArr = this.transactions.filter((tran) => {
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
          test = calculateDiffInDays(session.assignment.reportingPeriod.periodStart, tran.transactionDate);
        }
      }
      return test > 0;
    });
    return filteredArr;
  }

  calculateTurnover() {
    let turnover = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Turnover") turnover = obj.value / 100;
    });
    return turnover;
  }

  calculateCOS() {
    let COS = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Cost of sales") COS = obj.value / 100;
    });
    return COS;
  }

  calculateOOI() {
    let OOI = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Other operating income") OOI = obj.value / 100;
    });
    return OOI;
  }

  calculateAdjsFAAndCAI() {
    let AdjsFAAndCAI = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Value adjustments on fixed assets and current asset investments")
        AdjsFAAndCAI = obj.value / 100;
    });
    return AdjsFAAndCAI;
  }

  calculateDistCosts() {
    let distCosts = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Distribution costs") distCosts = obj.value / 100;
    });
    return distCosts;
  }

  calculateAdminExes() {
    let adminExes = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Administrative expenses") adminExes = obj.value / 100;
    });
    return adminExes;
  }

  calculateOtherIntRec() {
    let otherIntRec = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Other interest receivable and similar income") otherIntRec = obj.value / 100;
    });
    return otherIntRec;
  }

  calculateintPay() {
    let intPay = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Interest payable and similar charges") intPay = obj.value / 100;
    });
    return intPay;
  }

  calculateTax() {
    let tax = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Taxation") tax = obj.value / 100;
    });
    return tax;
  }
}
