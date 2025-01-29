import { InTrayItemProps } from "../../interfaces/interfaces";
import { INTRAY_DETAILS } from "../../static-values/views";
import { Session } from "../session";
import { InTrayTemplate } from "./templates";

export class InTray {
  type: "NominalLedgerEntry" | "Assignment";
  items: InTrayItem[];
  constructor(intray: InTrayTemplate) {
    this.type = intray.type;
    this.items = intray.items;
  }
  deleteThisItem(inTrayItem: InTrayItem) {
    const items = this.items.filter((i) => i.id !== inTrayItem.id);
    this.items = items;
  }

  addItem(inTrayItem: InTrayItem) {
    this.items.push(inTrayItem);
  }
}

export class InTrayItem {
  title: string;
  getSubtitle: () => string;
  getSummaryText: () => string;
  detailsAction: () => void;
  affirmativeAction: (session: Session) => void | Promise<void>;
  id: string;
  constructor(inTrayItem: InTrayItemProps) {
    this.title = inTrayItem.title;
    this.getSubtitle = inTrayItem.getSubtitle;
    this.getSummaryText = inTrayItem.getSummaryText;
    this.detailsAction = inTrayItem.detailsAction;
    this.affirmativeAction = inTrayItem.affirmativeAction;
    this.id = Math.round(Math.random() * 10000000).toString();
  }

  showDetails(session: Session, inTray: InTray) {
    this.detailsAction && this.detailsAction();
    const options = new InTrayAndItem(inTray, this);
    session.handleDynamicView(INTRAY_DETAILS, options);
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
