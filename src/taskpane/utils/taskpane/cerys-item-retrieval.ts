import { fetchOptionsNC } from "../../fetching/generateOptions";
import { cerysCodeUrl, cerysObjectUrl } from "../../fetching/apiEndpoints";
import { Session } from "../../classes/session";
import { Transaction } from "../../classes/transaction";

// takes a Sage code and returns the corresponding Cerys nominal code object
export async function sageCodeToCerysObject(sageCode) {
  const codeOptions = fetchOptionsNC(sageCode);
  const codeReturned = await fetch(cerysCodeUrl, codeOptions);
  const cerysCode = await codeReturned.json();
  const objOptions = fetchOptionsNC(cerysCode);
  const objReturned = await fetch(cerysObjectUrl, objOptions);
  const cerysObject = await objReturned.json();
  return cerysObject;
}

export const clientCodeToCerysObject = (session: Session, clientCode) => {
  let cerysCode;
  session.clientChart.forEach((nom) => {
    if (nom.clientCode === clientCode) {
      cerysCode = nom.cerysCode;
    }
  });
  for (let i = 0; i < session.chart.length; i++) {
    if (cerysCode === session.chart[i].cerysCode) {
      return session.chart[i];
    }
  }
  return null;
};

// takes a Sage code and returns the corresponding Cerys nominal code
export async function sageCodeToCerysCode(sageCode) {
  const codeOptions = fetchOptionsNC(sageCode);
  const response = await fetch(cerysCodeUrl, codeOptions);
  const cerysCode = await response.json();
  return cerysCode;
}

// takes an array of Sage codes and returns an array of Cerys objects
export async function manySageCodeToCerysObject(sageCodes) {
  const arrayOfCerysObjs = [];
  for (let i = 0; i < sageCodes.length; i++) {
    await sageCodeToCerysObject(sageCodes[i]).then((res) => arrayOfCerysObjs.push(res));
  }
  return arrayOfCerysObjs;
}

// takes an array of Sage codes and returns an array of Cerys codes
export async function manySageCodeToCerysCode(sageCodes) {
  const arrayOfCerysCodes = [];
  for (let i = 0; i < sageCodes.length; i++) {
    await sageCodeToCerysCode(sageCodes[i]).then((res) => arrayOfCerysCodes.push(res));
  }
  return arrayOfCerysCodes;
}

// takes a Xero code and returns the corresponding Cerys nominal code object
export async function xeroCodeToCerysObject(xeroCode) {
  const codeOptions = fetchOptionsNC(xeroCode);
  const codeReturned = await fetch(cerysCodeUrl, codeOptions);
  const cerysCode = await codeReturned.json();
  const objOptions = fetchOptionsNC(cerysCode);
  const objReturned = await fetch(cerysObjectUrl, objOptions);
  const cerysObject = await objReturned.json();
  return cerysObject;
}

// takes a Xero code and returns the corresponding Cerys nominal code
export async function xeroCodeToCerysCode(xeroCode) {
  const codeOptions = fetchOptionsNC(xeroCode);
  const response = await fetch(cerysCodeUrl, codeOptions);
  const cerysCode = await response.json();
  return cerysCode;
}

// takes an array of Xero codes and returns an array of Cerys objects
export async function manyXeroCodeToCerysObject(xeroCodes) {
  const arrayOfCerysObjs = [];
  for (let i = 0; i < xeroCodes.length; i++) {
    await xeroCodeToCerysObject(xeroCodes[i]).then((res) => arrayOfCerysObjs.push(res));
  }
  return arrayOfCerysObjs;
}

// takes an array of Xero codes and returns an array of Cerys codes
export async function manyXeroCodeToCerysCode(xeroCodes) {
  const arrayOfCerysCodes = [];
  for (let i = 0; i < xeroCodes.length; i++) {
    await xeroCodeToCerysCode(xeroCodes[i]).then((res) => arrayOfCerysCodes.push(res));
  }
  return arrayOfCerysCodes;
}

// takes a Cerys code and returns a Cerys object
export async function cerysCodeToCerysObject(cerysCode) {
  const objOptions = fetchOptionsNC(cerysCode);
  const objReturned = await fetch(cerysObjectUrl, objOptions);
  const cerysObject = await objReturned.json();
  return cerysObject;
}

// takes a Cerys code and the Cerys NL object and returns an array with all the
// nominal activity.
export function getCerysNomDetail(transactions: Transaction[], cerysCode: number) {
  return transactions.filter((tran) => tran.cerysCode === cerysCode);
}

export function getCerysNomDetailPL(category: string, session: Session) {
  console.log(category);
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
  console.log(selection);
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
