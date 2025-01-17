import { Session } from "../../classes/session";
import { Transaction } from "../../classes/transaction";
import { TrialBalanceLine } from "../../classes/trial-balance-line";
import { TrialBalanceLineProps } from "../../interfaces/interfaces";

export function tbCreator(session: Session, transactions: Transaction[]) {
  const tbCodes = [];
  transactions.forEach((tran) => {
    if (!tbCodes.includes(tran.cerysCode)) {
      tbCodes.push(tran.cerysCode);
    }
  });
  const tb: TrialBalanceLine[] = [];
  populateTransactions(session, transactions, tbCodes, tb);
  return tb;
}

export function populateTransactions(
  session: Session,
  transactions: Transaction[],
  tbCodes: number[],
  tb: TrialBalanceLine[]
) {
  tbCodes.forEach((code) => {
    const cerysCodeObj = session.chart.find((nom) => nom.cerysCode === code);
    const line: TrialBalanceLineProps = {
      cerysCode: code,
      cerysName: cerysCodeObj.cerysName,
      cerysCategory: cerysCodeObj.cerysCategory,
      closeOffCode: cerysCodeObj.closeOffCode,
      assetCodeType: cerysCodeObj.assetCodeType,
      value: 0,
      identifier: "",
    };
    transactions.forEach((tran) => {
      if (tran.cerysCode === code) {
        line.value += tran.value;
      }
    });
    tb.push(new TrialBalanceLine(line));
  });
}
