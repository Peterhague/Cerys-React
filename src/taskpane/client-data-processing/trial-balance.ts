import { sageCodeToCerysObject } from "../utils.ts/taskpane/cerys-item-retrieval";
import { checkNewTransForAssets, processTransBatch } from "../utils.ts/transactions/transactions";

export async function enterTB(session) {
  try {
    await Excel.run(async (context) => {
      const journals = await handleTBData(context);
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
      const newTransactions = await processTransBatch(session);
      checkNewTransForAssets(session, newTransactions);
    });
  } catch (error) {
    console.error(error);
  }
}

export async function handleTBData(context) {
  const ws = context.workbook.worksheets.getItem("Client TB");
  const range = ws.getUsedRange();
  const values = range.load("values");
  await context.sync();
  const innerValues = values.values;
  const arrays = innerValues.slice(3, innerValues.length - 1);
  const arrObjs = [];
  for (let i = 0; i < arrays.length; i++) {
    const obj = await convertToCerysObject(arrays[i]);
    obj.clientNominalCode = arrays[i][0];
    obj.narrative = "Client TB auto-entry";
    arrObjs.push(obj);
  }
  return arrObjs;
}

export async function convertToCerysObject(formattedTB) {
  const objForPosting = await sageCodeToCerysObject(formattedTB[0]);
  objForPosting.clientNominalCode = formattedTB[0];
  if (formattedTB[2]) {
    objForPosting.value = formattedTB[2] * 100;
  } else {
    objForPosting.value = formattedTB[3] * -1 * 100;
  }
  return objForPosting;
}
