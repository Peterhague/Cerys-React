import { Session } from "../../classes/session";
import { Transaction } from "../../classes/transaction";

export const clientCodeToCerysObject = (session: Session, clientCode: number) => {
  const cerysCode = session.clientChart.find((i) => i.clientCode === clientCode).cerysCode;
  for (let i = 0; i < session.chart.length; i++) {
    if (cerysCode === session.chart[i].cerysCode) {
      return session.chart[i];
    }
  }
  return null;
};

// takes a Cerys code and the Cerys NL object and returns an array with all the
// nominal activity.
export function getCerysNomDetail(transactions: Transaction[], cerysCode: number) {
  return transactions.filter((tran) => tran.cerysCode === cerysCode);
}

export function getCerysNomDetailPL(category: string, session: Session) {
  let cat = category;
  if (category === "Turnover") {
    cat = "Sales";
  } else if (category === "Taxation on profit") {
    cat = "Taxation";
  } else if (category === "Interest receivable and other income") {
    cat = "Interest receivable";
  } else if (category === "Interest payable and similar expenses") {
    cat = "Interest payable";
  }
  let selection: number[];
  session.assignment.activeCategoriesDetails.forEach((obj) => {
    if (obj.cerysCategory === cat || obj.cerysCategory === category) {
      selection = obj.cerysCodes;
    }
  });
  let selectionArray: Transaction[][] = [];
  selection.forEach((code) => {
    let arrOfTransactions: Transaction[] = [];
    session.assignment.transactions.forEach((transaction) => {
      if (transaction.cerysCode === code) {
        arrOfTransactions.push(transaction);
      }
    });
    selectionArray.push(arrOfTransactions);
  });
  return selectionArray;
}

export function getCerysNomDetailBS(category: string, session: Session) {
  const assignment = session.assignment;
  let cat = category;
  if (category === "Cash at bank and in hand") {
    cat = "Cash";
  } else if (category === "Creditors due in < 1 year") {
    cat = "Creditors < 1 year";
  } else if (category === "Creditors due in > 1 year") {
    cat = "Creditors > 1 year";
  }
  let selection: number[];
  assignment.activeCategoriesDetails.forEach((obj) => {
    if (obj.cerysCategory === cat || obj.cerysCategory === category) {
      selection = obj.cerysCodes;
    }
  });
  let selectionArray: Transaction[][] = [];
  selection.forEach((code) => {
    let arr: Transaction[] = [];
    assignment.transactions.forEach((transaction) => {
      if (transaction.cerysCode === code) {
        arr.push(transaction);
      }
    });
    selectionArray.push(arr);
  });
  return selectionArray;
}
