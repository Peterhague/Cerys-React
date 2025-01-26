import { Session } from "../../classes/session";
import { ClientTransaction } from "../../interfaces/interfaces";

export function getClientNomDetail(clientCode: number, session: Session) {
  const selection: ClientTransaction[] = [];
  session.assignment.clientNL.forEach((transaction) => {
    if (transaction.cerysCode === clientCode) {
      selection.push(transaction);
    }
  });
  return selection;
}
