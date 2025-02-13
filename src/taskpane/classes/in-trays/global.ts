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

  getItems(session: Session) {
    const items = this.itemsAction(session, ...this.itemsActionParams);
    if (Array.isArray(items)) {
      return items;
    } else if (items) {
      return [items];
    } else return [];
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

  // handleClickGeneric(session: Session, inTray: InTray) {
  //   const options = new InTrayAndItem(inTray, this);
  //   session.handleDynamicView(this.detailsPath, options);
  // }
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
