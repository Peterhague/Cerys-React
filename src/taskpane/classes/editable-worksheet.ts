import { FATransaction, MappingObjectProps } from "../interfaces/interfaces";
import { colNumToLetter } from "../utils/excel-col-conversion";
import { addEditableSheetEventHandlers, postEditableSheetEffects } from "../utils/helperFunctions";
import { createDeletionObject } from "../utils/transactions/transactions";
import { deleteWorksheetRangesUp, setManyExcelRangeValues } from "../utils/worksheet";
import { createMappingObject } from "./controlled-worksheet";
import { createDefinedCol, DefinedCol, getDefinedColsSchema } from "./defined-col";
import { ExcelRangeUpdate } from "./excel-range-editing";
import { ExcelRangeObject, ProtectedRange } from "./range-objects";
import { Session } from "./session";
import { Transaction } from "./transaction";
import { TransactionMap } from "./transaction-map";
/* global Excel */

export class EditableWorksheet {
  name: string;
  type: string;
  edited: boolean;
  promptDeletion: boolean;
  worksheetId: string;
  editableRowRanges: { firstRow: number; lastRow: number }[];
  protectedRange: ProtectedRange;
  protectedRangeDeleted: boolean;
  definedCols: DefinedCol[];
  editButtonStatus: string;
  changeRejected: boolean;
  columnsSorted: boolean;
  rowsSorted: boolean;
  dataCompromised: boolean;
  dataCorrupted: boolean;
  transactions: Transaction[];
  usedRange: any[][];
  sheetMapping: TransactionMap[];
  mappingObject: MappingObjectProps;
  filterObj: { target: string; value: string | number | boolean };
  transactionFilter: (tran: Transaction) => boolean;
  isValueInverted: boolean;

  constructor(
    session: Session,
    transactions: Transaction[],
    ws: Excel.Worksheet,
    wsValues: string[][],
    type: string,
    sheetMapping: TransactionMap[],
    controlledRangeObj: ExcelRangeObject
  ) {
    this.name = ws.name;
    this.type = type;
    this.edited = false;
    this.promptDeletion = false;
    this.worksheetId = ws.id;
    this.definedCols = this.createDefinedCols();
    this.editableRowRanges = [{ firstRow: 3, lastRow: transactions.length + 2 }];
    this.protectedRange = new ProtectedRange(controlledRangeObj);
    this.protectedRangeDeleted = false;
    this.editButtonStatus = "show";
    this.changeRejected = false;
    this.columnsSorted = false;
    this.rowsSorted = false;
    this.dataCompromised = false;
    this.dataCorrupted = false;
    this.transactions = transactions;
    this.usedRange = wsValues;
    this.sheetMapping = sheetMapping;
    this.mappingObject = createMappingObject(controlledRangeObj);
    this.filterObj = this.createEditableSheetFilterObj();
    this.transactionFilter = this.createTransactionFilter(session);
    this.isValueInverted = this.testValueInversion(session);
  }
  async renewTransactions(context: Excel.RequestContext, session: Session, assignmentTrans: Transaction[]) {
    const newTrans = assignmentTrans.filter(this.transactionFilter);
    newTrans.forEach((newTran) => {
      const transaction = this.transactions.find((tran) => tran._id === newTran._id);
      if (transaction) newTran.updates = transaction.updates;
    });
    this.transactions = newTrans;
    await this.createChangeObjects(context);
    await this.updateMapping(context, session);
    this.transactions.forEach((tran) => (tran.updates = []));
    return newTrans;
  }

  async updateMapping(context, session: Session) {
    const rowNumbers = [];
    const newMapping: TransactionMap[] = [];
    const newTransToMap: Transaction[] = [];
    const additionalTrans: { tran: Transaction; map: TransactionMap }[] = [];
    this.transactions.forEach((tran) => {
      const existingMap = this.sheetMapping.find((mapping) => mapping.transactionId === tran._id);
      if (existingMap) {
        rowNumbers.push(this.getCurrentRow(existingMap.rowNumberOrig));
        newMapping.push(existingMap);
      } else {
        newTransToMap.push(tran);
      }
    });
    newTransToMap.forEach((tran) => {
      rowNumbers.sort((a, b) => b - a);
      const nextRow = rowNumbers[0] + 1;
      const newMap = new TransactionMap(tran._id, nextRow, null);
      newMapping.push(newMap);
      additionalTrans.push({ tran, map: newMap });
      rowNumbers.push(nextRow);
    });
    this.sheetMapping = newMapping;
    const updates: ExcelRangeUpdate[] = [];
    additionalTrans.forEach((obj) => {
      const row = obj.map.rowNumberOrig;
      console.log(row);
      this.definedCols.forEach((definedCol) => {
        let value = definedCol.getTargetProperty(obj.tran);
        if (
          definedCol.type === "value" &&
          typeof value === "number" &&
          this.definedCols.find((col) => col.type === "cerysCode")
        ) {
          value = value / 100;
          if (this.isValueInverted) value = value * -1;
        } else if (definedCol.type === "clientCode" && typeof value === "number") {
          value = value >= 0 ? value : "NA";
        }
        const col = colNumToLetter(this.getCurrentColumn(definedCol.colNumberOrig));
        const address = `${col}${row}:${col}${row}`;
        updates.push(new ExcelRangeUpdate(address, value, null));
      });
      this.editableRowRanges.forEach((range) => {
        if (range.firstRow - 1 === row) {
          range.firstRow = row;
        } else if (range.lastRow + 1 === row) {
          range.lastRow = row;
        } else {
          this.editableRowRanges.push({ firstRow: row, lastRow: row });
        }
      });
    });
    if (updates.length > 0) {
      await postEditableSheetEffects(context, session, this.name, updates);
    }
  }

