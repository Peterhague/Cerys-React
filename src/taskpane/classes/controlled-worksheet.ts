import { MappingObjectProps, MapTrackingProps } from "../interfaces/interfaces";
import { addControlledSheetEventHandlers } from "../utils/helperFunctions";
import { FSCategoryLineBS, FSCategoryLinePL } from "./accounts-category-line";
import { AssignmentClientTBObject } from "./assignment-client-TB-obj";
import { ExcelRangeObject, ProtectedRange } from "./range-objects";
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
  protectedRange: ProtectedRange;
  protectedRangeDeleted: boolean;
  changeRejected: boolean;
  columnsSorted: boolean;
  rowsSorted: boolean;
  dataCompromised: boolean;
  dataCorrupted: boolean;
  controlledInputs: TrialBalanceLine[] | FSCategoryLinePL[] | FSCategoryLineBS[] | AssignmentClientTBObject[];
  usedRange: any[][];
  sheetMapping: ControlledInputMap[];
  mappingObject: MappingObjectProps;
  uniqueColumn: number | null;
  uniqueValue: string | null;
  filterObj: { target: string; value: string | number | boolean };
  transactionFilter: (tran: Transaction) => boolean;
  isValueInverted: boolean;

  constructor(
    controlledInputs: TrialBalanceLine[] | FSCategoryLinePL[] | FSCategoryLineBS[] | AssignmentClientTBObject[],
    ws: Excel.Worksheet,
    wsValues: string[][],
    sheetMapping: ControlledInputMap[],
    controlledRangeObject: ExcelRangeObject,
    uniqueColumn: number | null,
    uniqueValue: string | null
  ) {
    this.name = ws.name;
    this.edited = false;
    this.promptDeletion = false;
    this.worksheetId = ws.id;
    this.protectedRange = new ProtectedRange(controlledRangeObject);
    this.protectedRangeDeleted = false;
    this.changeRejected = false;
    this.columnsSorted = false;
    this.rowsSorted = false;
    this.dataCompromised = false;
    this.dataCorrupted = false;
    this.controlledInputs = controlledInputs;
    this.usedRange = wsValues;
    this.sheetMapping = sheetMapping;
    this.mappingObject = createMappingObject(controlledRangeObject);
    this.uniqueColumn = uniqueColumn;
    this.uniqueValue = uniqueValue;
  }

  getCurrentColumn(originalColumn: number) {
    const colObj = this.mappingObject.columns.find((obj) => obj.original === originalColumn);
    return colObj ? colObj.current : undefined;
  }

  getCurrentRow(originalRow: number) {
    const rowObj = this.mappingObject.rows.find((obj) => obj.original === originalRow);
    return rowObj ? rowObj.current : undefined;
  }

  getOriginalColumn(currentColumn: number) {
    const colObj = this.mappingObject.columns.find((obj) => obj.current === currentColumn);
    return colObj ? colObj.original : undefined;
  }

  getOriginalRow(currenRow: number) {
    const rowObj = this.mappingObject.rows.find((obj) => obj.current === currenRow);
    return rowObj ? rowObj.original : undefined;
  }

  getCurrentProtectedRange() {
    const protectedFirstCol = this.getCurrentColumn(this.protectedRange.firstColOrig);
    const protectedLastCol = this.getCurrentColumn(this.protectedRange.lastColOrig);
    const protectedFirstRow = this.getCurrentColumn(this.protectedRange.firstRowOrig);
    const protectedLastRow = this.getCurrentColumn(this.protectedRange.lastRowOrig);
    return { protectedFirstCol, protectedLastCol, protectedFirstRow, protectedLastRow };
  }

  getCurrentColNumbers(colNumbers: number[]) {
    return colNumbers.map((no) => this.getCurrentColumn(no));
  }
}

export const createControlledWorksheet = (
  session: Session,
  controlledInputs: TrialBalanceLine[] | FSCategoryLinePL[] | FSCategoryLineBS[] | AssignmentClientTBObject[],
  ws: Excel.Worksheet,
  wsValues: string[][],
  sheetMapping: ControlledInputMap[],
  controlledRangeObject: ExcelRangeObject,
  uniqueColumn: number | null,
  uniqueValue: string | null
) => {
  const controlledWs = new ControlledWorksheet(
    controlledInputs,
    ws,
    wsValues,
    sheetMapping,
    controlledRangeObject,
    uniqueColumn,
    uniqueValue
  );
  const arr = [controlledWs];
  session.controlledSheets.forEach((sheet) => {
    if (sheet.name !== controlledWs.name) arr.push(sheet);
  });
  session.controlledSheets = arr;
  addControlledSheetEventHandlers(session, ws);
  return controlledWs;
};

export const updateControlledWorksheet = (
  session: Session,
  controlledInputs: TrialBalanceLine[] | FSCategoryLinePL[] | FSCategoryLineBS[] | AssignmentClientTBObject[],
  wsValues: string[][],
  sheetMapping: ControlledInputMap[],
  controlledRangeObject: ExcelRangeObject,
  uniqueColumn: number | null,
  wsName: string
) => {
  const sheet = session.controlledSheets.find((ws) => ws.name === wsName);
  sheet.controlledInputs = controlledInputs;
  sheet.usedRange = wsValues;
  sheet.sheetMapping = sheetMapping;
  sheet.protectedRange = new ProtectedRange(controlledRangeObject);
  sheet.uniqueColumn = uniqueColumn;
  sheet.uniqueValue;
};

export const createMappingObject = (excelRangeObj: ExcelRangeObject) => {
  const columns: MapTrackingProps[] = [];
  for (let i = 0; i < excelRangeObj.numberOfCols; i++) {
    columns.push({ original: i + excelRangeObj.firstCol, current: i + excelRangeObj.firstCol });
  }
  const rows: MapTrackingProps[] = [];
  for (let i = 0; i < excelRangeObj.numberOfRows; i++) {
    rows.push({ original: i + excelRangeObj.firstRow, current: i + excelRangeObj.firstRow });
  }
  return { columns, rows };
};
