import { addControlledSheetEventHandlers } from "../utils/helperFunctions";
import { ControlledCol } from "./defined-col";
import { ExcelRangeObject } from "./excel-range-object";
import { Session } from "./session";
import { Transaction } from "./transaction";
import { ControlledInputMap } from "./transaction-map";
import { TrialBalanceLine } from "./trial-balance-line";
/* global Excel */

export class ControlledWorksheet {
  name: string;
  type: string;
  edited: boolean;
  promptDeletion: boolean;
  worksheetId: string;
  controlledRowRanges: { firstRow: number; lastRow: number }[];
  protectedRange: { firstRow: number; lastRow: number; firstCol: number; lastCol: number };
  protectedRangeDeleted: boolean;
  controlledCols: ControlledCol[];
  changeRejected: boolean;
  columnsSorted: boolean;
  rowsSorted: boolean;
  dataCompromised: boolean;
  dataCorrupted: boolean;
  controlledInputs: TrialBalanceLine[];
  usedRange: any[][];
  sheetMapping: ControlledInputMap[];
  filterObj: { target: string; value: string | number | boolean };
  transactionFilter: (tran: Transaction) => boolean;
  isValueInverted: boolean;

  constructor(
    controlledInputs: TrialBalanceLine[],
    ws: Excel.Worksheet,
    wsValues: string[][],
    sheetMapping: ControlledInputMap[],
    controlledRangeObject: ExcelRangeObject
  ) {
    const controlledCols = [];
    for (let i = controlledRangeObject.firstCol; i < controlledRangeObject.lastCol + 1; i++) {
      controlledCols.push(new ControlledCol(i));
    }
    this.name = ws.name;
    this.edited = false;
    this.promptDeletion = false;
    this.worksheetId = ws.id;
    this.controlledCols = controlledCols;
    this.controlledRowRanges = [{ firstRow: controlledRangeObject.firstRow, lastRow: controlledRangeObject.lastRow }];
    this.protectedRange = {
      firstRow: controlledRangeObject.firstRow,
      lastRow: controlledRangeObject.lastRow,
      firstCol: controlledRangeObject.firstCol,
      lastCol: controlledRangeObject.lastCol,
    };
    this.protectedRangeDeleted = false;
    this.changeRejected = false;
    this.columnsSorted = false;
    this.rowsSorted = false;
    this.dataCompromised = false;
    this.dataCorrupted = false;
    this.controlledInputs = controlledInputs;
    this.usedRange = wsValues;
    this.sheetMapping = sheetMapping;
  }

  hasControlledColOf(colNumber: number) {
    const cols = this.controlledCols.map((col) => col.colNumber);
    return cols.includes(colNumber);
  }
}

export const createControlledWorksheet = (
  session: Session,
  controlledInputs: TrialBalanceLine[],
  ws: Excel.Worksheet,
  wsValues: string[][],
  sheetMapping: ControlledInputMap[],
  controlledRangeObject: ExcelRangeObject
) => {
  const controlledWs = new ControlledWorksheet(controlledInputs, ws, wsValues, sheetMapping, controlledRangeObject);
  const arr = [controlledWs];
  session.controlledSheets.forEach((sheet) => {
    if (sheet.name !== controlledWs.name) arr.push(sheet);
  });
  session.controlledSheets = arr;
  addControlledSheetEventHandlers(session, ws);
  return controlledWs;
};
