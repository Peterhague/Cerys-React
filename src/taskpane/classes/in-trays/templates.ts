import { reconcileClientBFTB } from "../../client-data-processing/nominal-ledger";
import { ClientTBLineProps, InTrayCollectionProps } from "../../interfaces/interfaces";
import { checkTransUnregisteredAssets } from "../../utils/transactions/asset-reg-generation";
import { AssetRegCreationPrompt, IdenitfyPossibleAdditionsPrompt, RegisterCreationTemplate } from "../asset-register";
import { Session } from "../session";
import { NominalLedgerEntryPrompt } from "../trial-balance";
import { InTray, InTrayCollection, InTrayItem } from "./global";

export class InTrayTemplate {
  type: "Assignment" | "TrialBalanceEntry" | "NominalLedgerEntry" | "AssetRegister";
  title: string;
  collections: InTrayCollection[];
  constructor(type: "Assignment" | "TrialBalanceEntry" | "NominalLedgerEntry" | "AssetRegister", title: string) {
    this.type = type;
    this.title = title;
    this.collections = [];
  }
}

export class InTrayAssignment extends InTrayTemplate {
  constructor() {
    super("Assignment", "Assignment In Tray");
  }
}

// export class InTrayTrialBalanceEntry extends InTrayTemplate {
//   constructor(session: Session) {
//     super("TrialBalanceEntry", "Trial Balance Entry In Tray");
//     const collection = new InTrayCollection();
//     const nLEntryPrompt = !session.assignment.NLEntered && new NominalLedgerEntryPrompt(collection);
//     nLEntryPrompt && collection.items.push(nLEntryPrompt);
//     collection.items.length > 0 && this.collections.push(collection);
//   }
// }

export const createTBEntryCollections = (session: Session) => {
  const collections: InTrayCollection[] = [];
  const inTrayCollectionProps: InTrayCollectionProps = {
    title: "Nominal Ledger Entry Prompt",
    itemsAction: getItemsNLPromptCollection,
    itemsActionParams: [],
  };
  const nomLedgerPromptCollection = new InTrayCollection(inTrayCollectionProps);
  // const nLEntryPrompt = !session.assignment.NLEntered && new NominalLedgerEntryPrompt();
  // if (nLEntryPrompt) {
  //   collection.items.push(nLEntryPrompt);
  //   collections.push(collection);
  // }
  if (nomLedgerPromptCollection.getItems(session).length > 0) collections.push(nomLedgerPromptCollection);
  return collections;
};

export const getItemsNLPromptCollection = (session: Session) => {
  const prompt = !session.assignment.NLEntered && new NominalLedgerEntryPrompt();
  return [prompt];
};

export const createNLEntryCollections = (session: Session, openingBalances: ClientTBLineProps[]) => {
  const collections: InTrayCollection[] = [];
  const opBalsCollectionProps: InTrayCollectionProps = {
    title: "Opening Balances Not Reconciled",
    itemsAction: getItemsOpBalsNotReconciledCollection,
    itemsActionParams: [openingBalances],
  };
  collections.push(new InTrayCollection(opBalsCollectionProps));
  const parentInTray = session.assignment.inTray;
  const assetRegCollections: InTrayCollection = createAssetRegistersInTray(parentInTray);
  collections.push(assetRegCollections);
  return collections;
};

const getItemsOpBalsNotReconciledCollection = (session: Session, openingBalances: ClientTBLineProps[]) => {
  const openingBalancesRec = session.clientBFwdTB.length > 0 && reconcileClientBFTB(session, openingBalances);
  return openingBalancesRec ? [openingBalancesRec] : [];
};

export const createAssetRegistersInTray = (parentInTray: InTray) => {
  const inTrayCollectionProps: InTrayCollectionProps = {
    title: "Fixed Asset Registers",
    itemsAction: createAssetRegistersInTrayCollections,
    itemsActionParams: [parentInTray],
  };
  const assRegCollection = new InTrayCollection(inTrayCollectionProps);
  return assRegCollection;
};

export const createAssetRegistersInTrayCollections = (session: Session, parentInTray: InTray) => {
  const registerPrompts = checkTransUnregisteredAssets(session);
  const assRegTemplate = registerPrompts.length > 0 && new InTrayAssetRegister(registerPrompts);
  const inTray = new InTray(assRegTemplate, parentInTray);
  return [inTray];
};

// export class InTrayNominalLedgerEntry extends InTrayTemplate {
//   constructor(session: Session, openingBalances: ClientTBLineProps[]) {
//     super("NominalLedgerEntry", "Nominal Ledger Entry In Tray");
//     this.createOpeningBalancesCollection(session, openingBalances);
//     this.createAssetRegistersCollections(session);
//   }

//   createOpeningBalancesCollection(session: Session, openingBalances: ClientTBLineProps[]) {
//     const opBalCollection = new InTrayCollection("Opening Balances");
//     const openingBalancesRec =
//       session.clientBFwdTB.length > 0 && reconcileClientBFTB(session, openingBalances, opBalCollection);
//     openingBalancesRec && opBalCollection.items.push(openingBalancesRec);
//     opBalCollection.items.length > 0 && this.collections.push(opBalCollection);
//   }

//   createAssetRegistersCollections(session: Session) {
//     const assRegCollection = new InTrayCollection("Fixed Asset Registers");
//     const registerPrompts = checkTransUnregisteredAssets(session);
//     const assRegTemplate = registerPrompts.length > 0 && new InTrayAssetRegister(registerPrompts);
//     console.log(assRegTemplate);
//     assRegCollection.items.push(new InTray(assRegTemplate));
//     this.collections.push(assRegCollection);
//   }
// }

export class InTrayAssetRegister extends InTrayTemplate {
  prompts: RegisterCreationTemplate[];
  constructor(prompts: RegisterCreationTemplate[]) {
    super("AssetRegister", "Asset Register");
    console.log(prompts);
    this.prompts = prompts;
    const collections = prompts.map((prompt) => {
      const title = prompt.register.longCap;
      const inTrayCollectionProps: InTrayCollectionProps = {
        title,
        itemsAction: createAssetRegisterInTrayCollections,
        itemsActionParams: [prompt.registerType],
      };
      const coll = new InTrayCollection(inTrayCollectionProps);
      return coll;
    });
    this.collections.push(...collections);
  }
}

export const createAssetRegisterInTrayCollections = (session: Session, registerType: "IFA" | "TFA" | "IP") => {
  console.log("creating register intray items...");
  const items: InTrayItem[] = [];
  const prompts = checkTransUnregisteredAssets(session);
  const prompt = prompts.find((i) => (i.registerType = registerType));
  if (prompt.refinedTransactions.length > 0) {
    console.log("REFINED TRANSACTIONS!!!!");
    console.log(prompt.refinedTransactions);
  }
  if (prompt.possibleAdditions.length > 0) items.push(new IdenitfyPossibleAdditionsPrompt(prompt));
  if (prompt.refinedTransactions.length > 0) items.push(new AssetRegCreationPrompt(prompt));
  return items;
};
