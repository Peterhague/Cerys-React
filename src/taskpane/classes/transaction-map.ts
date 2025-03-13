import { FSCategoryLineBS, FSCategoryLinePL } from "./accounts-category-line";
import { AssignmentClientTBObject } from "./assignment-client-TB-obj";
import { Transaction } from "./transaction";
import { TrialBalanceLine } from "./client-codes";
import { DrillableCollection } from "./drillable-collection";

export class TransactionMap {
  transactionId: string;
  controlledInput: Transaction;
  index: number;
  drillableCollections: DrillableCollection[];

  constructor(
    transactionId: string,
    controlledInput: Transaction,
    index: number,
    drillableCollections: DrillableCollection[] | null
  ) {
    this.transactionId = transactionId;
    this.controlledInput = controlledInput;
    this.index = index;
    this.drillableCollections = drillableCollections;
  }
  getTran(transactions: Transaction[]) {
    return transactions.find((transaction) => transaction.cerysTransactionId === this.transactionId);
  }
}

export class ControlledInputMap {
  controlledInput: TrialBalanceLine | FSCategoryLinePL | FSCategoryLineBS | AssignmentClientTBObject;
  identity: string | number;
  identifier: string;
  index: number;
  colNumbers: number[];
  drillableCollections: DrillableCollection[];

  constructor(
    controlledInput: TrialBalanceLine | FSCategoryLinePL | FSCategoryLineBS | AssignmentClientTBObject,
    index: number,
    colNumbers: number[],
    drillableCollections: DrillableCollection[] | null
  ) {
    this.controlledInput = controlledInput;
    this.identifier = "identifier";
    this.identity = controlledInput[this.identifier];
    this.index = index;
    this.colNumbers = colNumbers;
    this.drillableCollections = drillableCollections;
  }
  getControlledInput(
    controlledInputs: TrialBalanceLine[] | FSCategoryLinePL[] | FSCategoryLineBS[] | AssignmentClientTBObject[]
  ) {
    return controlledInputs.find((input) => input[this.identifier] === this.identity);
  }
}

export class StaticInputMap {
  index: number;
  colNumbers: number[];

  constructor(index: number, colNumbers: number[]) {
    this.index = index;
    this.colNumbers = colNumbers;
  }
}
