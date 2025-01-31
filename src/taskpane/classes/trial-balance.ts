import { enterNL } from "../client-data-processing/nominal-ledger";
import { INTRAY_DETAILS } from "../static-values/views";
import { InTrayCollection, InTrayItem } from "./in-trays/global";
import { Session } from "./session";

export class NominalLedgerEntryPrompt extends InTrayItem {
  constructor(inTrayCollection: InTrayCollection) {
    super(
      {
        title: "Nominal ledger not imported",
        getSubtitle: null,
        getSummaryText: null,
        detailsAction: null,
        detailsPath: INTRAY_DETAILS,
        affirmativeAction: null,
      },
      inTrayCollection
    );
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
