import { Session } from "../classes/session";
import { DetailedTransaction, RegisterType } from "../interfaces/interfaces";
import { createIFAR } from "../utils/transactions/ifar-generation";
import { createIPR } from "../utils/transactions/ipr-generation";
import { createTFAR } from "../utils/transactions/tfar-generation";
/* global Excel */

export const IFARegister: RegisterType = {
  initials: "IFA",
  longLower: "intangible fixed assets",
  longCap: "Intangible Fixed Assets",
  createRegister: async (a: Excel.RequestContext, b: Session, c: DetailedTransaction[]) => createIFAR(a, b, c),
};

export const TFARegister: RegisterType = {
  initials: "TFA",
  longLower: "tangible fixed assets",
  longCap: "Tangible Fixed Assets",
  createRegister: async (a: Excel.RequestContext, b: Session, c: DetailedTransaction[]) => createTFAR(a, b, c),
};

export const IPRegister: RegisterType = {
  initials: "IP",
  longLower: "investment property",
  longCap: "Investment Property",
  createRegister: async (a: Excel.RequestContext, b: Session, c: DetailedTransaction[]) => createIPR(a, b, c),
};

export const registerTypes: { IFA: RegisterType; TFA: RegisterType; IP: RegisterType } = {
  IFA: IFARegister,
  TFA: TFARegister,
  IP: IPRegister,
};

export const getAssetRegisterType = (nextRegisterPrompt: "IFA" | "TFA" | "IP") => {
  return registerTypes[nextRegisterPrompt];
};
