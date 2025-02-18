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
    const validColl = this.collections.find((coll) => coll.countItems(session) > 0);
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

  generateItems(session: Session) {
    const items = this.itemsAction(session, ...this.itemsActionParams);
    const cleansedItems = this.removeEmptyInTraysFromItems(session, items);
    return cleansedItems;
  }

  countItems(session: Session) {
    const items = this.generateItems(session);
    let len: number;
    if (Array.isArray(items)) {
      len = items.length;
    } else if (items) {
      len = 1;
    } else len = 0;
    return len;
  }

  getItems(session: Session) {
    const items = this.generateItems(session);
    if (Array.isArray(items)) {
      return items;
    } else if (items) {
      return [items];
    } else return [];
  }

  // checks the collection items returned by itemsAction function to see if any of them are
  // inTrays themselves - ie child inTray of the inTray to which this collection belongs.
  // Any inTrays found in the items are then checked via its hasAnyUnderlyingItems method to see
  // if it actually contains any items itself. If it doesn't then it's purged from this collection's
  // items.
  removeEmptyInTraysFromItems(session: Session, items: (InTrayItem | InTray)[] | InTrayItem | InTray) {
    if (Array.isArray(items)) {
      const newArray = [];
      items.forEach((item) => {
        if (item instanceof InTray) {
          if (item.hasAnyUnderlyingItems(session)) newArray.push(item);
        } else {
          newArray.push(item);
        }
      });
      return newArray;
    } else {
      if (items instanceof InTray) {
        return items.hasAnyUnderlyingItems(session) ? items : false;
      } else {
        return items;
      }
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
