export class TransactionMap {
  transactionId: string;
  rowNumber: number;
  rowNumberOrig: number;

  constructor(transactionId: string, rowNumber: number) {
    this.transactionId = transactionId;
    this.rowNumber = rowNumber;
    this.rowNumberOrig = rowNumber;
  }
  getTran(transactions) {
    return transactions.find((transaction) => transaction._id === this.transactionId);
  }
}
