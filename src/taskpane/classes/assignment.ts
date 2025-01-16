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
  CAP_RED_RES_CAT,
  CAP_RES_CAT,
  CASH_CAT,
  CURR_ASS_CAT,
  CURR_LIA_CAT,
  DEBTORS_CAT,
  EQUITY_CAT,
  FAI_CAT,
  FIN_ASS_CAT,
  FIXED_ASS_CAT,
  FV_RES_CAT,
  IFA_CAT,
  IP_CAT,
  LT_CRED_CAT,
  MI_CAT,
  NA_CAT,
  NCA_CAT,
  OR1_CAT,
  OR2_CAT,
  OR3_CAT,
  OR4_CAT,
  OR5_CAT,
  PL_RES_CAT,
  PROVS_CAT,
  SHARE_CAP_CAT,
  SHARE_PREM_CAT,
  ST_CRED_CAT,
  STOCKS_CAT,
  SUBTOTAL_QUASI_CAT,
  TALCL_CAT,
  TFA_CAT,
  TOTAL_QUASI_CAT,
} from "../static-values/accounts-categories-bs";
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
} from "../static-values/accounts-categories-pl";
import { calculateDiffInDays } from "../utils/helperFunctions";
import { FSCategoryLineBS, FSCategoryLinePL } from "./accounts-category-line";
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
    return new FSCategoryLinePL(turnover, TO_CAT, false);
  }

  calculateCOS() {
    let COS: number = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Cost of sales") COS = obj.value / 100;
    });
    return new FSCategoryLinePL(COS, COS_CAT, false);
  }

  calculateOOI() {
    let OOI: number = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Other operating income") OOI = obj.value / 100;
    });
    return new FSCategoryLinePL(OOI, OOI_CAT, false);
  }

  calculateAdjsFAAndCAI() {
    let AdjsFAAndCAI: number = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Value adjustments on fixed assets and current asset investments")
        AdjsFAAndCAI = obj.value / 100;
    });
    return new FSCategoryLinePL(AdjsFAAndCAI, VAL_ADJ_CAT, false);
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
    return new FSCategoryLinePL(total * -1, category, calculated);
  }

  calculateDistCosts() {
    let distCosts: number = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Distribution costs") distCosts = obj.value / 100;
    });
    return new FSCategoryLinePL(distCosts, DIST_COSTS_CAT, false);
  }

  calculateAdminExes() {
    let adminExes: number = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Administrative expenses") adminExes = obj.value / 100;
    });
    return new FSCategoryLinePL(adminExes, ADMIN_EXES_CAT, false);
  }

  calculateOperatingProfit(grossProfit: number | null, distCosts: number | null, adminExes: number | null) {
    const GP: number = grossProfit ? grossProfit : this.calculateGrossProfit(null, null, null, null).fSValue;
    const DC: number = distCosts ? distCosts : this.calculateDistCosts().fSValue;
    const AE: number = adminExes ? adminExes : this.calculateAdminExes().fSValue;
    const total: number = GP + DC + AE;
    const category = total >= 0 ? OP_CAT : OL_CAT;
    let calculated = false;
    if (DC !== 0 || AE !== 0) calculated = true;
    return new FSCategoryLinePL(total * -1, category, calculated);
  }

  calculateProfOnOrdActs(operatingProfit: number | null) {
    const total: number = operatingProfit ? operatingProfit : this.calculateOperatingProfit(null, null, null).fSValue;
    const category = total >= 0 ? PROF_ORD_ACTS : LOSS_ORD_ACTS;
    return new FSCategoryLinePL(total * -1, category, false);
  }

  calculateOtherIntRec() {
    let otherIntRec: number = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Other interest receivable and similar income") otherIntRec = obj.value / 100;
    });
    return new FSCategoryLinePL(otherIntRec, INT_REC_CAT, false);
  }

  calculatePBIT(operatingProfit: number | null, intRec: number | null) {
    const runningTotal: number = operatingProfit
      ? operatingProfit
      : this.calculateOperatingProfit(null, null, null).fSValue;
    const IR: number = intRec ? intRec : this.calculateOtherIntRec().fSValue;
    const total: number = runningTotal + IR;
    const category = total >= 0 ? PBIT_CAT : LBIT_CAT;
    const calculated = IR === 0 ? false : true;
    return new FSCategoryLinePL(total * -1, category, calculated);
  }

  calculateintPay() {
    let intPay: number = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Interest payable and similar charges") intPay = obj.value / 100;
    });
    return new FSCategoryLinePL(intPay, INT_PAY_CAT, false);
  }

  calculatePBT(profBIT: number | null, intPay: number | null) {
    const runningTotal: number = profBIT ? profBIT : this.calculatePBIT(null, null).fSValue;
    const IP: number = intPay ? intPay : this.calculateintPay().fSValue;
    const total: number = runningTotal + IP;
    const category = total >= 0 ? PBT_CAT : LBT_CAT;
    const calculated = IP === 0 ? false : true;
    return new FSCategoryLinePL(total * -1, category, calculated);
  }

  calculateTax(profBeforeTax: number | null) {
    let tax: number = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Taxation") tax = obj.value / 100;
    });
    const PBT: number = profBeforeTax ? profBeforeTax : this.calculatePBT(null, null).fSValue;
    const category = PBT >= 0 ? TAX_PROF : TAX_LOSS;
    return new FSCategoryLinePL(tax, category, false);
  }

  calculateProfit(profBeforeTax: number | null, taxation: number | null) {
    const PBT: number = profBeforeTax ? profBeforeTax : this.calculatePBT(null, null).fSValue;
    const tax: number = taxation ? taxation : this.calculateTax(PBT).fSValue;
    const total: number = PBT + tax;
    const category = total >= 0 ? PROFIT : LOSS;
    return new FSCategoryLinePL(total * -1, category, true);
  }

  calculateIFA() {
    let IFA: number = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Intangible assets") IFA = obj.value / 100;
    });
    return new FSCategoryLineBS(IFA, IFA_CAT);
  }

  calculateTFA() {
    let TFA: number = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Tangible assets") TFA = obj.value / 100;
    });
    return new FSCategoryLineBS(TFA, TFA_CAT);
  }

  calculateFAI() {
    let FAI: number = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Fixed asset investments") FAI = obj.value / 100;
    });
    return new FSCategoryLineBS(FAI, FAI_CAT);
  }

  calculateIP() {
    let IP: number = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Investment property") IP = obj.value / 100;
    });
    return new FSCategoryLineBS(IP, IP_CAT);
  }

  calculateFixedAssets(
    intAssets: FSCategoryLineBS | null,
    tAssets: FSCategoryLineBS | null,
    fixAssInvs: FSCategoryLineBS | null,
    invProp: FSCategoryLineBS | null
  ) {
    let IFA = intAssets ? intAssets.numberValue : this.calculateIFA().numberValue;
    let TFA = tAssets ? tAssets.numberValue : this.calculateTFA().numberValue;
    let FAI = fixAssInvs ? fixAssInvs.numberValue : this.calculateFAI().numberValue;
    let IP = invProp ? invProp.numberValue : this.calculateIP().numberValue;
    const total = IFA + TFA + FAI + IP;
    return new FSCategoryLineBS(total, TOTAL_QUASI_CAT);
  }

  calculateStocks() {
    let stocks: number = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Stocks") stocks = obj.value / 100;
    });
    return new FSCategoryLineBS(stocks, STOCKS_CAT);
  }

  calculateDebtors() {
    let debtors: number = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Debtors") debtors = obj.value / 100;
    });
    return new FSCategoryLineBS(debtors, DEBTORS_CAT);
  }

  calculateFinAssets() {
    let FA: number = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Financial assets") FA = obj.value / 100;
    });
    return new FSCategoryLineBS(FA, FIN_ASS_CAT);
  }

  calculateCash() {
    let cash: number = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Cash") cash = obj.value / 100;
    });
    return new FSCategoryLineBS(cash, CASH_CAT);
  }

  calculateCurrentAssets(
    stocks: FSCategoryLineBS | null,
    debtors: FSCategoryLineBS | null,
    finAssets: FSCategoryLineBS | null,
    cash: FSCategoryLineBS | null
  ) {
    let INV = stocks ? stocks.numberValue : this.calculateStocks().numberValue;
    let DRS = debtors ? debtors.numberValue : this.calculateDebtors().numberValue;
    let FA = finAssets ? finAssets.numberValue : this.calculateFinAssets().numberValue;
    let bank = cash ? cash.numberValue : this.calculateCash().numberValue;
    const total = INV + DRS + FA + bank;
    return new FSCategoryLineBS(total, SUBTOTAL_QUASI_CAT);
  }

  calculateShortTermCreditors() {
    let cred: number = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Creditors < 1 year") cred = obj.value / 100;
    });
    return new FSCategoryLineBS(cred, ST_CRED_CAT);
  }

  calculateCurrentLiabilities(shortTermCreds: FSCategoryLineBS | null) {
    const STC = shortTermCreds ? shortTermCreds.rawValue : this.calculateShortTermCreditors().rawValue;
    return new FSCategoryLineBS(STC, SUBTOTAL_QUASI_CAT);
  }

  calculateNCA(currentAssets: FSCategoryLineBS | null, currentLiabs: FSCategoryLineBS | null) {
    const CA = currentAssets
      ? currentAssets.numberValue
      : this.calculateCurrentAssets(null, null, null, null).numberValue;
    const CL = currentLiabs ? currentLiabs.numberValue : this.calculateCurrentLiabilities(null).numberValue;
    const total = CA + CL;
    return new FSCategoryLineBS(total, NCA_CAT);
  }

  calculateTALCL(fixedAssets: FSCategoryLineBS | null, netCurrAssets: FSCategoryLineBS | null) {
    const FA = fixedAssets ? fixedAssets.numberValue : this.calculateFixedAssets(null, null, null, null).numberValue;
    const NCA = netCurrAssets ? netCurrAssets.numberValue : this.calculateNCA(null, null).numberValue;
    const total = FA + NCA;
    return new FSCategoryLineBS(total, TALCL_CAT);
  }

  calculateLongTermCreditors() {
    let cred: number = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Creditors > 1 year") cred = obj.value / 100;
    });
    return new FSCategoryLineBS(cred, LT_CRED_CAT);
  }

  calculateProvisions() {
    let prov: number = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Provisions for liabilities") prov = obj.value / 100;
    });
    return new FSCategoryLineBS(prov, PROVS_CAT);
  }

  calculateNetAssets(
    totalAssetsLessCL: FSCategoryLineBS | null,
    longTermCred: FSCategoryLineBS | null,
    provisions: FSCategoryLineBS | null
  ) {
    const TALCL = totalAssetsLessCL ? totalAssetsLessCL.numberValue : this.calculateTALCL(null, null).numberValue;
    const LTC = longTermCred ? longTermCred.numberValue : this.calculateLongTermCreditors().numberValue;
    const prov = provisions ? provisions.numberValue : this.calculateProvisions().numberValue;
    const total = TALCL + LTC + prov;
    return new FSCategoryLineBS(total, NA_CAT);
  }

  calculateShareCapital() {
    let shareCap = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Share capital") shareCap = obj.value / 100;
    });
    return new FSCategoryLineBS(shareCap, SHARE_CAP_CAT);
  }

  calculateSharePremium() {
    let sharePrem = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Share premium") sharePrem = obj.value / 100;
    });
    return new FSCategoryLineBS(sharePrem, SHARE_PREM_CAT);
  }

  calculateCapRedRes() {
    let CRR = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Capital redemption reserve") CRR = obj.value / 100;
    });
    return new FSCategoryLineBS(CRR, CAP_RED_RES_CAT);
  }

  calculateFVRes() {
    let FVR = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Fair value reserve") FVR = obj.value / 100;
    });
    return new FSCategoryLineBS(FVR, FV_RES_CAT);
  }

  calculateOtherRes1() {
    let OR = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Other reserves") OR = obj.value / 100;
    });
    return new FSCategoryLineBS(OR, OR1_CAT);
  }

  calculateOtherRes2() {
    let OR = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Other reserves 2") OR = obj.value / 100;
    });
    return new FSCategoryLineBS(OR, OR2_CAT);
  }

  calculateOtherRes3() {
    let OR = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Other reserves 3") OR = obj.value / 100;
    });
    return new FSCategoryLineBS(OR, OR3_CAT);
  }

  calculateOtherRes4() {
    let OR = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Other reserves 4") OR = obj.value / 100;
    });
    return new FSCategoryLineBS(OR, OR4_CAT);
  }

  calculateOtherRes5() {
    let OR = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Other reserves 5") OR = obj.value / 100;
    });
    return new FSCategoryLineBS(OR, OR5_CAT);
  }

  calculateMinorityInt() {
    let MI = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Minority interest") MI = obj.value / 100;
    });
    return new FSCategoryLineBS(MI, MI_CAT);
  }

  calculatePLRes() {
    const CY = this.calculateProfit(null, null).fSValue;
    let reserve = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Profit & loss reserve") reserve = (obj.value / 100) * -1;
    });
    const total = CY + reserve;
    return new FSCategoryLineBS(total, PL_RES_CAT);
  }

  calculateTotalEquity(
    shareCap: FSCategoryLineBS | null,
    sharePrem: FSCategoryLineBS | null,
    capRedRes: FSCategoryLineBS | null,
    fairValRes: FSCategoryLineBS | null,
    otherRes1: FSCategoryLineBS | null,
    otherRes2: FSCategoryLineBS | null,
    otherRes3: FSCategoryLineBS | null,
    otherRes4: FSCategoryLineBS | null,
    otherRes5: FSCategoryLineBS | null,
    minorityInt: FSCategoryLineBS | null,
    profLossRes: FSCategoryLineBS | null
  ) {
    const SC = shareCap ? shareCap.numberValue : this.calculateShareCapital().numberValue;
    const SP = shareCap ? sharePrem.numberValue : this.calculateSharePremium().numberValue;
    const CRR = capRedRes ? capRedRes.numberValue : this.calculateCapRedRes().numberValue;
    const FVR = fairValRes ? fairValRes.numberValue : this.calculateFVRes().numberValue;
    const OR1 = otherRes1 ? otherRes1.numberValue : this.calculateOtherRes1().numberValue;
    const OR2 = otherRes2 ? otherRes2.numberValue : this.calculateOtherRes2().numberValue;
    const OR3 = otherRes3 ? otherRes3.numberValue : this.calculateOtherRes3().numberValue;
    const OR4 = otherRes4 ? otherRes4.numberValue : this.calculateOtherRes4().numberValue;
    const OR5 = otherRes5 ? otherRes5.numberValue : this.calculateOtherRes5().numberValue;
    const MI = minorityInt ? minorityInt.numberValue : this.calculateMinorityInt().numberValue;
    const PLR = profLossRes ? profLossRes.numberValue : this.calculatePLRes().numberValue;
    const total = SC + SP + CRR + FVR + OR1 + OR2 + OR3 + OR4 + OR5 + MI + PLR;
    return new FSCategoryLineBS(total, EQUITY_CAT);
  }

  getPLAccount() {
    const pLArray: FSCategoryLinePL[] = [];
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

  getBalanceSheet() {
    const bSArray: FSCategoryLineBS[] = [];
    const IFA = this.calculateIFA();
    const TFA = this.calculateTFA();
    const FAI = this.calculateFAI();
    const IP = this.calculateIP();
    const fixedAssets = this.calculateFixedAssets(IFA, TFA, FAI, IP);
    if (IFA.rawValue !== 0 || TFA.rawValue !== 0 || FAI.rawValue !== 0 || IP.rawValue !== 0) {
      bSArray.push(new FSCategoryLineBS("", FIXED_ASS_CAT));
      IFA.rawValue !== 0 && bSArray.push(IFA);
      TFA.rawValue !== 0 && bSArray.push(TFA);
      FAI.rawValue !== 0 && bSArray.push(FAI);
      IP.rawValue !== 0 && bSArray.push(IP);
      bSArray.push(fixedAssets);
    }
    const stocks = this.calculateStocks();
    const debtors = this.calculateDebtors();
    const finAss = this.calculateFinAssets();
    const cash = this.calculateCash();
    const currAssets = this.calculateCurrentAssets(stocks, debtors, finAss, cash);
    if (stocks.rawValue !== 0 || debtors.rawValue !== 0 || finAss.rawValue !== 0 || cash.rawValue !== 0) {
      bSArray.push(new FSCategoryLineBS("", CURR_ASS_CAT));
      stocks.rawValue !== 0 && bSArray.push(stocks);
      debtors.rawValue !== 0 && bSArray.push(debtors);
      finAss.rawValue !== 0 && bSArray.push(finAss);
      cash.rawValue !== 0 && bSArray.push(cash);
      bSArray.push(currAssets);
    }
    const STC = this.calculateShortTermCreditors();
    const currLiabs = this.calculateCurrentLiabilities(STC);
    if (STC.rawValue !== 0) {
      bSArray.push(new FSCategoryLineBS("", CURR_LIA_CAT));
      bSArray.push(STC);
      bSArray.push(currLiabs);
    }
    const netCurrAssets = this.calculateNCA(currAssets, currLiabs);
    if (currAssets.rawValue !== 0 || currLiabs.rawValue !== 0) {
      bSArray.push(netCurrAssets);
    }
    const tALessCL = this.calculateTALCL(fixedAssets, netCurrAssets);
    if (fixedAssets.rawValue !== 0 || currAssets.rawValue !== 0 || currLiabs.rawValue !== 0) {
      bSArray.push(tALessCL);
    }
    const LTC = this.calculateLongTermCreditors();
    LTC.rawValue !== 0 && bSArray.push(LTC);
    const provisions = this.calculateProvisions();
    provisions.rawValue !== 0 && bSArray.push(provisions);
    const netAssets = this.calculateNetAssets(tALessCL, LTC, provisions);
    bSArray.push(netAssets);
    bSArray.push(new FSCategoryLineBS("", CAP_RES_CAT));
    const shareCap = this.calculateShareCapital();
    shareCap.rawValue !== 0 && bSArray.push(shareCap);
    const sharePrem = this.calculateSharePremium();
    sharePrem.rawValue !== 0 && bSArray.push(sharePrem);
    const CRR = this.calculateCapRedRes();
    CRR.rawValue !== 0 && bSArray.push(CRR);
    const FVR = this.calculateFVRes();
    FVR.rawValue !== 0 && bSArray.push(FVR);
    const OR1 = this.calculateOtherRes1();
    OR1.rawValue !== 0 && bSArray.push(OR1);
    const OR2 = this.calculateOtherRes2();
    OR2.rawValue !== 0 && bSArray.push(OR2);
    const OR3 = this.calculateOtherRes3();
    OR3.rawValue !== 0 && bSArray.push(OR3);
    const OR4 = this.calculateOtherRes4();
    OR4.rawValue !== 0 && bSArray.push(OR4);
    const OR5 = this.calculateOtherRes5();
    OR5.rawValue !== 0 && bSArray.push(OR5);
    const MI = this.calculateMinorityInt();
    MI.rawValue !== 0 && bSArray.push(MI);
    const profLossRes = this.calculatePLRes();
    profLossRes.rawValue !== 0 && bSArray.push(profLossRes);
    const equity = this.calculateTotalEquity(shareCap, sharePrem, CRR, FVR, OR1, OR2, OR3, OR4, OR5, MI, profLossRes);
    bSArray.push(equity);
    return bSArray;
  }
}
