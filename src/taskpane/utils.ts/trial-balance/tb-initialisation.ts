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
    };
    transactions.forEach((tran) => {
      if (tran.cerysCode === code) {
        line.value += tran.value;
      }
    });
    tb.push(new TrialBalanceLine(line));
  });
}

export function setActiveCategories(tb) {
  const categories = [];
  tb.forEach((line) => {
    if (!categories.includes(line.cerysCategory)) {
      categories.push(line.cerysCategory);
    }
  });
  const arrCats = [];
  categories.forEach((cat) => {
    const obj = {};
    obj["cerysCategory"] = cat;
    obj["value"] = 0;
    obj["cerysCodes"] = [];
    tb.forEach((line) => {
      if (line.cerysCategory === cat) {
        obj["value"] += line.value;
        obj["cerysCodes"].push(line.cerysCode);
      }
    });
    arrCats.push(obj);
  });
  return { arrCats, categories };
}
