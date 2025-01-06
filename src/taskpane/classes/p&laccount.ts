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
    this.turnover = assignment.calculateTurnover();
    this.COS = assignment.calculateCOS();
    this.otherOpIncome = assignment.calculateOOI();
    this.distCosts = assignment.calculateDistCosts();
    this.adminExes = assignment.calculateAdminExes();
    this.valAdjs = assignment.calculateAdjsFAAndCAI();
    this.intRec = assignment.calculateOtherIntRec();
    this.intPayable = assignment.calculateintPay();
    this.tax = assignment.calculateTax();
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
    this.turnover = assignment.calculateTurnover() * -1;
    this.COS = assignment.calculateCOS() * -1;
    this.otherOpIncome = assignment.calculateOOI() * -1;
    this.distCosts = assignment.calculateDistCosts() * -1;
    this.adminExes = assignment.calculateAdminExes() * -1;
    this.valAdjs = assignment.calculateAdjsFAAndCAI() * -1;
    this.intRec = assignment.calculateOtherIntRec() * -1;
    this.intPayable = assignment.calculateintPay() * -1;
    this.tax = assignment.calculateTax() * -1;
  }
}
