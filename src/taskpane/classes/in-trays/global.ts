import { InTrayItemProps } from "../../interfaces/interfaces";
import { Session } from "../session";
import { InTrayTemplate } from "./templates";

export class InTray {
  type: InTrayTemplate["type"];
  title: string;
  items: (InTrayItem | InTray)[];
  id: string;
  constructor(intray: InTrayTemplate) {
    this.type = intray.type;
    this.title = intray.title;
    this.items = intray.items;
    this.id = Math.round(Math.random() * 10000000).toString();
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
  detailsPath: "inTrayDetails" | "inTraySummary";
  affirmativeAction: (session: Session) => void | Promise<void>;
  id: string;
  constructor(inTrayItem: InTrayItemProps) {
    this.title = inTrayItem.title;
    this.getSubtitle = inTrayItem.getSubtitle;
    this.getSummaryText = inTrayItem.getSummaryText;
    this.detailsAction = inTrayItem.detailsAction;
    this.detailsPath = inTrayItem.detailsPath;
    this.affirmativeAction = inTrayItem.affirmativeAction;
    this.id = Math.round(Math.random() * 10000000).toString();
  }

  handleClick(session: Session, inTray: InTray) {
    this.detailsAction && this.detailsAction();
    const options = new InTrayAndItem(inTray, this);
    session.handleDynamicView(this.detailsPath, options);
  }
}

export class InTrayRouting {
  previous: InTray;
  next: InTrayItem | InTray;
  constructor(previous: InTray, next: InTrayItem | InTray) {
    this.previous = previous;
    this.next = next;
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
