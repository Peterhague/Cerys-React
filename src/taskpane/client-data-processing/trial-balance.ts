import { Session } from "../classes/session";
import { ClientCerysCodeObject } from "../interfaces/interfaces";
import { clientCodeToCerysObject } from "../utils.ts/taskpane/cerys-item-retrieval";
import { checkNewTransForAssets, processTransBatch } from "../utils.ts/transactions/transactions";
/* global Excel */

export async function enterTB(session: Session) {
  try {
    await Excel.run(async (context) => {
      const journals = await handleTBData(session);
      let check = 0;
      const transactions = [];
      journals.forEach((jnl) => {
        const obj = {
          ...jnl,
          ...jnl.cerysCodeObj,
          transactionDate: "",
        };
        check += jnl.value;
        transactions.push(obj);
      });
      if (check !== 0) return;
      session.activeJournal.journals = transactions;
      session.activeJournal.journalType = "clientTB";
      session.activeJournal.journal = false;
      session.activeJournal.clientTB = true;
      console.log(session.activeJournal);
      await processTransBatch(context, session);
      checkNewTransForAssets(session);
    });
  } catch (e) {
    console.error(e);
  }
}

export async function checkTBMapping(session: Session) {
  try {
    const rtnVal = await Excel.run(async (context) => {
      // appropriate
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
      await context.sync();
      return unmappedCodeObjects;
    });
    return rtnVal;
  } catch (e) {
    console.error(e);
    return e;
  }
}

export async function handleTBData(session: Session) {
  try {
    const rtnVal = await Excel.run(async (context) => {
      const ws = context.workbook.worksheets.getItem("Client TB");
      const range = ws.getUsedRange();
      const values = range.load("values");
      await context.sync();
      const innerValues = values.values;
      const arrays = innerValues.slice(3, innerValues.length - 1);
      const arrObjs: {
        cerysCodeObj: ClientCerysCodeObject;
        clientNominalCode: number;
        value: number;
        narrative: string;
      }[] = [];
      for (let i = 0; i < arrays.length; i++) {
        const cerysCodeObj = convertToCerysObject(session, arrays[i]);
        const obj = {
          cerysCodeObj,
          clientNominalCode: arrays[i][0],
          value: arrays[i][2] ? arrays[i][2] * 100 : arrays[i][3] * -1 * 100,
          narrative: "Client TB auto-entry",
        };
        // obj.clientNominalCode = arrays[i][0];
        // if (arrays[i][2]) {
        //   obj.value = arrays[i][2] * 100;
        // } else {
        //   obj.value = arrays[i][3] * -1 * 100;
        // }
        // obj.narrative = "Client TB auto-entry";
        arrObjs.push(obj);
      }
      await context.sync();
      return arrObjs;
    });
    return rtnVal;
  } catch (e) {
    console.error(e);
    return e;
  }
}

export function convertToCerysObject(session: Session, formattedTB) {
  const objForPosting = clientCodeToCerysObject(session, formattedTB[0]);
  const copy = { ...objForPosting };
  return copy;
}
