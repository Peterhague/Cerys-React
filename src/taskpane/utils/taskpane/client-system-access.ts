import { Session } from "../../classes/session";
import { ClientTransactionProps } from "../../interfaces/interfaces";

export function getClientNomDetail(clientCode: number, session: Session) {
  const selection: ClientTransactionProps[] = [];
  session.assignment.clientNL.forEach((transaction) => {
    if (transaction.cerysCode === clientCode) {
      selection.push(transaction);
    }
  });
  return selection;
}
