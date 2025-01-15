import { FSCategory } from "../interfaces/interfaces";

export class FSCategoryLine {
  rawValue: number;
  fSValue: number;
  calculated: boolean;
  sum: boolean;
  total: boolean;
  short: string;
  shortTwo: string | null;
  long: string;
  rowNumber: number;
  constructor(value: number, category: FSCategory, calculated: boolean) {
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
