import { FSCategoryBS, FSCategoryPL } from "../interfaces/interfaces";

export class FSCategoryLinePL {
  rawValue: number;
  fSValue: number;
  calculated: boolean;
  sum: boolean;
  total: boolean;
  statementName: string;
  statementNameTwo: string | null;
  categoryName: string;
  mappable: boolean;
  rowNumber: number;
  _id: string | null;
  constructor(value: number, id: string | null, category: FSCategoryPL, calculated: boolean) {
    this.rawValue = value;
    this.fSValue = value * -1;
    this.sum = category.sum;
    this.total = category.total;
    this.calculated = calculated;
    this.statementName = category.statementName;
    this.statementNameTwo = category.statementNameTwo;
    this.categoryName = category.categoryName;
    this.mappable = category.mappable;
    this.rowNumber = 0;
    this._id = id;
  }
}

export class FSCategoryLineBS {
  rawValue: number | string;
  numberValue: number;
  sum: boolean;
  total: boolean;
  subTotalCol: boolean;
  subTotal: boolean;
  calculated: boolean;
  spaceBefore: boolean;
  spaceAfter: boolean;
  statementName: string;
  statementNameTwo: string | null;
  categoryName: string;
  mappable: boolean;
  rowNumber: number;
  _id: string | null;
  constructor(value: number | string, id: string | null, category: FSCategoryBS) {
    this.rawValue = value;
    this.numberValue = typeof value === "number" ? value : 0;
    this.sum = category.sum;
    this.total = category.total;
    this.subTotalCol = category.subTotalCol;
    this.subTotal = category.subTotal;
    this.calculated = category.calculated;
    this.spaceBefore = category.spaceBefore;
    this.spaceAfter = category.spaceAfter;
    this.statementName = category.statementName;
    this.statementNameTwo = category.statementNameTwo;
    this.categoryName = category.categoryName;
    this.mappable = category.mappable;
    this.rowNumber = 0;
    this._id = id;
  }
}
