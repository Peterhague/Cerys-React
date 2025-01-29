import { ClientTBBFwdReconciliation } from "../client-trial-balance-line";
import { InTrayItem } from "./global";

export class InTray {
  content: InTrayNominalLedgerEntry;
  constructor(intray: InTrayNominalLedgerEntry) {
    this.content = intray;
  }
  deleteThisItem(inTrayItem: InTrayItem) {
    const items = this.content.items.filter((i) => i.id !== inTrayItem.id);
    this.content = { items };
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
