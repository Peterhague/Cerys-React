export function getClientNomDetail(clientCode, activeAssignment) {
  const selection = [];
  activeAssignment.clientNL.forEach((transaction) => {
    if (transaction.code === clientCode) {
      selection.push(transaction);
    }
  });
  return selection;
}
