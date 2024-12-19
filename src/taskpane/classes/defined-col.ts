import { DEFINED_COLS as cols } from "../static-values/defined-cols";

export class DefinedCol {
  type: string;
  colNumber: number;
  isMutable: Boolean;
  isQuasiMutable: Boolean;
  format: string;
  isDeleted: Boolean;
  updateKey: string;
  isUnique: Boolean;

  constructor(
    type: string,
    isMutable: Boolean,
    isQuasiMutable: Boolean,
    format: string,
    isUnique: Boolean,
    colNumber: number
  ) {
    this.type = type;
    this.colNumber = colNumber;
    this.isMutable = isMutable;
    this.isQuasiMutable = isQuasiMutable;
    this.format = format;
    this.isDeleted = false;
    this.updateKey = isMutable ? `updated${type[0].toUpperCase()}${type.slice(1)}` : null;
    this.isUnique = isUnique;
  }
}

export const createDefinedCol = (template, index) => {
  const { type, isMutable, isQuasiMutable, format, isUnique } = template;
  const definedCol = new DefinedCol(type, isMutable, isQuasiMutable, format, isUnique, index);
  return definedCol;
};

export const createDefinedCols = (type) => {
  const schema = getDefinedColsSchema(type);
  const definedCols = schema.map((col, index) => {
    return createDefinedCol(col, index + 1);
  });
  return definedCols;
};

export const getDefinedColsSchema = (schema) => {
  switch (schema) {
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
