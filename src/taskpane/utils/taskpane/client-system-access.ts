import { Session } from "../../classes/session";

export function getClientNomDetail(clientCode, session: Session) {
  const selection = [];
  session.assignment.clientNL.forEach((transaction) => {
    if (transaction.cerysCode === clientCode) {
      selection.push(transaction);
    }
  });
  return selection;
}
