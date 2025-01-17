import { TrialBalanceLineProps } from "../interfaces/interfaces";

export class TrialBalanceLine implements TrialBalanceLineProps {
  cerysCategory: string;
  cerysCode: number;
  closeOffCode: number;
  cerysName: string;
  value: number;
  assetCodeType: string;
  identifier: string;
  constructor(line: TrialBalanceLineProps) {
    this.cerysCategory = line.cerysCategory;
    this.cerysCode = line.cerysCode;
    this.closeOffCode = line.closeOffCode;
    this.cerysName = line.cerysName;
    this.value = line.value;
    this.assetCodeType = line.assetCodeType;
    this.identifier = line.identifier;
  }
}
