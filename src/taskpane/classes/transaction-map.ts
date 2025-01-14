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
  rowNumber: number;
  rowNumberOrig: number;

  constructor(controlledInput: TrialBalanceLine, identifier: string, rowNumber: number) {
    this.identifier = identifier;
    this.identity = controlledInput[this.identifier];
    this.rowNumber = rowNumber;
    this.rowNumberOrig = rowNumber;
  }
  getControlledInput(controlledInputs: TrialBalanceLine[]) {
    return controlledInputs.find((input) => input[this.identifier] === this.identity);
  }
}
