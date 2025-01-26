import { ClientCodeObjectProps, TrialBalanceLineProps } from "../interfaces/interfaces";
import { Session } from "./session";

export class TrialBalanceLine implements TrialBalanceLineProps {
  cerysCategory: string;
  cerysCode: number;
  closeOffCode: number;
  cerysName: string;
  value: number;
  assetCodeType: string;
  identifier: string;
  _id: string;
  constructor(line: TrialBalanceLineProps) {
    this.cerysCategory = line.cerysCategory;
    this.cerysCode = line.cerysCode;
    this.closeOffCode = line.closeOffCode;
    this.cerysName = line.cerysName;
    this.value = line.value;
    this.assetCodeType = line.assetCodeType;
    this.identifier = line._id;
    this._id = line._id;
  }
}

export class ClientCodeObject {
  cerysCode: number;
  clientCode: number;
  clientCodeName: string;
  statement: string;
  _id: string;
  constructor(clientCodeObj: ClientCodeObjectProps) {
    this.cerysCode = clientCodeObj.cerysCode;
    this.clientCode = clientCodeObj.clientCode;
    this.clientCodeName = clientCodeObj.clientCodeName;
    this.statement = clientCodeObj.statement;
    this._id = clientCodeObj._id;
  }

  getCerysCodeObj(session: Session) {
    return session.chart.find((i) => i.cerysCode === this.cerysCode);
  }
}
