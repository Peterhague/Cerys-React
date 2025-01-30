import { enterNL } from "../client-data-processing/nominal-ledger";
import { InTrayItem } from "./in-trays/global";
import { Session } from "./session";

export class NominalLedgerEntryPrompt extends InTrayItem {
  constructor() {
    super({
      title: "Nominal ledger not imported",
      getSubtitle: null,
      getSummaryText: null,
      detailsAction: null,
      affirmativeAction: null,
    });
    this.getSubtitle = this.getIntraySubtitle;
    this.getSummaryText = this.getIntraySummaryText;
    this.affirmativeAction = this.enterNL;
  }

  getIntraySubtitle() {
    return null;
  }

  getIntraySummaryText() {
    return "You have not yet imported a nominal ledger to support the current period's client data. Import now?";
  }

  enterNL(session: Session) {
    enterNL(session);
  }
}
