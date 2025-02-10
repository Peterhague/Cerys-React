import { colNumToLetter } from "../utils/excel-col-conversion";
import { Session } from "./session";

export class EditableCell {
  addressObj: {
    firstRowOrig: number;
    lastRowOrig: number;
    firstColOrig: number;
    lastColOrig: number;
  };
  wsName: string;
  options: {
    action: string;
  };

  constructor(
    addressObj: { firstRow: number; lastRow: number; firstCol: number; lastCol: number },
    wsName: string,
    options: { action: string }
  ) {
    this.addressObj = {
      firstRowOrig: addressObj.firstRow,
      lastRowOrig: addressObj.lastRow,
      firstColOrig: addressObj.firstCol,
      lastColOrig: addressObj.lastCol,
    };
    this.wsName = wsName;
    this.options = options;
  }
  getCol() {
    return colNumToLetter(this.addressObj.firstColOrig);
  }

  getRange() {
    const col = this.getCol();
    const row = this.addressObj.firstRowOrig;
    return `${col}${row}:${col}${row}`;
  }

  getActiveTransaction(session: Session) {
    const sheet = session.editableSheets.find((sheet) => sheet.name === this.wsName);
    const map = sheet.sheetMapping.find((map) => map.rowNumberOrig === this.addressObj.firstRowOrig);
    const tran = sheet.transactions.find((t) => t.cerysTransactionId === map.transactionId);
    return tran;
  }
}

export const createEditableCell = (addressArg, wsNameArg, actionArg) => {
  const defaultAddressObj = {
    firstRow: 0,
    lastRow: 0,
    firstCol: 0,
    lastCol: 0,
  };
  const addressObj = addressArg ? addressArg : defaultAddressObj;
  const wsName = wsNameArg ? wsNameArg : "";
  const action = actionArg ? actionArg : "";
  const editableCell = new EditableCell(addressObj, wsName, { action });
  return editableCell;
};
