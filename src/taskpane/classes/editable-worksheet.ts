import { FATransaction } from "../interfaces/interfaces";
import { colNumToLetter } from "../utils.ts/excel-col-conversion";
import { addEditableSheetEventHandlers, postEditableSheetEffects } from "../utils.ts/helperFunctions";
import { createDeletionObject } from "../utils.ts/transactions/transactions";
import { deleteWorksheetRangesUp, setManyExcelRangeValues } from "../utils.ts/worksheet";
import { createDefinedCol, DefinedCol, getDefinedColsSchema } from "./defined-col";
import { ExcelRangeUpdate } from "./excel-range-editing";
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
  protectedRange: { firstRow: number; lastRow: number; firstCol: number; lastCol: number };
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
  filterObj: { target: string; value: string | number | boolean };
  isValueInverted: boolean;

  constructor(
    session: Session,
    transactions: Transaction[],
    ws: Excel.Worksheet,
    wsValues: string[][],
    type: string,
    sheetMapping: TransactionMap[]
  ) {
    this.name = ws.name;
    this.type = type;
    this.edited = false;
    this.promptDeletion = false;
    this.worksheetId = ws.id;
    this.definedCols = this.createDefinedCols();
    this.editableRowRanges = [{ firstRow: 3, lastRow: transactions.length + 2 }];
    this.protectedRange = {
      firstRow: 3,
      lastRow: transactions.length + 2,
      firstCol: 1,
      lastCol: this.definedCols.length,
    };
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
    this.filterObj = this.createEditableSheetFilterObj();
    this.isValueInverted = this.testValueInversion(session);
  }
  async renewTransactions(context, session: Session, assignmentTrans) {
    const newTrans = assignmentTrans.filter((tran) => tran[this.filterObj.target] === this.filterObj.value);
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
    const newTransToMap = [];
    const additionalTrans = [];
    this.transactions.forEach((tran) => {
      const existingMap = this.sheetMapping.find((mapping) => mapping.transactionId === tran._id);
      if (existingMap) {
        rowNumbers.push(existingMap.rowNumber);
        newMapping.push(existingMap);
      } else {
        newTransToMap.push(tran);
      }
    });
    newTransToMap.forEach((tran) => {
      rowNumbers.sort((a, b) => b - a);
      const nextRow = rowNumbers[0] + 1;
      const newMap = new TransactionMap(tran._id, nextRow);
      newMapping.push(newMap);
      additionalTrans.push({ tran, map: newMap });
      rowNumbers.push(nextRow);
    });
    this.sheetMapping = newMapping;
    const updates: ExcelRangeUpdate[] = [];
    additionalTrans.forEach((tran) => {
      const row = tran.map.rowNumber;
      this.definedCols.forEach((definedCol) => {
        let value = definedCol.getTargetProperty(tran.tran);
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
        const col = colNumToLetter(definedCol.colNumber);
        const address = `${col}${row}:${col}${row}`;
        updates.push(new ExcelRangeUpdate(address, value, null));
      });
      if (this.protectedRange.firstRow > row) this.protectedRange.firstRow = row;
      if (this.protectedRange.lastRow < row) this.protectedRange.lastRow = row;
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

  async createChangeObjects(context) {
    const updates = [];
    const deletionObjects = [];
    this.sheetMapping.forEach((map) => {
      const transaction = this.transactions.find((tran) => tran._id === map.transactionId);
      if (transaction) {
        transaction.updates.length > 0 &&
          transaction.updates.forEach((update) => {
            if (update.worksheetId && update.worksheetId !== this.worksheetId) {
              const definedCol = this.definedCols.find((col) => col.type === update.type);
              const col = colNumToLetter(definedCol.colNumber);
              const row = map.rowNumber;
              const sheetUpdate: { address: string; value?: string | number } = {
                address: `${col}${row}:${col}${row}`,
                value: update.value,
              };
              updates.push(sheetUpdate);
            }
          });
      } else {
        deletionObjects.push(createDeletionObject(map, this));
      }
    });
    updates.length > 0 && setManyExcelRangeValues(context, this.name, updates);
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

  testValueInversion(session: Session) {
    const cerysCodeObj =
      this.type === "cerysCodeAnalysis"
        ? session.chart.find((code) => code.cerysCode === this.filterObj.value)
        : undefined;
    return cerysCodeObj && cerysCodeObj.defaultSign === "credit" ? true : false;
  }
}

export const createEditableWorksheet = (
  session: Session,
  transactions: (Transaction | FATransaction)[],
  ws: Excel.Worksheet,
  wsValues: string[][],
  type: string,
  sheetMapping: TransactionMap[]
) => {
  const editableWs = new EditableWorksheet(session, transactions, ws, wsValues, type, sheetMapping);
  const arr = [editableWs];
  session.editableSheets.forEach((sheet) => {
    if (sheet.name !== editableWs.name) arr.push(sheet);
  });
  session.editableSheets = arr;
  addEditableSheetEventHandlers(session, ws);
  return editableWs;
};
