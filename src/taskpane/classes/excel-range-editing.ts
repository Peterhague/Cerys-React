/* global Excel */

export class ExcelRangeUpdate {
  wsName: string | null;
  address: string;
  value: (string | number)[][];

  constructor(address: string, value: string | number, wsName: string | null) {
    this.wsName = wsName;
    this.address = address;
    this.value = [[value]];
  }
}

export class ExcelDeletionObject {
  wsName: string;
  range: string;
  rowNumber: number;
  worksheet?: Excel.Worksheet;

  constructor(wsName: string, range: string, rowNumber: number) {
    this.wsName = wsName;
    this.range = range;
    this.rowNumber = rowNumber;
  }
}
