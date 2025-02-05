import { InTrayCollectionProps, InTrayItemProps } from "../../interfaces/interfaces";
import { getRandomString } from "../../utils/helper-functions";
import { Session } from "../session";
import { InTrayTemplate } from "./templates";

export class InTray {
  type: InTrayTemplate["type"];
  title: string;
  collections: InTrayCollection[];
  // collectionsAction: (...args: unknown[]) => InTrayCollection[] | Promise<InTrayCollection[]>;
  // collectionsActionParams: unknown[];
  id: string;
  parentInTray: InTray;
  constructor(intray: InTrayTemplate) {
    console.log(intray);
    this.type = intray.type;
    this.title = intray.title;
    // intray.collections.forEach((coll) => {
    //   const items = coll.getItems(session);
    //   console.log(items);
    //   items.forEach((item) => {
    //     if (item instanceof InTray) item.parentInTray = this;
    //   });
    // });
    this.collections = intray.collections;
    this.id = getRandomString();
  }

  addCollection(collection: InTrayCollection) {
    // const items = collection.getItems(session);
    // console.log(items);
    // items.forEach((item) => {
    //   if (item instanceof InTray) item.parentInTray = this;
    // });
    this.collections.push(collection);
  }
  // deleteThisItem(inTrayItem: InTrayItem) {
  //   this.collections.find((coll) => coll.id === inTrayItem.collectionId).deleteItem(inTrayItem);
  // }

  // addItem(inTrayItem: InTrayItem) {
  //   this.collections.find((coll) => coll.id === inTrayItem.collectionId).items.push(inTrayItem);
  // }
  // getCollections() {
  //   const collections: InTrayCollection[] | Promise<InTrayCollection[]> = this.collectionsAction(
  //     ...this.collectionsActionParams
  //   );
  //   return collections;
  // }
}

export class InTrayCollection {
  title: string;
  //items: (InTrayItem | InTray)[];
  itemsAction: (session: Session, ...args: unknown[]) => (InTrayItem | InTray)[];
  itemsActionParams: unknown[];
  id: string;
  constructor(inTrayCollection: InTrayCollectionProps) {
    this.title = inTrayCollection.title;
    this.itemsAction = inTrayCollection.itemsAction;
    this.itemsActionParams = inTrayCollection.itemsActionParams;
    this.id = getRandomString();
  }

  getItems(session: Session) {
    return this.itemsAction(session, ...this.itemsActionParams);
  }

  // deleteItem(inTrayItem: InTrayItem | InTray) {
  //   const items = this.getItems();
  //   this.items = this.items.filter((i) => i.id !== inTrayItem.id).map((i) => i);
  // }
}

export class InTrayItem {
  title: string;
  getSubtitle: () => string;
  getSummaryText: () => string;
  detailsAction: (session: Session, ...args: unknown[]) => void | Promise<void>;
  detailsActionParams: unknown[];
  detailsPath: "inTrayDetails" | "inTraySummary";
  affirmativeAction: (param: Session | null) => void | Promise<void>;
  id: string;
  collectionId: string;
  constructor(inTrayItem: InTrayItemProps) {
    this.title = inTrayItem.title;
    this.getSubtitle = inTrayItem.getSubtitle;
    this.getSummaryText = inTrayItem.getSummaryText;
    this.detailsAction = inTrayItem.detailsAction;
    this.detailsActionParams = [];
    this.detailsPath = inTrayItem.detailsPath;
    this.affirmativeAction = inTrayItem.affirmativeAction;
    this.id = getRandomString();
    //this.collectionId = inTrayCollection.id;
  }

  async handleClick(session: Session, inTray: InTray) {
    this.detailsAction && (await this.detailsAction(session, ...this.detailsActionParams));
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

export class InTrayAndParentInTray {
  inTray: InTray;
  parentInTray: InTray;
  constructor(inTray: InTray, parentInTray: InTray) {
    this.inTray = inTray;
    this.parentInTray = parentInTray;
  }
}
