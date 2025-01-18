import { ClientTransaction } from "../interfaces/interfaces";
import { Transaction } from "./transaction";

export class DrillableCollection {
  collection: (Transaction | ClientTransaction)[];
  colNumbers: number[];
  constructor(
    collection: Transaction[] | ClientTransaction[],
    filter: (item: Transaction | ClientTransaction) => boolean | null,
    colNumbers: number[]
  ) {
    const filteredCollection = filter ? collection.filter(filter) : collection;
    this.collection = filteredCollection;
    this.colNumbers = colNumbers;
  }
}
