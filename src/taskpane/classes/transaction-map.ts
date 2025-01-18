import { DrillableCollectionProps } from "../interfaces/interfaces";
import { FSCategoryLineBS, FSCategoryLinePL } from "./accounts-category-line";
import { AssignmentClientTBObject } from "./assignment-client-TB-obj";
import { Transaction } from "./transaction";
import { TrialBalanceLine } from "./trial-balance-line";

export class TransactionMap {
  transactionId: string;
  rowNumber: number;
  rowNumberOrig: number;

  constructor(transactionId: string, rowNumber: number) {
    this.transactionId = transactionId;
    this.rowNumber = rowNumber;
    this.rowNumberOrig = rowNumber;
  }
  getTran(transactions: Transaction[]) {
    return transactions.find((transaction) => transaction._id === this.transactionId);
  }
}

export class ControlledInputMap {
  identity: string | number;
  identifier: string;
  //rowNumber: number;
  rowNumberOrig: number;
  colNumbers: number[];
  //colNumbersOrig: number[];
  drillableCollections: DrillableCollectionProps[];

  constructor(
    controlledInput: TrialBalanceLine | FSCategoryLinePL | FSCategoryLineBS | AssignmentClientTBObject,
    rowNumber: number,
    colNumbers: number[],
    drillableCollections: DrillableCollectionProps[] | null
  ) {
    this.identifier = "identifier";
    this.identity = controlledInput[this.identifier];
    //this.rowNumber = rowNumber;
    this.rowNumberOrig = rowNumber;
    this.colNumbers = colNumbers;
    //this.colNumbersOrig = colNumbers.map((i) => i);
    this.drillableCollections = drillableCollections;
  }
  getControlledInput(
    controlledInputs: TrialBalanceLine[] | FSCategoryLinePL[] | FSCategoryLineBS[] | AssignmentClientTBObject[]
  ) {
    return controlledInputs.find((input) => input[this.identifier] === this.identity);
  }
}
