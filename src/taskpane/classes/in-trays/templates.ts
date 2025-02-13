import { reconcileClientBFTB } from "../../client-data-processing/nominal-ledger";
import { ClientTBLineProps, InTrayCollectionProps } from "../../interfaces/interfaces";
import { checkTransUnregisteredAssets } from "../../utils/transactions/asset-reg-generation";
import { AssetRegCreationPrompt, IdenitfyPossibleAdditionsPrompt, AssetRegisterPromptDetails } from "../asset-register";
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

export const createTBEntryCollections = (session: Session) => {
  const collections: InTrayCollection[] = [];
  const inTrayCollectionProps: InTrayCollectionProps = {
    title: "Nominal Ledger Entry Prompt",
    itemsAction: getItemsNLPromptCollection,
    itemsActionParams: [],
  };
  const nomLedgerPromptCollection = new InTrayCollection(inTrayCollectionProps);
  if (nomLedgerPromptCollection.getItems(session).length > 0) collections.push(nomLedgerPromptCollection);
  return collections;
};

export const getItemsNLPromptCollection = (session: Session) => {
  const prompt = !session.assignment.NLEntered && new NominalLedgerEntryPrompt();
  return prompt;
};

// returns the InTrayCollections that are potentially added to the assignment intray on posting of a client
// nominal ledger.
export const createNLEntryCollections = (session: Session, openingBalances: ClientTBLineProps[]) => {
  const collections: InTrayCollection[] = [];
  const opBalsCollectionProps: InTrayCollectionProps = {
    title: "Opening Balances Not Reconciled",
    itemsAction: getItemsOpBalsNotReconciledCollection,
    itemsActionParams: [openingBalances],
  };
  collections.push(new InTrayCollection(opBalsCollectionProps));
  const parentInTray = session.inTray;
  const assetRegCollection: InTrayCollection = createAssetRegGlobalCollection(parentInTray);
  collections.push(assetRegCollection);
  return collections;
};

const getItemsOpBalsNotReconciledCollection = (session: Session, openingBalances: ClientTBLineProps[]) => {
  const openingBalancesRec = session.clientBFwdTB.length > 0 && reconcileClientBFTB(session, openingBalances);
  return openingBalancesRec;
};

// called on posting of client NL and returns to the assignment intray the collection for prompting
// various asset reg related actions
export const createAssetRegGlobalCollection = (parentInTray: InTray) => {
  const inTrayCollectionProps: InTrayCollectionProps = {
    title: "Fixed Asset Registers",
    itemsAction: createAssetRegistersInTrays,
    itemsActionParams: [parentInTray],
  };
  const assRegCollection = new InTrayCollection(inTrayCollectionProps);
  return assRegCollection;
};

// returns to the assignment intray an array of collection items which themselves generate specific
// asset reg child intrays
export const createAssetRegistersInTrays = (session: Session, parentInTray: InTray) => {
  const registerPromptsDetails = checkTransUnregisteredAssets(session);
  console.log(registerPromptsDetails);
  // const assRegTemplate = registerPromptsDetails.length > 0 && new InTrayAssetRegisterTemplate(registerPromptsDetails);
  // const inTray = new InTray(assRegTemplate, parentInTray);
  const inTrays =
    registerPromptsDetails.length > 0 &&
    registerPromptsDetails.map(
      (promptDetails) => new InTray(new InTrayAssetRegisterTemplate(promptDetails), parentInTray)
    );
  return inTrays;
};

export class InTrayAssetRegisterTemplate extends InTrayTemplate {
  prompt: AssetRegisterPromptDetails;
  constructor(prompt: AssetRegisterPromptDetails) {
    super("AssetRegister", "Asset Register");
    this.prompt = prompt;
    // const collections = prompts.map((prompt) => {
    //   const title = prompt.register.longCap;
    //   const inTrayCollectionProps: InTrayCollectionProps = {
    //     title,
    //     itemsAction: createAssetRegisterInTrayCollections,
    //     itemsActionParams: [prompt.registerType],
    //   };
    //   const coll = new InTrayCollection(inTrayCollectionProps);
    //   return coll;
    // });
    const inTrayCollectionProps: InTrayCollectionProps = {
      title: prompt.register.longCap,
      itemsAction: createAssetRegisterInTrayCollections,
      itemsActionParams: [prompt.registerType],
    };
    this.collections.push(new InTrayCollection(inTrayCollectionProps));
  }
}

// called by the asset reg intrays' getItems() method to return the active items for that particular
// intray
export const createAssetRegisterInTrayCollections = (session: Session, registerType: "IFA" | "TFA" | "IP") => {
  const items: InTrayItem[] = [];
  const assetRegDetails = new AssetRegisterPromptDetails(session, registerType);
  if (assetRegDetails.possibleAdditions.length > 0) items.push(new IdenitfyPossibleAdditionsPrompt(assetRegDetails));
  if (assetRegDetails.refinedTransactions.length > 0) items.push(new AssetRegCreationPrompt(assetRegDetails));
  return items;
};
