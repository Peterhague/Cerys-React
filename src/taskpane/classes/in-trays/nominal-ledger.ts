import { ClientTBBFwdReconciliation } from "../client-trial-balance-line";
import { InTrayItem } from "./global";

export class Intray {
  content: InTrayNominalLedgerEntry;
  constructor(intray: InTrayNominalLedgerEntry) {
    this.content = intray;
  }
}

export class InTrayNominalLedgerEntry {
  items: InTrayItem[];
  constructor(openingBalancesRec: ClientTBBFwdReconciliation) {
    this.items = [];
    this.items.push(openingBalancesRec);
  }
}
