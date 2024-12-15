//import { colNumToLetter } from "../utils.ts/excel-col-conversion";

//export interface DefinedCol {
//  type: string;
//  colNumber: number;
//  mutable: Boolean;
//  format: string;
//  deleted: Boolean;
//  updateKey?: string;
//  unique: Boolean;
//}

//export class EditableWorksheet {
//  name: string;
//  type: string;
//  edited: Boolean;
//  promptDeletion: Boolean;
//  worksheetId: string;
//  editableRowRanges: [{ firstRow: number; lastRow: number }];
//  protectedRange: { firstRow: number; lastRow: number; firstCol: number; lastCol: number };
//  protectedRangeDeleted: Boolean;
//  definedCols: [DefinedCol];
//  editButtonStatus: string;
//  changeRejected: Boolean;
//  columnsSorted: Boolean;
//  rowsSorted: Boolean;
//  dataCompromised: Boolean;
//  dataCorrupted: Boolean;
//  transactions: [{}];
//  usedRange: [string];

//  constructor(addressObj: { firstRow; lastRow; firstCol; lastCol }, wsName: string, options: { action }) {
//    this.addressObj = addressObj;
//    this.wsName = wsName;
//    this.options = options;
//  }
//  getCol() {
//    return colNumToLetter(this.addressObj.firstCol);
//  }

//  getRange() {
//    const col = this.getCol();
//    const row = this.addressObj.firstRow;
//    return `${col}${row}:${col}${row}`;
//  }

//  getActiveTransaction(session) {
//    const tran = session.editableSheets
//      .find((sheet) => sheet.name === this.wsName)
//      .transactions.find((t) => t.rowNumber === this.addressObj.firstRow);
//    return tran;
//  }
//}

//export const createEditableWorsksheet = (transactions, ws, definedCols, wsValues, type) => {
//  const template = {
//    name: ws.name,
//    type,
//    edited: false,
//    promptDeletion: false,
//    worksheetId: ws._id,
//    editableRowRanges: [{ firstRow: 3, lastRow: transactions.length + 2 }],
//    protectedRange: { firstRow: 3, lastRow: transactions.length + 2, firstCol: 1, lastCol: definedCols.length },
//    protectedRangeDeleted: false,
//    definedCols,
//    editButtonStatus: "show",
//    changeRejected: false,
//    columnsSorted: false,
//    rowsSorted: false,
//    dataCompromised: false,
//    dataCorrupted: false,
//    transactions,
//    usedRange: wsValues,
//  };
//  const addressObj = addressArg ? addressArg : defaultAddressObj;
//  const wsName = wsNameArg ? wsNameArg : "";
//  const action = actionArg ? actionArg : "";
//  const editableCell = new EditableWorksheet(template);
//  return editableCell;
//};

//export const createDefinedCols = () => {
//    const col = new DefinedCol();
//}
