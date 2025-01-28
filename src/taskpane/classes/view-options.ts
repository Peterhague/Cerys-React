import { RegisterType, ViewOptionsProps } from "../interfaces/interfaces";
import * as React from "react";

export class ViewOptions {
  handleYes: () => void;
  handleNo: () => void;
  message: React.ReactNode;
  yesButtonText: string;
  noButtonText: string;
  registerType: RegisterType;
  nominalCode: string | number;
  nominalCodeName: string;
  wsName: string;
  cerysCode: number;
  constructor(options: ViewOptionsProps) {
    this.handleYes = options.handleYes;
    this.handleNo = options.handleNo;
    this.message = options.message;
    this.yesButtonText = options.yesButtonText;
    this.noButtonText = options.noButtonText;
    this.registerType = options.registerType;
    this.nominalCode = options.nominalCode;
    this.nominalCodeName = options.nominalCodeName;
    this.wsName = options.wsName;
    this.cerysCode = options.cerysCode;
  }
}
