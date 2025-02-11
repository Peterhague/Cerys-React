import { ClientCerysCodeObjectProps, ClientTBLineProps } from "../interfaces/interfaces";
import { INTRAY_DETAILS } from "../static-values/views";
import { processTransBatch } from "../utils/transactions/transactions";
import { InTrayItem } from "./in-trays/global";
import { ActiveJournal, Journal } from "./journal";
import { Session } from "./session";

export class ClientTrialBalanceLine {
  cerysCodeObj: ClientCerysCodeObjectProps;
  clientNominalCode: number;
  value: number;
  narrative: string;
  constructor(cerysCodeObj: ClientCerysCodeObjectProps, clientNominalCode: number, value: number, narrative: string) {
    this.cerysCodeObj = cerysCodeObj;
    this.clientNominalCode = clientNominalCode;
    this.value = value;
    this.narrative = narrative;
  }

  getClientCodeName(session: Session) {
    return session.clientChart.find((code) => code.clientCode === this.clientNominalCode).clientCodeName;
  }

  getClientCodeObject(session: Session) {
    return session.clientChart.find((i) => i.clientCode === this.clientNominalCode);
  }
}

export class ClientTBBFwdComparison {
  clientCode: number;
  clientCodeName: string;
  cerysValue: number;
  clientValue: number;
  constructor(trialBalanceLine: ClientTBLineProps, source: "Cerys" | "Client") {
    this.clientCode = trialBalanceLine.clientCode;
    this.clientCodeName = trialBalanceLine.clientCodeName;
    this.cerysValue = source === "Cerys" ? trialBalanceLine.value : 0;
    this.clientValue = source === "Client" ? trialBalanceLine.value : 0;
  }
  getDifference() {
    return this.cerysValue - this.clientValue;
  }
}

export class ClientTBBFwdReconciliation extends InTrayItem {
  items: ClientTBBFwdComparison[];
  constructor(bFPerCerys: ClientTBLineProps[], bfPerClient: ClientTBLineProps[]) {
    super({
      title: "Opening balances",
      getSubtitle: null,
      getSummaryText: null,
      detailsAction: null,
      detailsPath: INTRAY_DETAILS,
      affirmativeAction: null,
    });
    const comparisonArray = bFPerCerys.map((cerysItem) => new ClientTBBFwdComparison(cerysItem, "Cerys"));
    bfPerClient.forEach((opBal) => {
      const existingItem = comparisonArray.find((i) => i.clientCode === opBal.clientCode);
      existingItem
        ? (existingItem.clientValue = opBal.value)
        : comparisonArray.push(new ClientTBBFwdComparison(opBal, "Client"));
    });
    this.items = comparisonArray;
    this.getSubtitle = this.getIntraySubtitle;
    this.getSummaryText = this.getIntraySummaryText;
    this.affirmativeAction = this.postUnpostedAdjustments;
  }

  getAllDifferences() {
    const filter = this.items.filter((i) => i.cerysValue !== i.clientValue);
    return filter.map((obj) => {
      return { ...obj, difference: obj.getDifference() };
    });
  }

  getPostedStatus() {
    const diffs = this.getAllDifferences();
    let status: "all" | "none" | "some";
    if (diffs.length === 0) {
      status = "all";
    } else if (diffs.length === this.items.length) {
      status = "none";
    } else status = "some";
    return status;
  }

  getIntraySubtitle() {
    const postedStatus = this.getPostedStatus();
    return postedStatus === "all" ? null : postedStatus === "none" ? " - not posted" : " - incomplete";
  }

  getIntraySummaryText() {
    const postedStatus = this.getPostedStatus();
    let text: string = "";
    if (postedStatus === "none") {
      text =
        "It appears from this period's data that no opening balance adjustments have been posted. Would you like to post them automatically?";
    } else if (postedStatus === "some") {
      text =
        "It appears from this period's data that some opening balance adjustments have not been posted. Would you like to post the omitted ones automatically?";
    }
    return text;
  }

  async postUnpostedAdjustments(session: Session) {
    const diffs = this.getAllDifferences();
    const activeJournal = new ActiveJournal({ type: "OBA auto-entry", journals: [] });
    diffs.forEach((i) => {
      const cerysCode = session.clientChart.find((code) => code.clientCode === i.clientCode).cerysCode;
      activeJournal.journals.push(
        new Journal(session, {
          cerysCode,
          value: i.difference / 100,
          narrative: "OBA auto-entry",
          transactionDate: session.assignment.reportingPeriod.reportingDate,
          transactionType: "OBA auto-entry",
        })
      );
    });
    await processTransBatch(session, activeJournal);
  }
}
