import { FSCategoryBS, FSCategoryPL } from "../interfaces/interfaces";

export class FSCategoryLinePL {
  rawValue: number;
  fSValue: number;
  calculated: boolean;
  sum: boolean;
  total: boolean;
  short: string;
  shortTwo: string | null;
  long: string;
  rowNumber: number;
  constructor(value: number, category: FSCategoryPL, calculated: boolean) {
    this.rawValue = value;
    this.fSValue = value * -1;
    this.sum = category.sum;
    this.total = category.total;
    this.calculated = calculated;
    this.short = category.short;
    this.shortTwo = category.shortTwo;
    this.long = category.long;
    this.rowNumber = 0;
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
  short: string;
  shortTwo: string | null;
  long: string;
  rowNumber: number;
  constructor(value: number | string, category: FSCategoryBS) {
    this.rawValue = value;
    this.numberValue = typeof value === "number" ? value : 0;
    this.sum = category.sum;
    this.total = category.total;
    this.subTotalCol = category.subTotalCol;
    this.subTotal = category.subTotal;
    this.calculated = category.calculated;
    this.spaceBefore = category.spaceBefore;
    this.spaceAfter = category.spaceAfter;
    this.short = category.short;
    this.shortTwo = category.shortTwo;
    this.long = category.long;
    this.rowNumber = 0;
  }
}
