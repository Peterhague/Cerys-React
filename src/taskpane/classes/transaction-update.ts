export class TransactionUpdate {
  worksheetName: string;
  worksheetId: string;
  type: string;
  value: string | number;
  mongoDate: string | null;
  reversion: string | number;

  constructor(
    wsName: string,
    wsId: string,
    type: string,
    value: string | number,
    reversion: string | number,
    mongoDate: string | null
  ) {
    this.worksheetName = wsName;
    this.worksheetId = wsId;
    this.type = type;
    this.value = value;
    this.reversion = reversion;
    this.mongoDate = mongoDate;
  }
}
