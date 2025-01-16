import {
  ADMIN_EXES_CAT,
  COS_CAT,
  DIST_COSTS_CAT,
  INT_PAY_CAT,
  INT_REC_CAT,
  OOI_CAT,
  TO_CAT,
  VAL_ADJ_CAT,
} from "../static-values/accounts-categories-pl";
import { Session } from "./session";

export class CalcSwtiches {
  calcOpProf: boolean;
  calcOrdActs: boolean;
  calcPBIT: boolean;
  calcPBT: boolean;
  constructor() {
    this.calcOpProf = false;
    this.calcOrdActs = false;
    this.calcPBIT = false;
    this.calcPBT = false;
  }
}

export class ProfLossFigures {
  turnover: number;
  COS: number;
  otherOpIncome: number;
  distCosts: number;
  adminExes: number;
  valAdjs: number;
  intRec: number;
  intPayable: number;
  tax: number;
  constructor(session: Session) {
    const assignment = session.assignment;
    this.turnover = assignment.calculateProfLossCategory(TO_CAT).rawValue;
    this.COS = assignment.calculateProfLossCategory(COS_CAT).rawValue;
    this.otherOpIncome = assignment.calculateProfLossCategory(OOI_CAT).rawValue;
    this.distCosts = assignment.calculateProfLossCategory(DIST_COSTS_CAT).rawValue;
    this.adminExes = assignment.calculateProfLossCategory(ADMIN_EXES_CAT).rawValue;
    this.valAdjs = assignment.calculateProfLossCategory(VAL_ADJ_CAT).rawValue;
    this.intRec = assignment.calculateProfLossCategory(INT_REC_CAT).rawValue;
    this.intPayable = assignment.calculateProfLossCategory(INT_PAY_CAT).rawValue;
    this.tax = assignment.calculateTax(null).rawValue;
  }
}

export class ReversedProfLossFigures {
  turnover: number;
  COS: number;
  otherOpIncome: number;
  distCosts: number;
  adminExes: number;
  valAdjs: number;
  intRec: number;
  intPayable: number;
  tax: number;
  constructor(session: Session) {
    const assignment = session.assignment;
    this.turnover = assignment.calculateProfLossCategory(TO_CAT).rawValue;
    this.COS = assignment.calculateProfLossCategory(COS_CAT).rawValue;
    this.otherOpIncome = assignment.calculateProfLossCategory(OOI_CAT).rawValue;
    this.distCosts = assignment.calculateProfLossCategory(DIST_COSTS_CAT).rawValue;
    this.adminExes = assignment.calculateProfLossCategory(ADMIN_EXES_CAT).rawValue;
    this.valAdjs = assignment.calculateProfLossCategory(VAL_ADJ_CAT).rawValue;
    this.intRec = assignment.calculateProfLossCategory(INT_REC_CAT).rawValue;
    this.intPayable = assignment.calculateProfLossCategory(INT_PAY_CAT).rawValue;
    this.tax = assignment.calculateTax(null).fSValue;
  }
}
