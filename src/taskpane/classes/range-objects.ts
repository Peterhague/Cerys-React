import { colNumToLetter } from "../utils/excel-col-conversion";

export class ExcelRangeObject {
  address: string;
  numberOfRows: number;
  numberOfCols: number;
  firstCol: number;
  firstColLetter: string;
  firstRow: number;
  lastCol: number;
  lastColLetter: string;
  lastRow: number;

  constructor(startingCell: { row: number; col: number }, values: (string | number)[][]) {
    this.numberOfRows = values.length;
    this.numberOfCols = values[0].length;
    this.firstCol = startingCell.col;
    this.firstColLetter = colNumToLetter(startingCell.col);
    this.firstRow = startingCell.row;
    this.lastCol = startingCell.col + this.numberOfCols - 1;
    this.lastColLetter = colNumToLetter(this.lastCol);
    this.lastRow = startingCell.row + this.numberOfRows - 1;
    this.address = `${this.firstColLetter}${this.firstRow}:${this.lastColLetter}${this.lastRow}`;
  }

  getRowRangeAbs(rowNumber: number) {
    return `${this.firstColLetter}${rowNumber}:${this.lastColLetter}${rowNumber}`;
  }

  getRowRangeIndex(rowIndex: number) {
    const rowNumber = this.firstRow + rowIndex;
    return `${this.firstColLetter}${rowNumber}:${this.lastColLetter}${rowNumber}`;
  }

  getColRangeAbs(colNumber: number) {
    const colLetter = colNumToLetter(colNumber);
    return `${colLetter}${this.firstRow}:${colLetter}${this.lastRow}`;
  }

  getColRangeIndex(colIndex: number) {
    const colLetter = colNumToLetter(this.firstCol + colIndex);
    return `${colLetter}${this.firstRow}: ${colLetter}${this.lastRow}`;
  }
}

export class ProtectedRange {
  firstColOrig: number;
  lastColOrig: number;
  firstRowOrig: number;
  lastRowOrig: number;
  constructor(excelRangeObj: ExcelRangeObject) {
    this.firstColOrig = excelRangeObj.firstCol;
    this.lastColOrig = excelRangeObj.lastCol;
    this.firstRowOrig = excelRangeObj.firstRow;
    this.lastRowOrig = excelRangeObj.lastRow;
  }
}
