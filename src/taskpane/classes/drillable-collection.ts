import { ClientTransactionProps } from "../interfaces/interfaces";
import { Session } from "./session";
import { Transaction } from "./transaction";

export class DrillableCollectionBase {
  colNumbers: number[];
  func: (session: Session, args2: unknown) => void;
  constructor(colNumbers: number[], func: (session: Session, args2: unknown) => void) {
    this.colNumbers = colNumbers;
    this.func = func;
  }
}

export class DrillableCollectionStatic extends DrillableCollectionBase {
  private collection: (Transaction | ClientTransactionProps)[];
  constructor(
    collection: Transaction[] | ClientTransactionProps[],
    filter: (item: Transaction | ClientTransactionProps) => boolean | null,
    colNumbers: number[],
    func: (session: Session, args2: unknown) => void
  ) {
    super(colNumbers, func);
    const filteredCollection = filter ? collection.filter(filter) : collection;
    this.collection = filteredCollection;
  }

  getCollection(session: Session) {
    return session instanceof Session && this.collection;
  }

  drillInto(session: Session) {
    this.func(session, this.collection);
  }
}

export class DrillableCollectionDynamic extends DrillableCollectionBase {
  collectionAction: (session: Session) => unknown;
  constructor(
    collectionAction: (session: Session) => unknown,
    colNumbers: number[],
    func: (session: Session, args2: unknown) => void
  ) {
    super(colNumbers, func);
    this.collectionAction = collectionAction;
  }

  getCollection(session: Session) {
    this.collectionAction(session);
  }

  drillInto(session: Session) {
    this.func(session, this.getCollection(session));
  }
}
