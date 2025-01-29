import { ClientTBBFwdReconciliation } from "../client-trial-balance-line";
import { InTrayItem } from "./global";

export class InTrayTemplate {
  type: "Assignment" | "NominalLedgerEntry";
  items: InTrayItem[];
  constructor(type: "Assignment" | "NominalLedgerEntry", items: InTrayItem[]) {
    this.type = type;
    this.items = items;
  }
}

export class InTrayNominalLedgerEntry extends InTrayTemplate {
  constructor(openingBalancesRec: ClientTBBFwdReconciliation) {
    const items = [];
    items.push(openingBalancesRec);
    super("NominalLedgerEntry", items);
  }
}

export class InTrayAssignment extends InTrayTemplate {
  constructor() {
    super("Assignment", []);
  }
}
