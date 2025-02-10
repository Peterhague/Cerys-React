import { ClientCodeObjectProps, TrialBalanceLineProps } from "../interfaces/interfaces";
import { Session } from "./session";

export class TrialBalanceLine {
  cerysCategory: string;
  cerysCode: number;
  closeOffCode: number;
  cerysName: string;
  value: number;
  assetCodeType: string;
  identifier: string;
  trialBalanceLineId: string;
  constructor(line: TrialBalanceLineProps) {
    this.cerysCategory = line.cerysCategory;
    this.cerysCode = line.cerysCode;
    this.closeOffCode = line.closeOffCode;
    this.cerysName = line.cerysName;
    this.value = line.value;
    this.assetCodeType = line.assetCodeType;
    this.identifier = line._id;
    this.trialBalanceLineId = line._id;
  }

  getCorrespondingClientCode(session: Session) {
    return session.chart.find((code) => code.cerysCode === this.cerysCode).currentClientMapping.clientCode;
  }

  getCerysCodeObj(session: Session) {
    return session.chart.find((codeObj) => codeObj.cerysCode === this.cerysCode);
  }
}

export class ClientCodeObject {
  cerysCode: number;
  clientCode: number;
  clientCodeName: string;
  statement: string;
  clientCodeObjectId: string;
  constructor(clientCodeObj: ClientCodeObjectProps) {
    this.cerysCode = clientCodeObj.cerysCode;
    this.clientCode = clientCodeObj.clientCode;
    this.clientCodeName = clientCodeObj.clientCodeName;
    this.statement = clientCodeObj.statement;
    this.clientCodeObjectId = clientCodeObj._id;
  }

  getCerysCodeObj(session: Session) {
    return session.chart.find((i) => i.cerysCode === this.cerysCode);
  }
}
