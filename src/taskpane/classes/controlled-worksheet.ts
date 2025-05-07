import { MappingObjectProps, MapTrackingProps } from "../interfaces/interfaces";
import { addControlledSheetEventHandlers } from "../utils/helper-functions";
import { FSCategoryLineBS, FSCategoryLinePL } from "./accounts-category-line";
import { AssignmentClientTBObject } from "./assignment-client-TB-obj";
import { ExcelRangeObject, ProtectedRange } from "./range-objects";
import { Session } from "./session";
import { Transaction } from "./transaction";
import { ControlledInputMap, StaticInputMap } from "./transaction-map";
import { TrialBalanceLine } from "./client-codes";
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
  sheetMapping: (ControlledInputMap | StaticInputMap)[];
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
    sheetMapping: (ControlledInputMap | StaticInputMap)[],
    controlledRangeObject: ExcelRangeObject,
    uniqueColumn: number | null,
    uniqueValue: string | null
  ) {
    insertStaticInputMaps(wsValues, sheetMapping);
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
    const colObj = this.mappingObject.columns.find((obj) => obj.index === originalColumn);
    return colObj ? colObj.current : undefined;
  }

  getCurrentRow(originalRow: number) {
    const rowObj = this.mappingObject.rows.find((obj) => obj.index === originalRow);
    return rowObj ? rowObj.current : undefined;
  }

  getOriginalColumn(currentColumn: number) {
    const colObj = this.mappingObject.columns.find((obj) => obj.current === currentColumn);
    return colObj ? colObj.index : undefined;
  }

  getOriginalRow(currenRow: number) {
    const rowObj = this.mappingObject.rows.find((obj) => obj.current === currenRow);
    return rowObj ? rowObj.index : undefined;
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
  sheetMapping: (ControlledInputMap | StaticInputMap)[],
  controlledRangeObject: ExcelRangeObject,
  uniqueColumn: number | null,
  uniqueValue: string | null
) => {
  session.controlledSheets = session.controlledSheets.filter((sheet) => sheet.name !== ws.name);
  const controlledWs = new ControlledWorksheet(
    controlledInputs,
    ws,
    wsValues,
    sheetMapping,
    controlledRangeObject,
    uniqueColumn,
    uniqueValue
  );
  session.controlledSheets.push(controlledWs);
  addControlledSheetEventHandlers(session, ws);
  return controlledWs;
};

export const createMappingObject = (excelRangeObj: ExcelRangeObject) => {
  const columns: MapTrackingProps[] = [];
  for (let i = 0; i < excelRangeObj.numberOfCols; i++) {
    columns.push({ index: i + 1, current: i + excelRangeObj.firstCol });
  }
  const rows: MapTrackingProps[] = [];
  for (let i = 0; i < excelRangeObj.numberOfRows; i++) {
    rows.push({ index: i + 1, current: i + excelRangeObj.firstRow });
  }
  return { columns, rows };
};

export const insertStaticInputMaps = (wsValues: string[][], sheetMapping: (ControlledInputMap | StaticInputMap)[]) => {
  wsValues.forEach((row, firstIndex) => {
    const isNotEmpty = row.find((str) => str);
    if (isNotEmpty) {
      const map = sheetMapping.find((map) => map.index === firstIndex + 1);
      if (!map) {
        const colNumbers: number[] = row.map((item, secondIndex) => item && secondIndex + 1).filter((i) => i);
        sheetMapping.push(new StaticInputMap(firstIndex + 1, colNumbers));
      }
    }
  });
};
