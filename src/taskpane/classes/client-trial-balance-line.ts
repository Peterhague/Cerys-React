import { ClientCerysCodeObjectProps, ClientTBLineProps, InTrayItemProps } from "../interfaces/interfaces";
import { InTrayItem } from "./in-trays/global";

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

export class ClientTBBFwdReconciliation {
  items: ClientTBBFwdComparison[];
  constructor(bFPerCerys: ClientTBLineProps[], bfPerClient: ClientTBLineProps[]) {
    const comparisonArray = bFPerCerys.map((cerysItem) => new ClientTBBFwdComparison(cerysItem, "Cerys"));
    bfPerClient.forEach((opBal) => {
      const existingItem = comparisonArray.find((i) => i.clientCode === opBal.clientCode);
      existingItem
        ? (existingItem.clientValue = opBal.value)
        : comparisonArray.push(new ClientTBBFwdComparison(opBal, "Client"));
    });
    this.items = comparisonArray;
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
    return postedStatus === "all" ? null : postedStatus === "none" ? "not posted" : "incomplete";
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

  getNLEntryIntrayItem() {
    if (this.getPostedStatus() === "all") return null;
    const inTrayItem: InTrayItemProps = {
      title: "Opening balances",
      subtitle: this.getIntraySubtitle(),
      summary: this.getIntraySummaryText(),
      detailsAction: null,
      affirmativeAction: null,
    };
    return new InTrayItem(inTrayItem);
  }
}
