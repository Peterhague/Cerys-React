export function getClientNomDetail(clientCode, session) {
  const selection = [];
  session.activeAssignment.clientNL.forEach((transaction) => {
    if (transaction.cerysCode === clientCode) {
      selection.push(transaction);
    }
  });
  return selection;
}
