import {
  AssignmentProps,
  ClientSoftwareDefaultsProps,
  ClientTBLineProps,
  ClientTransaction,
  ReportingPeriod,
  ShortUser,
  TrialBalanceLineProps,
} from "../interfaces/interfaces";
import {
  ADMIN_EXES_CAT,
  COS_CAT,
  DIST_COSTS_CAT,
  GL_CAT,
  GP_CAT,
  INT_PAY_CAT,
  INT_REC_CAT,
  LBIT_CAT,
  LBT_CAT,
  LOSS,
  LOSS_ORD_ACTS,
  OL_CAT,
  OOI_CAT,
  OP_CAT,
  PBIT_CAT,
  PBT_CAT,
  PROF_ORD_ACTS,
  PROFIT,
  TAX_LOSS,
  TAX_PROF,
  TO_CAT,
  VAL_ADJ_CAT,
} from "../static-values/accounts-categories";
import { calculateDiffInDays } from "../utils/helperFunctions";
import { FSCategoryLine } from "./accounts-category-line";
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
    let turnover: number = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Turnover") turnover = obj.value / 100;
    });
    return new FSCategoryLine(turnover, TO_CAT, false);
  }

  calculateCOS() {
    let COS: number = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Cost of sales") COS = obj.value / 100;
    });
    return new FSCategoryLine(COS, COS_CAT, false);
  }

  calculateOOI() {
    let OOI: number = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Other operating income") OOI = obj.value / 100;
    });
    return new FSCategoryLine(OOI, OOI_CAT, false);
  }

  calculateAdjsFAAndCAI() {
    let AdjsFAAndCAI: number = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Value adjustments on fixed assets and current asset investments")
        AdjsFAAndCAI = obj.value / 100;
    });
    return new FSCategoryLine(AdjsFAAndCAI, VAL_ADJ_CAT, false);
  }

  calculateGrossProfit(
    turnover: number | null,
    costOfSales: number | null,
    otherOpIncome: number | null,
    valAdjs: number | null
  ) {
    const TO: number = turnover ? turnover : this.calculateTurnover().fSValue;
    const COS: number = costOfSales ? costOfSales : this.calculateCOS().fSValue;
    const OOI: number = otherOpIncome ? otherOpIncome : this.calculateOOI().fSValue;
    const VA: number = valAdjs ? valAdjs : this.calculateAdjsFAAndCAI().fSValue;
    const total: number = TO + COS + OOI + VA;
    const category = total >= 0 ? GP_CAT : GL_CAT;
    let calculated = false;
    if (TO !== 0 || COS !== 0 || OOI !== 0 || VA !== 0) calculated = true;
    return new FSCategoryLine(total * -1, category, calculated);
  }

  calculateDistCosts() {
    let distCosts: number = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Distribution costs") distCosts = obj.value / 100;
    });
    return new FSCategoryLine(distCosts, DIST_COSTS_CAT, false);
  }

  calculateAdminExes() {
    let adminExes: number = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Administrative expenses") adminExes = obj.value / 100;
    });
    return new FSCategoryLine(adminExes, ADMIN_EXES_CAT, false);
  }

  calculateOperatingProfit(grossProfit: number | null, distCosts: number | null, adminExes: number | null) {
    const GP: number = grossProfit ? grossProfit : this.calculateGrossProfit(null, null, null, null).fSValue;
    const DC: number = distCosts ? distCosts : this.calculateDistCosts().fSValue;
    const AE: number = adminExes ? adminExes : this.calculateAdminExes().fSValue;
    const total: number = GP + DC + AE;
    const category = total >= 0 ? OP_CAT : OL_CAT;
    let calculated = false;
    if (DC !== 0 || AE !== 0) calculated = true;
    return new FSCategoryLine(total * -1, category, calculated);
  }

  calculateProfOnOrdActs(operatingProfit: number | null) {
    const total: number = operatingProfit ? operatingProfit : this.calculateOperatingProfit(null, null, null).fSValue;
    const category = total >= 0 ? PROF_ORD_ACTS : LOSS_ORD_ACTS;
    return new FSCategoryLine(total * -1, category, false);
  }

  calculateOtherIntRec() {
    let otherIntRec: number = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Other interest receivable and similar income") otherIntRec = obj.value / 100;
    });
    return new FSCategoryLine(otherIntRec, INT_REC_CAT, false);
  }

  calculatePBIT(operatingProfit: number | null, intRec: number | null) {
    const runningTotal: number = operatingProfit
      ? operatingProfit
      : this.calculateOperatingProfit(null, null, null).fSValue;
    const IR: number = intRec ? intRec : this.calculateOtherIntRec().fSValue;
    const total: number = runningTotal + IR;
    const category = total >= 0 ? PBIT_CAT : LBIT_CAT;
    const calculated = IR === 0 ? false : true;
    return new FSCategoryLine(total * -1, category, calculated);
  }

  calculateintPay() {
    let intPay: number = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Interest payable and similar charges") intPay = obj.value / 100;
    });
    return new FSCategoryLine(intPay, INT_PAY_CAT, false);
  }

  calculatePBT(profBIT: number | null, intPay: number | null) {
    const runningTotal: number = profBIT ? profBIT : this.calculatePBIT(null, null).fSValue;
    const IP: number = intPay ? intPay : this.calculateintPay().fSValue;
    const total: number = runningTotal + IP;
    const category = total >= 0 ? PBT_CAT : LBT_CAT;
    const calculated = IP === 0 ? false : true;
    return new FSCategoryLine(total * -1, category, calculated);
  }

  calculateTax(profBeforeTax: number | null) {
    let tax: number = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Taxation") tax = obj.value / 100;
    });
    const PBT: number = profBeforeTax ? profBeforeTax : this.calculatePBT(null, null).fSValue;
    const category = PBT >= 0 ? TAX_PROF : TAX_LOSS;
    return new FSCategoryLine(tax, category, false);
  }

  calculateProfit(profBeforeTax: number | null, taxation: number | null) {
    const PBT: number = profBeforeTax ? profBeforeTax : this.calculatePBT(null, null).fSValue;
    const tax: number = taxation ? taxation : this.calculateTax(PBT).fSValue;
    const total: number = PBT + tax;
    const category = total >= 0 ? PROFIT : LOSS;
    return new FSCategoryLine(total * -1, category, true);
  }

  getPLAccount() {
    const pLArray: FSCategoryLine[] = [];
    const turnover = this.calculateTurnover();
    turnover.rawValue !== 0 && pLArray.push(turnover);
    const COS = this.calculateCOS();
    COS.rawValue !== 0 && pLArray.push(COS);
    const OOI = this.calculateOOI();
    OOI.rawValue !== 0 && pLArray.push(OOI);
    const VA = this.calculateAdjsFAAndCAI();
    VA.rawValue !== 0 && pLArray.push(VA);
    const GP = this.calculateGrossProfit(turnover.fSValue, COS.fSValue, OOI.fSValue, VA.fSValue);
    pLArray.push(GP);
    const DC = this.calculateDistCosts();
    DC.rawValue !== 0 && pLArray.push(DC);
    const AE = this.calculateAdminExes();
    AE.rawValue !== 0 && pLArray.push(AE);
    const opProf = this.calculateOperatingProfit(GP.fSValue, DC.fSValue, AE.fSValue);
    pLArray.push(opProf);
    const PLOA = this.calculateProfOnOrdActs(opProf.fSValue);
    pLArray.push(PLOA);
    const intRec = this.calculateOtherIntRec();
    intRec.rawValue !== 0 && pLArray.push(intRec);
    const PBIT = this.calculatePBIT(opProf.fSValue, intRec.fSValue);
    pLArray.push(PBIT);
    const intPay = this.calculateintPay();
    intPay.rawValue !== 0 && pLArray.push(intPay);
    const PBT = this.calculatePBT(PBIT.fSValue, intPay.fSValue);
    pLArray.push(PBT);
    const tax = this.calculateTax(PBT.fSValue);
    tax.rawValue !== 0 && pLArray.push(tax);
    pLArray.push(this.calculateProfit(PBT.fSValue, tax.fSValue));
    return pLArray;
  }
}
