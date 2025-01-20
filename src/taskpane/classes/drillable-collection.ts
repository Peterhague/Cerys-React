import { ClientTransaction } from "../interfaces/interfaces";
import { Session } from "./session";
import { Transaction } from "./transaction";

export class DrillableCollection {
  collection: (Transaction | ClientTransaction)[];
  colNumbers: number[];
  func: (session: Session, args2: any) => void;
  constructor(
    collection: Transaction[] | ClientTransaction[],
    filter: (item: Transaction | ClientTransaction) => boolean | null,
    colNumbers: number[],
    func: (session: Session, args2: any) => void
  ) {
    const filteredCollection = filter ? collection.filter(filter) : collection;
    this.collection = filteredCollection;
    this.colNumbers = colNumbers;
    this.func = func;
  }

  drillInto = (session: Session) => {
    this.func(session, this.collection);
  };
}
