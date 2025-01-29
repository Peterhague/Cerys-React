import { ClientTBBFwdReconciliation } from "../client-trial-balance-line";
import { InTrayItem } from "./global";

export class InTray {
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

export class InTrayAndItem {
  inTray: InTray;
  inTrayItem: InTrayItem;
  constructor(inTray: InTray, inTrayItem: InTrayItem) {
    this.inTray = inTray;
    this.inTrayItem = inTrayItem;
  }
}
