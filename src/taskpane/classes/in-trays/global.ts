import { InTrayCollectionProps, InTrayItemProps } from "../../interfaces/interfaces";
import { getRandomString } from "../../utils/helper-functions";
import { AssetRegCreationPrompt, IdenitfyPossibleAdditionsPrompt } from "../asset-register";
import { ClientTBBFwdReconciliation } from "../client-trial-balance-line";
import { Session } from "../session";
import { NominalLedgerEntryPrompt } from "../trial-balance";
import { InTrayTemplate } from "./templates";

export type InTrayItems =
  | IdenitfyPossibleAdditionsPrompt
  | AssetRegCreationPrompt
  | ClientTBBFwdReconciliation
  | NominalLedgerEntryPrompt;

export class InTray {
  type: InTrayTemplate["type"];
  title: string;
  collections: InTrayCollection[];
  parentInTray: InTray;
  id: string;
  constructor(intray: InTrayTemplate, parentInTray: InTray = null) {
    this.type = intray.type;
    this.title = intray.title;
    this.collections = intray.collections;
    this.parentInTray = parentInTray;
    this.id = getRandomString();
  }

  addCollection(collection: InTrayCollection) {
    this.collections.push(collection);
  }

  deleteCollection(collection: InTrayCollection) {
    this.collections = this.collections.filter((coll) => coll.id !== collection.id);
  }

  reconstructPath() {
    const path: InTray[] = [];
    let inTray: InTray = this;
    while (inTray) {
      if (inTray.parentInTray) path.push(inTray.parentInTray);
      inTray = inTray.parentInTray;
    }
    return path.reverse();
  }

  hasAnyUnderlyingItems(session: Session) {
    console.log(this);
    const validColl = this.collections.find((coll) => coll.countItems(session) > 0);
    console.log(validColl);
    return validColl ? true : false;
  }
}

export class InTrayCollection {
  title: string;
  itemsAction: (session: Session, ...args: unknown[]) => (InTrayItem | InTray)[] | InTrayItem | InTray;
  itemsActionParams: unknown[];
  id: string;
  constructor(inTrayCollection: InTrayCollectionProps) {
    this.title = inTrayCollection.title;
    this.itemsAction = inTrayCollection.itemsAction;
    this.itemsActionParams = inTrayCollection.itemsActionParams;
    this.id = getRandomString();
  }

  countItems(session: Session) {
    const items = this.itemsAction(session, ...this.itemsActionParams);
    const cleansedItems = this.cleanseItems(session, items);
    let len: number;
    if (Array.isArray(cleansedItems)) {
      len = cleansedItems.length;
    } else if (cleansedItems) {
      len = 1;
    } else len = 0;
    return len;
  }

  getItems(session: Session) {
    console.log(this);
    const items = this.itemsAction(session, ...this.itemsActionParams);
    console.log(items);
    const cleansedItems = this.cleanseItems(session, items);
    console.log(cleansedItems);
    if (Array.isArray(cleansedItems)) {
      return cleansedItems;
    } else if (cleansedItems) {
      return [cleansedItems];
    } else return [];
  }

  cleanseItems(session: Session, items: (InTrayItem | InTray)[] | InTrayItem | InTray) {
    if (!Array.isArray(items)) {
      if (!(items instanceof InTray)) {
        return items;
      } else {
        return items.hasAnyUnderlyingItems(session) ? items : false;
      }
    } else {
      const newArray = [];
      items.forEach((item) => {
        if (!(item instanceof InTray)) {
          newArray.push(item);
        } else {
          if (item.hasAnyUnderlyingItems(session)) newArray.push(item);
        }
      });
      return newArray;
    }
  }
}

export class InTrayItem {
  title: string;
  getSubtitle: () => string;
  getSummaryText: () => string;
  detailsAction: (session: Session, ...args: unknown[]) => void | Promise<void>;
  detailsActionParams: unknown[];
  detailsPath: "inTrayDetails" | "inTraySummary";
  affirmativeAction: (param: Session | null) => void | Promise<void>;
  extendsInTrayItem: boolean;
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
    this.extendsInTrayItem = true;
    //this.collectionId = inTrayCollection.id;
  }

  async handleClick(session: Session, inTray: InTray) {
    this.detailsAction && (await this.detailsAction(session, ...this.detailsActionParams));
    const options = new InTrayAndItem(inTray, this);
    session.handleDynamicView(this.detailsPath, options);
  }

  reconstructPath(inTray: InTray) {
    const path: InTray[] = [inTray];
    while (inTray) {
      if (inTray.parentInTray) path.push(inTray.parentInTray);
      inTray = inTray.parentInTray;
    }
    return path.reverse();
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
