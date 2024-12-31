import { Transaction } from "../interfaces/interfaces";
import { DEFINED_COLS as cols } from "../static-values/defined-cols";
import _ from "lodash";

export class DefinedCol {
  type: string;
  colNumber: number;
  isMutable: Boolean;
  isQuasiMutable: Boolean;
  format: any[][];
  isDeleted: Boolean;
  updateKey: string;
  isUnique: Boolean;
  key: [string];

  getTargetProperty(transaction: Transaction) {
    let property = _.cloneDeep(transaction);
    this.key.forEach((key) => (property = property[key]));
    return property;
  }

  constructor(
    type: string,
    isMutable: boolean,
    isQuasiMutable: boolean,
    format: any[][],
    isUnique: boolean,
    colNumber: number,
    key: [string]
  ) {
    this.type = type;
    this.colNumber = colNumber;
    this.isMutable = isMutable;
    this.isQuasiMutable = isQuasiMutable;
    this.format = format;
    this.isDeleted = false;
    this.updateKey = isMutable ? `updated${type[0].toUpperCase()}${type.slice(1)}` : null;
    this.isUnique = isUnique;
    this.key = key;
  }
}

export const createDefinedCol = (template, index) => {
  const { type, isMutable, isQuasiMutable, format, isUnique, key } = template;
  const definedCol = new DefinedCol(type, isMutable, isQuasiMutable, format, isUnique, index, key);
  return definedCol;
};

export const createDefinedCols = (type) => {
  const schema = getDefinedColsSchema(type);
  const definedCols = schema.map((col, index) => {
    return createDefinedCol(col, index + 1);
  });
  return definedCols;
};

export const getDefinedColsSchema = (type) => {
  switch (type) {
    case "OBARelevantAdjustments":
      return [
        cols.transNo,
        cols.date,
        cols.transType,
        cols.cerysCode,
        cols.cerysName,
        cols.cerysNarrative,
        cols.value,
        cols.clientCodeMapping,
        cols.clientCodeNameMapping,
      ];
    case "cerysCodeAnalysis":
      return [
        cols.transNo,
        cols.date,
        cols.transType,
        cols.cerysCode,
        cols.clientCode,
        cols.cerysNarrative,
        cols.value,
      ];
    default:
      return null;
  }
};
