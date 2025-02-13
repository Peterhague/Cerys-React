import { Assignment } from "../classes/assignment";
import { ClientCodeObject } from "../classes/client-codes";
import { ClientTrialBalanceLine } from "../classes/client-trial-balance-line";
import { createTBEntryCollections } from "../classes/in-trays/templates";
import { ActiveJournal, Journal } from "../classes/journal";
import { Session } from "../classes/session";
import { postClientTBUrl } from "../fetching/apiEndpoints";
import { fetchOptionsPostClientTB } from "../fetching/generateOptions";
import { ClientCerysCodeObjectProps, ClientTBLineProps, JournalDetailsProps } from "../interfaces/interfaces";
import { INTRAY_SUMMARY } from "../static-values/views";
import { clientCodeToCerysObject } from "../utils/taskpane/cerys-item-retrieval";
import { processTransBatch } from "../utils/transactions/transactions";
/* global Excel */

export async function enterTB(session: Session) {
  const clientTBObjs: ClientTrialBalanceLine[] = await handleTBData(session);
  let check = 0;
  const transactions: JournalDetailsProps[] = [];
  clientTBObjs.forEach((jnl) => {
    const obj: JournalDetailsProps = {
      cerysCode: jnl.cerysCodeObj.cerysCode,
      value: jnl.value,
      transactionType: "client trial balance",
      transactionDate: "",
      narrative: jnl.narrative,
      representsBalanceOfClientCode: jnl.getClientCodeObject(session).clientCode,
    };
    check += jnl.value;
    transactions.push(obj);
  });
  if (check !== 0) return;
  const journals = transactions.map((tran) => new Journal(session, tran));
  const activeJournal = new ActiveJournal({ type: "client trial balance", journals });
  await processTransBatch(session, activeJournal);
  //checkNewTransForAssets(session);
  const clientTB: ClientTBLineProps[] = buildClientTB(session, clientTBObjs);
  postClientTB(session, clientTB);
  const tbEntryCollections = createTBEntryCollections(session);
  const inTray = session.inTray;
  tbEntryCollections.forEach((collection) => {
    if (collection.getItems(session).length > 0) {
      inTray.addCollection(collection);
    }
  });
  session.handleDynamicView(INTRAY_SUMMARY, inTray);
}

export async function checkTBMapping(session: Session) {
  try {
    const rtnVal: ClientCodeObject[] = await Excel.run(async (context) => {
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
      const unmappedCodeObjects: ClientCodeObject[] = [];
      nomCodeObjs.forEach((code) => {
        let matched = false;
        session.clientChart.forEach((i) => {
          if (code.clientCode === i.clientCode) matched = true;
        });
        if (!matched) unmappedCodeObjects.push(new ClientCodeObject(code));
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
      // const ws = context.workbook.worksheets.getItem("Client TB");
      const ws = context.workbook.worksheets.getItem("Sheet1");
      const range = ws.getUsedRange();
      range.load("values");
      await context.sync();
      const values = range.values;
      const arrays = values.slice(3, values.length - 1);
      const arrObjs: ClientTrialBalanceLine[] = [];
      for (let i = 0; i < arrays.length; i++) {
        const cerysCodeObj = convertToCerysObject(session, arrays[i]);
        const cerysCodeObjProps: ClientCerysCodeObjectProps = { ...cerysCodeObj, _id: cerysCodeObj.cerysCodeObjectId };
        const clientNomcCode = arrays[i][0];
        const value = arrays[i][2] ? arrays[i][2] * 100 : arrays[i][3] * -1 * 100;
        arrObjs.push(new ClientTrialBalanceLine(cerysCodeObjProps, clientNomcCode, value, "Client TB auto-entry"));
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

export function convertToCerysObject(session: Session, formattedTB: any[]) {
  const objForPosting = clientCodeToCerysObject(session, formattedTB[0]);
  const copy = { ...objForPosting };
  return copy;
}

export const buildClientTB = (session: Session, clientTBObjs: ClientTrialBalanceLine[]) => {
  const clientTB = clientTBObjs.map((i) => {
    const nomCodeObj = session.clientChart.find((code) => code.clientCode === i.clientNominalCode);
    const obj: ClientTBLineProps = {
      clientCode: i.clientNominalCode,
      clientCodeName: nomCodeObj.clientCodeName,
      value: i.value,
      statement: nomCodeObj.statement,
    };
    return obj;
  });
  return clientTB;
};

export const postClientTB = async (session: Session, clientTB: ClientTBLineProps[]) => {
  const options = fetchOptionsPostClientTB(session, clientTB);
  const assingmentDb = await fetch(postClientTBUrl, options);
  const assignment = await assingmentDb.json();
  session.assignment = new Assignment(assignment);
};

// export const createTBEntryInTray = (session: Session) => {
//   const inTrayTemplate = new InTrayTrialBalanceEntry(session);
//   return inTrayTemplate;
// };
