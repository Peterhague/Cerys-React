import { InTrayItemProps } from "../../interfaces/interfaces";
import { getRandomString } from "../../utils/helper-functions";
import { Session } from "../session";
import { InTrayTemplate } from "./templates";

export class InTray {
  type: InTrayTemplate["type"];
  title: string;
  collections: InTrayCollection[];
  id: string;
  parentInTray: InTray;
  constructor(intray: InTrayTemplate) {
    this.type = intray.type;
    this.title = intray.title;
    intray.collections.forEach((coll) => {
      coll.items.forEach((item) => {
        if (item instanceof InTray) item.parentInTray = this;
      });
    });
    this.collections = intray.collections;
    this.id = getRandomString();
  }
  deleteThisItem(inTrayItem: InTrayItem) {
    this.collections.find((coll) => coll.id === inTrayItem.collectionId).items.filter((i) => i.id !== inTrayItem.id);
  }

  addItem(inTrayItem: InTrayItem) {
    this.collections.find((coll) => coll.id === inTrayItem.collectionId).items.push(inTrayItem);
  }
}

export class InTrayCollection {
  title: string;
  items: (InTrayItem | InTray)[];
  id: string;
  constructor(title: string = null) {
    this.title = title;
    this.items = [];
    this.id = getRandomString();
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
  collectionId: string;
  constructor(inTrayItem: InTrayItemProps, inTrayCollection: InTrayCollection) {
    this.title = inTrayItem.title;
    this.getSubtitle = inTrayItem.getSubtitle;
    this.getSummaryText = inTrayItem.getSummaryText;
    this.detailsAction = inTrayItem.detailsAction;
    this.detailsPath = inTrayItem.detailsPath;
    this.affirmativeAction = inTrayItem.affirmativeAction;
    this.id = getRandomString();
    this.collectionId = inTrayCollection.id;
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
