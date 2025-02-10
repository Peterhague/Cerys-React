import {
  createIFARegister,
  createIPRegister,
  createTFARegister,
  updateIFARegister,
  updateIPRegister,
  updateTFARegister,
} from "../fetching/apiEndpoints";
import { RegisterType } from "../interfaces/interfaces";

export const IFARegister: RegisterType = {
  initials: "IFA",
  longLower: "intangible fixed assets",
  longCap: "Intangible Fixed Assets",
  registerType: "Intangible",
  sessionKey: "IFARegister",
  createURL: createIFARegister,
  updateURL: updateIFARegister,
  // createRegister: async (a: Session, b: AssetTransaction[]) => createIFAR(a, b),
};

export const TFARegister: RegisterType = {
  initials: "TFA",
  longLower: "tangible fixed assets",
  longCap: "Tangible Fixed Assets",
  registerType: "Tangible",
  sessionKey: "TFARegister",
  createURL: createTFARegister,
  updateURL: updateTFARegister,
  // createRegister: async (a: Session, b: AssetTransaction[]) => createTFAR(a, b),
};

export const IPRegister: RegisterType = {
  initials: "IP",
  longLower: "investment property",
  longCap: "Investment Property",
  registerType: "Investment property",
  sessionKey: "IPRegister",
  createURL: createIPRegister,
  updateURL: updateIPRegister,
  // createRegister: async (a: Session, b: AssetTransaction[]) => createIPR(a, b),
};

export const registerTypes: { IFA: RegisterType; TFA: RegisterType; IP: RegisterType } = {
  IFA: IFARegister,
  TFA: TFARegister,
  IP: IPRegister,
};

export const getAssetRegisterType = (nextRegisterPrompt: "IFA" | "TFA" | "IP") => {
  return registerTypes[nextRegisterPrompt];
};
