import { InTrayItemProps } from "../../interfaces/interfaces";
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
    const opBalItem = openingBalancesRec.getNLEntryIntrayItem();
    opBalItem && this.items.push(opBalItem);
  }
}

export const createOpBalsInTrayItem = (openingBalancesRec: ClientTBBFwdReconciliation) => {
  const inTrayItem: InTrayItemProps = {
    title: "Opening balances",
    subtitle: openingBalancesRec.getIntraySubtitle(),
    summary: openingBalancesRec.getIntraySummaryText(),
    detailsAction: null,
    affirmativeAction: null,
  };
  return new InTrayItem(inTrayItem);
};
