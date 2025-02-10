import { BaseCerysCodeObjectProps, TransactionUpdateProps } from "../interfaces/interfaces";
import { Session } from "./session";

export class TransactionUpdate implements TransactionUpdateProps {
  worksheetName: string;
  worksheetId: string;
  type: string;
  value: string | number;
  mongoDate: string | null;
  reversion: string | number;
  cerysCodeObject: BaseCerysCodeObjectProps | null;

  constructor(
    session: Session,
    wsName: string,
    wsId: string,
    type: string,
    value: string | number,
    reversion: string | number,
    mongoDate: string | null
  ) {
    this.worksheetName = wsName;
    this.worksheetId = wsId;
    this.type = type;
    this.value = value;
    this.reversion = reversion;
    this.mongoDate = mongoDate;
    const cerysCodeObj = type === "cerysCode" ? session.chart.find((code) => code.cerysCode === this.value) : null;
    this.cerysCodeObject = cerysCodeObj ? cerysCodeObj.revertToDbIdNotation() : null;
  }
}
