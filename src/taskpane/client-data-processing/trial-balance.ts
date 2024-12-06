import { getExcelContext } from "../utils.ts/helperFunctions";
import { clientCodeToCerysObject } from "../utils.ts/taskpane/cerys-item-retrieval";
import { checkNewTransForAssets, processTransBatch } from "../utils.ts/transactions/transactions";

export async function enterTB(session) {
  const context = await getExcelContext();
  const journals = await handleTBData(session, context);
  let check = 0;
  const transactions = [];
  journals.forEach((jnl) => {
    const obj = {
      ...jnl,
      value: jnl.value,
      transactionDate: "",
    };
    check += jnl.value;
    transactions.push(obj);
  });
  if (check !== 0) return;
  session["activeJournal"]["journals"] = transactions;
  session["activeJournal"]["journalType"] = "clientTB";
  session["activeJournal"]["journal"] = false;
  session["activeJournal"]["clientTB"] = true;
  console.log(session.activeJournal);
  const newTransactions = await processTransBatch(session);
  checkNewTransForAssets(session, newTransactions);
}

export async function checkTBMapping(session) {
  const context = await getExcelContext();
  const ws = context.workbook.worksheets.getItem("Client TB");
  const range = ws.getUsedRange();
  range.load("values");
  await context.sync();
  const values = range.values;
  const arrays = values.slice(3, values.length - 1);
  const nomCodeObjs = [];
  arrays.forEach((arr) => {
    const obj = {
      clientCode: arr[0],
      clientCodeName: arr[1],
      cerysCode: 0,
      cerysShortName: "",
    };
    nomCodeObjs.push(obj);
  });
  const unmappedCodeObjects = [];
  nomCodeObjs.forEach((code) => {
    let matched = false;
    session.clientChart.forEach((i) => {
      if (code.clientCode === i.clientCode) matched = true;
    });
    if (!matched) unmappedCodeObjects.push(code);
  });
  return unmappedCodeObjects;
}

export async function handleTBData(session, context) {
  const ws = context.workbook.worksheets.getItem("Client TB");
  const range = ws.getUsedRange();
  const values = range.load("values");
  await context.sync();
  const innerValues = values.values;
  const arrays = innerValues.slice(3, innerValues.length - 1);
  const arrObjs = [];
  for (let i = 0; i < arrays.length; i++) {
    const obj = convertToCerysObject(session, arrays[i]);
    obj.clientNominalCode = arrays[i][0];
    if (arrays[i][2]) {
      obj.value = arrays[i][2] * 100;
    } else {
      obj.value = arrays[i][3] * -1 * 100;
    }
    obj.narrative = "Client TB auto-entry";
    arrObjs.push(obj);
  }
  return arrObjs;
}

export function convertToCerysObject(session, formattedTB) {
  const objForPosting = clientCodeToCerysObject(session, formattedTB[0]);
  const copy = { ...objForPosting };
  return copy;
}
