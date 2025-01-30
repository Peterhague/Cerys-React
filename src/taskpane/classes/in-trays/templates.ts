import { reconcileClientBFTB } from "../../client-data-processing/nominal-ledger";
import { ClientTBLineProps } from "../../interfaces/interfaces";
import { checkTransUnregisteredAssets } from "../../utils/transactions/asset-reg-generation";
import { AssetRegCreationPrompt, RegisterCreationTemplate } from "../asset-register";
import { Session } from "../session";
import { NominalLedgerEntryPrompt } from "../trial-balance";
import { InTray, InTrayItem } from "./global";

export class InTrayTemplate {
  type: "Assignment" | "TrialBalanceEntry" | "NominalLedgerEntry" | "AssetRegister";
  title: string;
  items: InTrayItem[];
  constructor(
    type: "Assignment" | "TrialBalanceEntry" | "NominalLedgerEntry" | "AssetRegister",
    title: string,
    items: InTrayItem[]
  ) {
    this.type = type;
    this.title = title;
    this.items = items;
  }
}

export class InTrayAssignment extends InTrayTemplate {
  constructor() {
    super("Assignment", "Assignment In Tray", []);
  }
}

export class InTrayTrialBalanceEntry extends InTrayTemplate {
  constructor(session: Session) {
    const items = [];
    const nLEntryPrompt = !session.assignment.NLEntered && new NominalLedgerEntryPrompt();
    nLEntryPrompt && items.push(nLEntryPrompt);
    super("TrialBalanceEntry", "Trial Balance Entry In Tray", items);
  }
}

export class InTrayNominalLedgerEntry extends InTrayTemplate {
  constructor(session: Session, openingBalances: ClientTBLineProps[]) {
    const items = [];
    const openingBalancesRec = session.clientBFwdTB.length > 0 && reconcileClientBFTB(session, openingBalances);
    openingBalancesRec && items.push(openingBalancesRec);
    const registerPrompts = checkTransUnregisteredAssets(session);
    const assRegTemplate = registerPrompts.length > 0 && new InTrayAssetRegister(registerPrompts);
    items.push(new InTray(assRegTemplate));
    super("NominalLedgerEntry", "Nominal Ledger Entry In Tray", items);
  }
}

export class InTrayAssetRegister extends InTrayTemplate {
  constructor(registerPrompts: RegisterCreationTemplate[]) {
    const items = [];
    registerPrompts.forEach((i) => items.push(new AssetRegCreationPrompt(i)));
    super("AssetRegister", "Asset Register In Tray", items);
  }
}
