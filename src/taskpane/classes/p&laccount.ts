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
    this.turnover = assignment.calculateTurnover().rawValue;
    this.COS = assignment.calculateCOS().rawValue;
    this.otherOpIncome = assignment.calculateOOI().rawValue;
    this.distCosts = assignment.calculateDistCosts().rawValue;
    this.adminExes = assignment.calculateAdminExes().rawValue;
    this.valAdjs = assignment.calculateAdjsFAAndCAI().rawValue;
    this.intRec = assignment.calculateOtherIntRec().rawValue;
    this.intPayable = assignment.calculateintPay().rawValue;
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
    this.turnover = assignment.calculateTurnover().fSValue;
    this.COS = assignment.calculateCOS().fSValue;
    this.otherOpIncome = assignment.calculateOOI().fSValue;
    this.distCosts = assignment.calculateDistCosts().fSValue;
    this.adminExes = assignment.calculateAdminExes().fSValue;
    this.valAdjs = assignment.calculateAdjsFAAndCAI().fSValue;
    this.intRec = assignment.calculateOtherIntRec().fSValue;
    this.intPayable = assignment.calculateintPay().fSValue;
    this.tax = assignment.calculateTax(null).fSValue;
  }
}
