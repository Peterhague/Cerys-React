import { reconcileClientBFTB } from "../../client-data-processing/nominal-ledger";
import { ClientTBLineProps } from "../../interfaces/interfaces";
import { Session } from "../session";
import { NominalLedgerEntryPrompt } from "../trial-balance";
import { InTrayItem } from "./global";

export class InTrayTemplate {
  type: "Assignment" | "TrialBalanceEntry" | "NominalLedgerEntry";
  items: InTrayItem[];
  constructor(type: "Assignment" | "TrialBalanceEntry" | "NominalLedgerEntry", items: InTrayItem[]) {
    this.type = type;
    this.items = items;
  }
}

export class InTrayAssignment extends InTrayTemplate {
  constructor() {
    super("Assignment", []);
  }
}

export class InTrayTrialBalanceEntry extends InTrayTemplate {
  constructor(session: Session) {
    const items = [];
    const nLEntryPrompt = !session.assignment.NLEntered && new NominalLedgerEntryPrompt();
    nLEntryPrompt && items.push(nLEntryPrompt);
    super("TrialBalanceEntry", items);
  }
}

export class InTrayNominalLedgerEntry extends InTrayTemplate {
  constructor(session: Session, openingBalances: ClientTBLineProps[]) {
    const items = [];
    const openingBalancesRec = session.clientBFwdTB.length > 0 && reconcileClientBFTB(session, openingBalances);
    openingBalancesRec && items.push(openingBalancesRec);
    super("NominalLedgerEntry", items);
  }
}
