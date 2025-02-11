import { ClientTransactionProps } from "../interfaces/interfaces";
import { Session } from "./session";
import { Transaction } from "./transaction";

export class DrillableCollection {
  collection: (Transaction | ClientTransactionProps)[];
  colNumbers: number[];
  func: (session: Session, args2: unknown) => void;
  constructor(
    collection: Transaction[] | ClientTransactionProps[],
    filter: (item: Transaction | ClientTransactionProps) => boolean | null,
    colNumbers: number[],
    func: (session: Session, args2: unknown) => void
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
