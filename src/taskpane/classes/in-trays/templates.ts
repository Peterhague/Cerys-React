import { reconcileClientBFTB } from "../../client-data-processing/nominal-ledger";
import { ClientTBLineProps } from "../../interfaces/interfaces";
import { checkTransUnregisteredAssets } from "../../utils/transactions/asset-reg-generation";
import { AssetRegCreationPrompt, IdenitfyPossibleAdditionsPrompt, RegisterCreationTemplate } from "../asset-register";
import { Session } from "../session";
import { NominalLedgerEntryPrompt } from "../trial-balance";
import { InTray, InTrayCollection } from "./global";

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

export class InTrayTrialBalanceEntry extends InTrayTemplate {
  constructor(session: Session) {
    super("TrialBalanceEntry", "Trial Balance Entry In Tray");
    const collection = new InTrayCollection();
    const nLEntryPrompt = !session.assignment.NLEntered && new NominalLedgerEntryPrompt(collection);
    nLEntryPrompt && collection.items.push(nLEntryPrompt);
    collection.items.length > 0 && this.collections.push(collection);
  }
}

export class InTrayNominalLedgerEntry extends InTrayTemplate {
  constructor(session: Session, openingBalances: ClientTBLineProps[]) {
    super("NominalLedgerEntry", "Nominal Ledger Entry In Tray");
    this.createOpeningBalancesCollection(session, openingBalances);
    this.createAssetRegistersCollections(session);
  }

  createOpeningBalancesCollection(session: Session, openingBalances: ClientTBLineProps[]) {
    const opBalCollection = new InTrayCollection("Opening Balances");
    const openingBalancesRec =
      session.clientBFwdTB.length > 0 && reconcileClientBFTB(session, openingBalances, opBalCollection);
    openingBalancesRec && opBalCollection.items.push(openingBalancesRec);
    opBalCollection.items.length > 0 && this.collections.push(opBalCollection);
  }

  createAssetRegistersCollections(session: Session) {
    const assRegCollection = new InTrayCollection("Fixed Asset Registers");
    const registerPrompts = checkTransUnregisteredAssets(session);
    const assRegTemplate = registerPrompts.length > 0 && new InTrayAssetRegister(registerPrompts);
    console.log(assRegTemplate);
    assRegCollection.items.push(new InTray(assRegTemplate));
    this.collections.push(assRegCollection);
  }
}

export class InTrayAssetRegister extends InTrayTemplate {
  constructor(prompts: RegisterCreationTemplate[]) {
    super("AssetRegister", "Asset Register In Tray");
    console.log(prompts);
    const collections = prompts.map((prompt) => {
      const title = prompt.register.longCap;
      const coll = new InTrayCollection(title);
      prompt.possibleAdditions.length > 0 && coll.items.push(new IdenitfyPossibleAdditionsPrompt(prompt, coll));
      prompt.refinedTransactions.length > 0 && coll.items.push(new AssetRegCreationPrompt(prompt, coll));
      return coll;
    });
    console.log(collections);
    this.collections.push(...collections);
    console.log(this.collections);
    // console.log(registerPrompts);
    // registerPrompts.forEach((i) => collection.items.push(new AssetRegCreationPrompt(i, collection)));
  }
}
