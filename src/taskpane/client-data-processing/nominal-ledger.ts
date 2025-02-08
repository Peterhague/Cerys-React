import { Assignment } from "../classes/assignment";
import { ClientTBBFwdComparison, ClientTBBFwdReconciliation } from "../classes/client-trial-balance-line";
import { InTrayCollection } from "../classes/in-trays/global";
import { createNLEntryCollections } from "../classes/in-trays/templates";
import { Session } from "../classes/session";
import { postClientNLUrl } from "../fetching/apiEndpoints";
import { fetchOptionsPostClientNL } from "../fetching/generateOptions";
import { ClientTBLineProps } from "../interfaces/interfaces";
import { INTRAY_SUMMARY } from "../static-values/views";
/* global Excel */

export async function enterNL(session: Session) {
  const { clientNL, openingBalances } = await createClientNLObject();
  session.assignment.clientNL = clientNL;
  const assignment = await postCltNLToDb(session);
  session.assignment = new Assignment(assignment);
  const inTrayCollections: InTrayCollection[] = createNLEntryCollections(session, openingBalances);
  const inTray = session.assignment.inTray;
  inTrayCollections.forEach((collection) => {
    if (collection.getItems(session).length > 0) {
      inTray.addCollection(collection);
    }
  });
  inTrayCollections.find((i) => i.getItems(session).length > 0) && session.handleDynamicView(INTRAY_SUMMARY, inTray);
}

export async function createClientNLObject() {
  try {
    const rtnVal = await Excel.run(async (context) => {
      const clientNL = [];
      const openingBalances: ClientTBLineProps[] = [];
      const ws = context.workbook.worksheets.getItemOrNullObject("Sheet2");
      await context.sync();
      if (ws.isNullObject) {
        return "";
      } else {
        const range = ws.getUsedRange();
        range.load("values");
        await context.sync();
        const values = range.values;
        let operativeCode = 0;
        let nominal: string;
        values.forEach((line) => {
          if (line[0] && line[1] && typeof line[1] === "string") {
            operativeCode = line[0];
            nominal = line[1];
          }
          if (typeof line[0] === "number" && typeof line[1] === "number") {
            let transObj: { code: number; name: string; number: number; date: number; detail: string; value: number } =
              {
                code: operativeCode,
                name: nominal,
                number: line[0],
                date: line[1],
                detail: line[6] ? line[6] : "No detail provided",
                value: line[7] ? line[7] * 100 : line[8] * -100,
              };
            clientNL.push(transObj);
          }
          if (line[6] === "Opening Balance:") {
            if (line[7] || line[8]) {
              const opBal: ClientTBLineProps = {
                clientCode: operativeCode,
                clientCodeName: nominal,
                value: line[7] ? Math.round(line[7] * 100) : Math.round(line[8] * -100),
                statement: "NA",
              };
              openingBalances.push(opBal);
            }
          }
        });
      }
      await context.sync();
      return { clientNL, openingBalances };
    });
    return rtnVal;
  } catch (e) {
    console.error(e);
    return e;
  }
}

export const postCltNLToDb = async (session: Session) => {
  let assignmentId = session.assignment._id;
  let customerId = session.customer._id;
  let clientNL = session.assignment.clientNL;
  const options = fetchOptionsPostClientNL(clientNL, assignmentId, customerId);
  const updatedAssignmentDb = await fetch(postClientNLUrl, options);
  const updatedAssignment = await updatedAssignmentDb.json();
  return updatedAssignment;
};

// export const createNLEntryInTray = (session: Session, openingBalances: ClientTBLineProps[]) => {
//   const inTrayTemplate = new InTrayNominalLedgerEntry(session, openingBalances);
//   return inTrayTemplate;
// };

export const reconcileClientBFTB = (session: Session, openingBalances: ClientTBLineProps[]) => {
  const comparisonArray = session.clientBFwdTB.map((cerysItem) => new ClientTBBFwdComparison(cerysItem, "Cerys"));
  openingBalances.forEach((opBal) => {
    const existingItem = comparisonArray.find((i) => i.clientCode === opBal.clientCode);
    existingItem
      ? (existingItem.clientValue = opBal.value)
      : comparisonArray.push(new ClientTBBFwdComparison(opBal, "Client"));
  });
  const reconcilationObj = new ClientTBBFwdReconciliation(session.clientBFwdTB, openingBalances);
  return reconcilationObj;
};
