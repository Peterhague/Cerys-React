import { Session } from "./session";
import { Transaction } from "./transaction";

export class AssignmentClientTBObject {
  clientCode: number;
  clientCodeName: string;
  clientValue: number;
  assignmentValue: number;
  assignmentTransactions: Transaction[] | null;
  constructor(
    session: Session,
    transaction: Transaction | { clientCode: number; clientCodeName: string; value: number }
  ) {
    this.clientCode =
      transaction instanceof Transaction ? transaction.getClientMappingObj(session).clientCode : transaction.clientCode;
    this.clientCodeName =
      transaction instanceof Transaction
        ? transaction.getClientMappingObj(session).clientCodeName
        : transaction.clientCodeName;
    this.clientValue = transaction instanceof Transaction ? 0 : transaction.value;
    this.assignmentValue = transaction instanceof Transaction ? transaction.value : 0;
    this.assignmentTransactions = transaction instanceof Transaction ? [transaction] : null;
  }
}
