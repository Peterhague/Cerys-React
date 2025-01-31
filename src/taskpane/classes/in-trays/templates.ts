import { reconcileClientBFTB } from "../../client-data-processing/nominal-ledger";
import { ClientTBLineProps, DetailedTransaction } from "../../interfaces/interfaces";
import { checkTransUnregisteredAssets } from "../../utils/transactions/asset-reg-generation";
import { AssetRegCreationPrompt, RegisterCreationTemplate } from "../asset-register";
import { Session } from "../session";
import { NominalLedgerEntryPrompt } from "../trial-balance";
import { InTray, InTrayCollection } from "./global";

export class InTrayTemplate {
  type: "Assignment" | "TrialBalanceEntry" | "NominalLedgerEntry" | "AssetRegister";
  title: string;
  collections: InTrayCollection[];
  constructor(
    type: "Assignment" | "TrialBalanceEntry" | "NominalLedgerEntry" | "AssetRegister",
    title: string,
    collections: InTrayCollection[]
  ) {
    this.type = type;
    this.title = title;
    this.collections = collections;
  }
}

export class InTrayAssignment extends InTrayTemplate {
  constructor() {
    super("Assignment", "Assignment In Tray", []);
  }
}

export class InTrayTrialBalanceEntry extends InTrayTemplate {
  constructor(session: Session) {
    const collection = new InTrayCollection();
    const nLEntryPrompt = !session.assignment.NLEntered && new NominalLedgerEntryPrompt(collection);
    nLEntryPrompt && collection.items.push(nLEntryPrompt);
    super("TrialBalanceEntry", "Trial Balance Entry In Tray", [collection]);
  }
}

export class InTrayNominalLedgerEntry extends InTrayTemplate {
  constructor(session: Session, openingBalances: ClientTBLineProps[]) {
    const opBalCollection = new InTrayCollection("Opening Balances");
    const openingBalancesRec =
      session.clientBFwdTB.length > 0 && reconcileClientBFTB(session, openingBalances, opBalCollection);
    openingBalancesRec && opBalCollection.items.push(openingBalancesRec);
    const assRegCollection = new InTrayCollection("Fixed Asset Registers");
    const registerPrompts = checkTransUnregisteredAssets(session);
    const assRegTemplate = registerPrompts.length > 0 && new InTrayAssetRegister(registerPrompts);
    assRegCollection.items.push(new InTray(assRegTemplate));
    super("NominalLedgerEntry", "Nominal Ledger Entry In Tray", [opBalCollection, assRegCollection]);
  }
}

export class InTrayAssetRegister extends InTrayTemplate {
  transactions: DetailedTransaction[];
  constructor(registerPrompts: RegisterCreationTemplate[]) {
    const collection = new InTrayCollection();
    console.log(registerPrompts);
    registerPrompts.forEach((i) => collection.items.push(new AssetRegCreationPrompt(i, collection)));
    super("AssetRegister", "Asset Register In Tray", [collection]);
  }
}

// identifyPossibleAdditions() {
//   const filteredArr = registerPrompts.transactions.filter((tran) => {
//     let test: number;
//     if (!tran.processedAsAsset) {
//       const cerysCodeObj = tran.getCerysCodeObj(session);
//       if (
//         (registerType === "IFA" &&
//           cerysCodeObj.cerysCategory === "Intangible assets" &&
//           cerysCodeObj.assetCodeType === "iFACostBF") ||
//         (registerType === "TFA" &&
//           cerysCodeObj.cerysCategory === "Tangible assets" &&
//           cerysCodeObj.assetCodeType === "tFACostBF") ||
//         (registerType === "IP" &&
//           cerysCodeObj.cerysCategory === "Investment property" &&
//           cerysCodeObj.assetCodeType === "iPCostBF")
//       ) {
//         test = calculateDiffInDays(session.assignment.reportingPeriod.periodStart, tran.transactionDate);
//       }
//     }
//     return test > 0;
//   });
//   return filteredArr.map((tran) => new AssetTransaction(session, tran));
// }