  async createChangeObjects(context: Excel.RequestContext) {
    const updates = [];
    const deletionObjects = [];
    console.log(this.sheetMapping);
    this.sheetMapping.forEach((map) => {
      const transaction = this.transactions.find((tran) => tran._id === map.transactionId);
      if (transaction) {
        transaction.updates.length > 0 &&
          transaction.updates.forEach((update) => {
            if (update.worksheetId && update.worksheetId !== this.worksheetId) {
              const definedCol = this.definedCols.find((col) => col.type === update.type);
              const col = colNumToLetter(this.getCurrentColumn(definedCol.colNumberOrig));
              const row = this.getCurrentRow(map.rowNumberOrig);
              const sheetUpdate: { address: string; value?: string | number } = {
                address: `${col}${row}:${col}${row}`,
                value: update.value,
              };
              updates.push(sheetUpdate);
            }
          });
      } else {
        console.log("correct branch...");
        deletionObjects.push(createDeletionObject(map, this));
      }
    });
    console.log(updates);
    updates.length > 0 && setManyExcelRangeValues(context, this.name, updates);
    console.log(deletionObjects);
    if (deletionObjects.length > 0) {
      // needs to be sorted because the row numbers that the deletion objs reference are updated on each deletion,
      // therefore needs to be done from bottom of page up
      deletionObjects.sort((a, b) => b.rowNumber - a.rowNumber);
      await deleteWorksheetRangesUp(context, deletionObjects);
    }
  }

  createDefinedCols = () => {
    const schema = getDefinedColsSchema(this.type);
    const definedCols = schema.map((col, index) => {
      return createDefinedCol(col, index + 1);
    });
    return definedCols;
  };

  createEditableSheetFilterObj = () => {
    switch (this.type) {
      case "OBARelevantAdjustments":
        return {
          target: "clientAdj",
          value: true,
        };
      case "cerysCodeAnalysis":
        return {
          target: "cerysCode",
          value: this.transactions[0].cerysCode,
        };
      default:
        return null;
    }
  };

  createTransactionFilter = (session: Session) => {
    switch (this.type) {
      case "OBARelevantAdjustments":
        return (tran: Transaction) => tran.getCerysCodeObj(session).clientAdj;
      case "cerysCodeAnalysis":
        return (tran: Transaction) => tran.cerysCode === this.transactions[0].cerysCode;
      default:
        return null;
    }
  };

  testValueInversion(session: Session) {
    const cerysCodeObj =
      this.type === "cerysCodeAnalysis"
        ? session.chart.find((code) => code.cerysCode === this.filterObj.value)
        : undefined;
    return cerysCodeObj && cerysCodeObj.defaultSign === "credit" ? true : false;
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

  getOriginalRow(currentRow: number) {
    const rowObj = this.mappingObject.rows.find((obj) => obj.current === currentRow);
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

export const createEditableWorksheet = (
  session: Session,
  transactions: (Transaction | FATransaction)[],
  ws: Excel.Worksheet,
  wsValues: string[][],
  type: string,
  sheetMapping: TransactionMap[],
  controlledRangeObj: ExcelRangeObject
) => {
  const editableWs = new EditableWorksheet(session, transactions, ws, wsValues, type, sheetMapping, controlledRangeObj);
  const arr = [editableWs];
  session.editableSheets.forEach((sheet) => {
    if (sheet.name !== editableWs.name) arr.push(sheet);
  });
  session.editableSheets = arr;
  addEditableSheetEventHandlers(session, ws);
  return editableWs;
};
