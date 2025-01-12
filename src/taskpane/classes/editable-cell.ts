import { colNumToLetter } from "../utils/excel-col-conversion";
import { Session } from "./session";

export class EditableCell {
  addressObj: {
    firstRow: number;
    lastRow: number;
    firstCol: number;
    lastCol: number;
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
    this.addressObj = addressObj;
    this.wsName = wsName;
    this.options = options;
  }
  getCol() {
    return colNumToLetter(this.addressObj.firstCol);
  }

  getRange() {
    const col = this.getCol();
    const row = this.addressObj.firstRow;
    return `${col}${row}:${col}${row}`;
  }

  getActiveTransaction(session: Session) {
    const sheet = session.editableSheets.find((sheet) => sheet.name === this.wsName);
    const map = sheet.sheetMapping.find((map) => map.rowNumber === this.addressObj.firstRow);
    const tran = sheet.transactions.find((t) => t._id === map.transactionId);
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
