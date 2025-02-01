import {
  AssignmentProps,
  ClientSoftwareDefaultsProps,
  ClientTBLineProps,
  ClientTransaction,
  FSCategoryBS,
  FSCategoryPL,
  PreliminaryAssignmentProps,
  ReportingPeriod,
  ShortUser,
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
import { calculateDiffInDays } from "../utils/helper-functions";
import { FSCategoryLineBS, FSCategoryLinePL } from "./accounts-category-line";
import { Session } from "./session";
import { AssetTransaction, Transaction } from "./transaction";
import { TrialBalanceLine } from "./client-codes";
import { InTray } from "./in-trays/global";
import { InTrayAssignment } from "./in-trays/templates";

class BaseAssignment {
  clientId: string;
  clientCode: string;
  clientName: string;
  assignmentType: string;
  transactionsPosted: boolean;
  senior: ShortUser;
  manager: ShortUser;
  responsibleIndividual: ShortUser;
  constructor(assignment: AssignmentProps | PreliminaryAssignmentProps) {
    this.clientId = assignment.clientId;
    this.clientCode = assignment.clientCode;
    this.clientName = assignment.clientName;
    this.assignmentType = assignment.assignmentType;
    this.transactionsPosted = assignment.transactionsPosted;
    this.senior = assignment.senior;
    this.manager = assignment.manager;
    this.responsibleIndividual = assignment.responsibleIndividual;
  }
}

export class PreliminaryAssignment extends BaseAssignment {
  clientSoftware: string;
  reportingDate: string;
  periodStart: string;
  constructor(assignment: PreliminaryAssignmentProps) {
    super(assignment);
    this.clientSoftware = assignment.clientSoftware;
    this.reportingDate = assignment.reportingDate;
    this.periodStart = assignment.periodStart;
  }
}

export class Assignment extends BaseAssignment {
  reportingPeriod: ReportingPeriod;
  clientSoftwareDefaults: ClientSoftwareDefaultsProps;
  workbookId: string;
  transactions: Transaction[];
  clientNL: ClientTransaction[];
  assignmentStatus: string;
  dateStarted: string;
  dateFinished: string;
  TBInitiated: boolean;
  TBEntered: boolean;
  NLEntered: boolean;
  templatesAmended: boolean;
  IFARegisterCreated: boolean;
  TFARegisterCreated: boolean;
  IPRegisterCreated: boolean;
  tb: TrialBalanceLine[];
  clientTB: ClientTBLineProps[];
  activeCategories: string[];
  activeCategoriesDetails: {
    cerysCategory: string;
    value: number;
    cerysCodes: number[];
    _id: string;
  }[];
  activeAssetCodeTypes: string[];
  transactionBatches: number;
  finalised: boolean;
  _id: string;
  tbListenerAdded: boolean;
  pLListenerAdded: boolean;
  bSListenerAdded?: boolean;
  inTray: InTray;
  constructor(assignment: AssignmentProps) {
    console.log("here");
    super(assignment);
    this.reportingPeriod = assignment.reportingPeriod;
    this.senior = assignment.senior;
    this.manager = assignment.manager;
    this.responsibleIndividual = assignment.responsibleIndividual;
    this.clientSoftwareDefaults = assignment.clientSoftwareDefaults;
    console.log("here");
    this.workbookId = assignment.workbookId;
    this.transactions = assignment.transactions.map((tran) => new Transaction(tran));
    this.clientNL = assignment.clientNL;
    this.assignmentStatus = assignment.assignmentStatus;
    this.dateStarted = assignment.dateStarted;
    this.dateFinished = assignment.dateFinished;
    this.TBInitiated = assignment.TBInitiated;
    this.TBEntered = assignment.TBEntered;
    console.log("here");
    this.NLEntered = assignment.NLEntered;
    this.templatesAmended = assignment.templatesAmended;
    this.IFARegisterCreated = assignment.IFARegisterCreated;
    this.TFARegisterCreated = assignment.TFARegisterCreated;
    this.IPRegisterCreated = assignment.IPRegisterCreated;
    this.tb = assignment.tb.map((line) => new TrialBalanceLine(line));
    this.clientTB = assignment.clientTB;
    this.activeCategories = assignment.activeCategories;
    this.activeCategoriesDetails = assignment.activeCategoriesDetails;
    console.log("here");
    this.activeAssetCodeTypes = assignment.activeAssetCodeTypes;
    this.transactionBatches = assignment.transactionBatches;
    this.finalised = assignment.finalised;
    this._id = assignment._id;
    console.log("here");
    this.tbListenerAdded = assignment.tbListenerAdded;
    this.pLListenerAdded = assignment.pLListenerAdded;
    this.bSListenerAdded = assignment.bSListenerAdded;
    console.log("here");
    this.inTray = new InTray(new InTrayAssignment());
    console.log("here");
  }

  getUnprocessedFATransByType(session: Session, registerType: string) {
    const relevantTrans: AssetTransaction[] = [];
    this.transactions.forEach((tran) => {
      if (!tran.processedAsAsset) {
        const cerysCodeObj = tran.getCerysCodeObj(session);
        if (
          (registerType === "IFA" &&
            cerysCodeObj.cerysCategory === "Intangible assets" &&
            (cerysCodeObj.assetCodeType === "iFACostAddns" || cerysCodeObj.assetCodeType === "iFACostBF")) ||
          (registerType === "TFA" &&
            cerysCodeObj.cerysCategory === "Tangible assets" &&
            (cerysCodeObj.assetCodeType === "tFACostAddns" || cerysCodeObj.assetCodeType === "tFACostBF")) ||
          (registerType === "IP" &&
            cerysCodeObj.cerysCategory === "Investment property" &&
            (cerysCodeObj.assetCodeType === "iPCostAddns" || cerysCodeObj.assetCodeType === "iPCostBF"))
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

  getRegisterPrompts(session: Session) {
    const relevantTrans = this.transactions.filter((tran) => !tran.processedAsAsset);
    const prompts: ("IFA" | "TFA" | "IP")[] = [];
    const ifa = relevantTrans.find((tran) => {
      const cerysCodeObj = tran.getCerysCodeObj(session);
      return cerysCodeObj.assetCodeType === "iFACostAddns" || cerysCodeObj.assetCodeType === "iFACostBF";
    });
    ifa && prompts.push("IFA");
    const tfa = relevantTrans.find((tran) => {
      const cerysCodeObj = tran.getCerysCodeObj(session);
      return cerysCodeObj.assetCodeType === "tFACostAddns" || cerysCodeObj.assetCodeType === "tFACostBF";
    });
    tfa && prompts.push("TFA");
    const ip = relevantTrans.find((tran) => {
      const cerysCodeObj = tran.getCerysCodeObj(session);
      return cerysCodeObj.assetCodeType === "iPCostAddns" || cerysCodeObj.assetCodeType === "iPCostBF";
    });
    ip && prompts.push("IP");
    return prompts;
  }

  getTransLikelyAdditions(session: Session, registerType: string) {
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
    return filteredArr.map((tran) => new AssetTransaction(session, tran));
  }

  calculateProfLossCategory(category: FSCategoryPL) {
    let total: number = 0;
    let id: string;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === category.categoryName) {
        total = obj.value / 100;
        id = obj._id;
      }
    });
    return new FSCategoryLinePL(total, id, category, false);
  }

  calculateGrossProfit(
    turnover: number | null,
    costOfSales: number | null,
    otherOpIncome: number | null,
    valAdjs: number | null
  ) {
    const TO: number = turnover ? turnover : this.calculateProfLossCategory(TO_CAT).fSValue;
    const COS: number = costOfSales ? costOfSales : this.calculateProfLossCategory(COS_CAT).fSValue;
    const OOI: number = otherOpIncome ? otherOpIncome : this.calculateProfLossCategory(OOI_CAT).fSValue;
    const VA: number = valAdjs ? valAdjs : this.calculateProfLossCategory(VAL_ADJ_CAT).fSValue;
    const total: number = TO + COS + OOI + VA;
    const category = total >= 0 ? GP_CAT : GL_CAT;
    let calculated = false;
    if (TO !== 0 || COS !== 0 || OOI !== 0 || VA !== 0) calculated = true;
    return new FSCategoryLinePL(total * -1, null, category, calculated);
  }

  calculateOperatingProfit(grossProfit: number | null, distCosts: number | null, adminExes: number | null) {
    const GP: number = grossProfit ? grossProfit : this.calculateGrossProfit(null, null, null, null).fSValue;
    const DC: number = distCosts ? distCosts : this.calculateProfLossCategory(DIST_COSTS_CAT).fSValue;
    const AE: number = adminExes ? adminExes : this.calculateProfLossCategory(ADMIN_EXES_CAT).fSValue;
    const total: number = GP + DC + AE;
    const category = total >= 0 ? OP_CAT : OL_CAT;
    let calculated = false;
    if (DC !== 0 || AE !== 0) calculated = true;
    return new FSCategoryLinePL(total * -1, null, category, calculated);
  }

  calculateProfOnOrdActs(operatingProfit: number | null) {
    const total: number = operatingProfit ? operatingProfit : this.calculateOperatingProfit(null, null, null).fSValue;
    const category = total >= 0 ? PROF_ORD_ACTS : LOSS_ORD_ACTS;
    return new FSCategoryLinePL(total * -1, null, category, false);
  }

  calculatePBIT(operatingProfit: number | null, intRec: number | null) {
    const runningTotal: number = operatingProfit
      ? operatingProfit
      : this.calculateOperatingProfit(null, null, null).fSValue;
    const IR: number = intRec ? intRec : this.calculateProfLossCategory(INT_REC_CAT).fSValue;
    const total: number = runningTotal + IR;
    const category = total >= 0 ? PBIT_CAT : LBIT_CAT;
    const calculated = IR === 0 ? false : true;
    return new FSCategoryLinePL(total * -1, null, category, calculated);
  }

  calculatePBT(profBIT: number | null, intPay: number | null) {
    const runningTotal: number = profBIT ? profBIT : this.calculatePBIT(null, null).fSValue;
    const IP: number = intPay ? intPay : this.calculateProfLossCategory(INT_PAY_CAT).fSValue;
    const total: number = runningTotal + IP;
    const category = total >= 0 ? PBT_CAT : LBT_CAT;
    const calculated = IP === 0 ? false : true;
    return new FSCategoryLinePL(total * -1, null, category, calculated);
  }

  calculateTax(profBeforeTax: number | null) {
    let tax: number = 0;
    let id: string;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Taxation") {
        tax = obj.value / 100;
        id = obj._id;
      }
    });
    const PBT: number = profBeforeTax ? profBeforeTax : this.calculatePBT(null, null).fSValue;
    const category = PBT >= 0 ? TAX_PROF : TAX_LOSS;
    return new FSCategoryLinePL(tax, id, category, false);
  }

  calculateProfit(profBeforeTax: number | null, taxation: number | null) {
    const PBT: number = profBeforeTax ? profBeforeTax : this.calculatePBT(null, null).fSValue;
    const tax: number = taxation ? taxation : this.calculateTax(PBT).fSValue;
    const total: number = PBT + tax;
    const category = total >= 0 ? PROFIT : LOSS;
    return new FSCategoryLinePL(total * -1, null, category, true);
  }

  calculateBalanceSheetCategory(category: FSCategoryBS) {
    let total: number = 0;
    let id: string;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === category.categoryName) {
        total = obj.value / 100;
        id = obj._id;
      }
    });
    return new FSCategoryLineBS(total, id, category);
  }

  calculateFixedAssets(
    intAssets: FSCategoryLineBS | null,
    tAssets: FSCategoryLineBS | null,
    fixAssInvs: FSCategoryLineBS | null,
    invProp: FSCategoryLineBS | null
  ) {
    let IFA = intAssets ? intAssets.numberValue : this.calculateBalanceSheetCategory(IFA_CAT).numberValue;
    let TFA = tAssets ? tAssets.numberValue : this.calculateBalanceSheetCategory(TFA_CAT).numberValue;
    let FAI = fixAssInvs ? fixAssInvs.numberValue : this.calculateBalanceSheetCategory(FAI_CAT).numberValue;
    let IP = invProp ? invProp.numberValue : this.calculateBalanceSheetCategory(IP_CAT).numberValue;
    const total = IFA + TFA + FAI + IP;
    return new FSCategoryLineBS(total, null, TOTAL_QUASI_CAT);
  }

  calculateCurrentAssets(
    stocks: FSCategoryLineBS | null,
    debtors: FSCategoryLineBS | null,
    finAssets: FSCategoryLineBS | null,
    cash: FSCategoryLineBS | null
  ) {
    let INV = stocks ? stocks.numberValue : this.calculateBalanceSheetCategory(STOCKS_CAT).numberValue;
    let DRS = debtors ? debtors.numberValue : this.calculateBalanceSheetCategory(DEBTORS_CAT).numberValue;
    let FA = finAssets ? finAssets.numberValue : this.calculateBalanceSheetCategory(FIN_ASS_CAT).numberValue;
    let bank = cash ? cash.numberValue : this.calculateBalanceSheetCategory(CASH_CAT).numberValue;
    const total = INV + DRS + FA + bank;
    return new FSCategoryLineBS(total, null, SUBTOTAL_QUASI_CAT);
  }

  calculateCurrentLiabilities(shortTermCreds: FSCategoryLineBS | null) {
    const STC = shortTermCreds ? shortTermCreds.rawValue : this.calculateBalanceSheetCategory(ST_CRED_CAT).rawValue;
    return new FSCategoryLineBS(STC, null, SUBTOTAL_QUASI_CAT);
  }

  calculateNCA(currentAssets: FSCategoryLineBS | null, currentLiabs: FSCategoryLineBS | null) {
    const CA = currentAssets
      ? currentAssets.numberValue
      : this.calculateCurrentAssets(null, null, null, null).numberValue;
    const CL = currentLiabs ? currentLiabs.numberValue : this.calculateCurrentLiabilities(null).numberValue;
    const total = CA + CL;
    return new FSCategoryLineBS(total, null, NCA_CAT);
  }

  calculateTALCL(fixedAssets: FSCategoryLineBS | null, netCurrAssets: FSCategoryLineBS | null) {
    const FA = fixedAssets ? fixedAssets.numberValue : this.calculateFixedAssets(null, null, null, null).numberValue;
    const NCA = netCurrAssets ? netCurrAssets.numberValue : this.calculateNCA(null, null).numberValue;
    const total = FA + NCA;
    return new FSCategoryLineBS(total, null, TALCL_CAT);
  }

  calculateNetAssets(
    totalAssetsLessCL: FSCategoryLineBS | null,
    longTermCred: FSCategoryLineBS | null,
    provisions: FSCategoryLineBS | null
  ) {
    const TALCL = totalAssetsLessCL ? totalAssetsLessCL.numberValue : this.calculateTALCL(null, null).numberValue;
    const LTC = longTermCred ? longTermCred.numberValue : this.calculateBalanceSheetCategory(LT_CRED_CAT).numberValue;
    const prov = provisions ? provisions.numberValue : this.calculateBalanceSheetCategory(PROVS_CAT).numberValue;
    const total = TALCL + LTC + prov;
    return new FSCategoryLineBS(total, null, NA_CAT);
  }

  calculatePLRes() {
    const CY = this.calculateProfit(null, null).fSValue;
    let reserve = 0;
    this.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === "Profit & loss reserve") reserve = (obj.value / 100) * -1;
    });
    const total = CY + reserve;
    return new FSCategoryLineBS(total, null, PL_RES_CAT);
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
    const SC = shareCap ? shareCap.numberValue : this.calculateBalanceSheetCategory(SHARE_CAP_CAT).numberValue;
    const SP = sharePrem ? sharePrem.numberValue : this.calculateBalanceSheetCategory(SHARE_PREM_CAT).numberValue;
    const CRR = capRedRes ? capRedRes.numberValue : this.calculateBalanceSheetCategory(CAP_RED_RES_CAT).numberValue;
    const FVR = fairValRes ? fairValRes.numberValue : this.calculateBalanceSheetCategory(FV_RES_CAT).numberValue;
    const OR1 = otherRes1 ? otherRes1.numberValue : this.calculateBalanceSheetCategory(OR1_CAT).numberValue;
    const OR2 = otherRes2 ? otherRes2.numberValue : this.calculateBalanceSheetCategory(OR2_CAT).numberValue;
    const OR3 = otherRes3 ? otherRes3.numberValue : this.calculateBalanceSheetCategory(OR3_CAT).numberValue;
    const OR4 = otherRes4 ? otherRes4.numberValue : this.calculateBalanceSheetCategory(OR4_CAT).numberValue;
    const OR5 = otherRes5 ? otherRes5.numberValue : this.calculateBalanceSheetCategory(OR5_CAT).numberValue;
    const MI = minorityInt ? minorityInt.numberValue : this.calculateBalanceSheetCategory(MI_CAT).numberValue;
    const PLR = profLossRes ? profLossRes.numberValue : this.calculatePLRes().numberValue;
    const total = SC + SP + CRR + FVR + OR1 + OR2 + OR3 + OR4 + OR5 + MI + PLR;
    return new FSCategoryLineBS(total, null, EQUITY_CAT);
  }

  getPLAccount() {
    const pLArray: FSCategoryLinePL[] = [];
    const turnover = this.calculateProfLossCategory(TO_CAT);
    turnover.rawValue !== 0 && pLArray.push(turnover);
    const COS = this.calculateProfLossCategory(COS_CAT);
    COS.rawValue !== 0 && pLArray.push(COS);
    const OOI = this.calculateProfLossCategory(OOI_CAT);
    OOI.rawValue !== 0 && pLArray.push(OOI);
    const VA = this.calculateProfLossCategory(VAL_ADJ_CAT);
    VA.rawValue !== 0 && pLArray.push(VA);
    const GP = this.calculateGrossProfit(turnover.fSValue, COS.fSValue, OOI.fSValue, VA.fSValue);
    pLArray.push(GP);
    const DC = this.calculateProfLossCategory(DIST_COSTS_CAT);
    DC.rawValue !== 0 && pLArray.push(DC);
    const AE = this.calculateProfLossCategory(ADMIN_EXES_CAT);
    AE.rawValue !== 0 && pLArray.push(AE);
    const opProf = this.calculateOperatingProfit(GP.fSValue, DC.fSValue, AE.fSValue);
    pLArray.push(opProf);
    const PLOA = this.calculateProfOnOrdActs(opProf.fSValue);
    pLArray.push(PLOA);
    const intRec = this.calculateProfLossCategory(INT_REC_CAT);
    intRec.rawValue !== 0 && pLArray.push(intRec);
    const PBIT = this.calculatePBIT(opProf.fSValue, intRec.fSValue);
    pLArray.push(PBIT);
    const intPay = this.calculateProfLossCategory(INT_PAY_CAT);
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
    const IFA = this.calculateBalanceSheetCategory(IFA_CAT);
    const TFA = this.calculateBalanceSheetCategory(TFA_CAT);
    const FAI = this.calculateBalanceSheetCategory(FAI_CAT);
    const IP = this.calculateBalanceSheetCategory(IP_CAT);
    const fixedAssets = this.calculateFixedAssets(IFA, TFA, FAI, IP);
    if (IFA.rawValue !== 0 || TFA.rawValue !== 0 || FAI.rawValue !== 0 || IP.rawValue !== 0) {
      bSArray.push(new FSCategoryLineBS("", null, FIXED_ASS_CAT));
      IFA.rawValue !== 0 && bSArray.push(IFA);
      TFA.rawValue !== 0 && bSArray.push(TFA);
      FAI.rawValue !== 0 && bSArray.push(FAI);
      IP.rawValue !== 0 && bSArray.push(IP);
      bSArray.push(fixedAssets);
    }
    const stocks = this.calculateBalanceSheetCategory(STOCKS_CAT);
    const debtors = this.calculateBalanceSheetCategory(DEBTORS_CAT);
    const finAss = this.calculateBalanceSheetCategory(FIN_ASS_CAT);
    const cash = this.calculateBalanceSheetCategory(CASH_CAT);
    const currAssets = this.calculateCurrentAssets(stocks, debtors, finAss, cash);
    if (stocks.rawValue !== 0 || debtors.rawValue !== 0 || finAss.rawValue !== 0 || cash.rawValue !== 0) {
      bSArray.push(new FSCategoryLineBS("", null, CURR_ASS_CAT));
      stocks.rawValue !== 0 && bSArray.push(stocks);
      debtors.rawValue !== 0 && bSArray.push(debtors);
      finAss.rawValue !== 0 && bSArray.push(finAss);
      cash.rawValue !== 0 && bSArray.push(cash);
      bSArray.push(currAssets);
    }
    const STC = this.calculateBalanceSheetCategory(ST_CRED_CAT);
    const currLiabs = this.calculateCurrentLiabilities(STC);
    if (STC.rawValue !== 0) {
      bSArray.push(new FSCategoryLineBS("", null, CURR_LIA_CAT));
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
    const LTC = this.calculateBalanceSheetCategory(LT_CRED_CAT);
    LTC.rawValue !== 0 && bSArray.push(LTC);
    const provisions = this.calculateBalanceSheetCategory(PROVS_CAT);
    provisions.rawValue !== 0 && bSArray.push(provisions);
    const netAssets = this.calculateNetAssets(tALessCL, LTC, provisions);
    bSArray.push(netAssets);
    bSArray.push(new FSCategoryLineBS("", null, CAP_RES_CAT));
    const shareCap = this.calculateBalanceSheetCategory(SHARE_CAP_CAT);
    shareCap.rawValue !== 0 && bSArray.push(shareCap);
    const sharePrem = this.calculateBalanceSheetCategory(SHARE_PREM_CAT);
    sharePrem.rawValue !== 0 && bSArray.push(sharePrem);
    const CRR = this.calculateBalanceSheetCategory(CAP_RED_RES_CAT);
    CRR.rawValue !== 0 && bSArray.push(CRR);
    const FVR = this.calculateBalanceSheetCategory(FV_RES_CAT);
    FVR.rawValue !== 0 && bSArray.push(FVR);
    const OR1 = this.calculateBalanceSheetCategory(OR1_CAT);
    OR1.rawValue !== 0 && bSArray.push(OR1);
    const OR2 = this.calculateBalanceSheetCategory(OR2_CAT);
    OR2.rawValue !== 0 && bSArray.push(OR2);
    const OR3 = this.calculateBalanceSheetCategory(OR3_CAT);
    OR3.rawValue !== 0 && bSArray.push(OR3);
    const OR4 = this.calculateBalanceSheetCategory(OR4_CAT);
    OR4.rawValue !== 0 && bSArray.push(OR4);
    const OR5 = this.calculateBalanceSheetCategory(OR5_CAT);
    OR5.rawValue !== 0 && bSArray.push(OR5);
    const MI = this.calculateBalanceSheetCategory(MI_CAT);
    MI.rawValue !== 0 && bSArray.push(MI);
    const profLossRes = this.calculatePLRes();
    profLossRes.rawValue !== 0 && bSArray.push(profLossRes);
    const equity = this.calculateTotalEquity(shareCap, sharePrem, CRR, FVR, OR1, OR2, OR3, OR4, OR5, MI, profLossRes);
    bSArray.push(equity);
    return bSArray;
  }
}
