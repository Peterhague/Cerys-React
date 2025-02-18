import { FSCategoryLineBS, FSCategoryLinePL } from "./accounts-category-line";
import { AssignmentClientTBObject } from "./assignment-client-TB-obj";
import { Transaction } from "./transaction";
import { TrialBalanceLine } from "./client-codes";
import { DrillableCollectionDynamic, DrillableCollectionStatic } from "./drillable-collection";

export class TransactionMap {
  transactionId: string;
  rowNumberOrig: number;
  drillableCollections: (DrillableCollectionStatic | DrillableCollectionDynamic)[];

  constructor(
    transactionId: string,
    rowNumber: number,
    drillableCollections: (DrillableCollectionStatic | DrillableCollectionDynamic)[] | null
  ) {
    this.transactionId = transactionId;
    this.rowNumberOrig = rowNumber;
    this.drillableCollections = drillableCollections;
  }
  getTran(transactions: Transaction[]) {
    return transactions.find((transaction) => transaction.cerysTransactionId === this.transactionId);
  }
}

export class ControlledInputMap {
  identity: string | number;
  identifier: string;
  rowNumberOrig: number;
  colNumbers: number[];
  drillableCollections: (DrillableCollectionStatic | DrillableCollectionDynamic)[];

  constructor(
    controlledInput: TrialBalanceLine | FSCategoryLinePL | FSCategoryLineBS | AssignmentClientTBObject,
    rowNumber: number,
    colNumbers: number[],
    drillableCollections: (DrillableCollectionStatic | DrillableCollectionDynamic)[] | null
  ) {
    this.identifier = "identifier";
    this.identity = controlledInput[this.identifier];
    this.rowNumberOrig = rowNumber;
    this.colNumbers = colNumbers;
    this.drillableCollections = drillableCollections;
  }
  getControlledInput(
    controlledInputs: TrialBalanceLine[] | FSCategoryLinePL[] | FSCategoryLineBS[] | AssignmentClientTBObject[]
  ) {
    return controlledInputs.find((input) => input[this.identifier] === this.identity);
  }
}
