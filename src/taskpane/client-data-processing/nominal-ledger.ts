import { Assignment } from "../classes/assignment";
import { Session } from "../classes/session";
import { postClientNLUrl } from "../fetching/apiEndpoints";
import { fetchOptionsPostClientNL } from "../fetching/generateOptions";
/* global Excel */

export async function enterNL(session: Session) {
  const clientNL = await createClientNLObject();
  session.assignment.clientNL = clientNL;
  const { customer, assignment } = await postCltNLToDb(session);
  session.assignment = new Assignment(assignment);
  session.customer = customer;
}

export async function createClientNLObject() {
  try {
    const rtnVal = await Excel.run(async (context) => {
      const clientNL = [];
      const ws = context.workbook.worksheets.getItemOrNullObject("Client NL");
      await context.sync();
      if (ws.isNullObject) {
        return "";
      } else {
        const range = ws.getUsedRange();
        range.load("values");
        await context.sync();
        const values = range.values;
        let operativeCode = 0;
        let nominal;
        values.forEach((line) => {
          if (line[0] && line[1] && typeof line[1] === "string") {
            operativeCode = line[0];
            nominal = line[1];
          }
          if (typeof line[0] === "number" && typeof line[1] === "number") {
            let transObj = {};
            transObj["code"] = operativeCode;
            transObj["name"] = nominal;
            transObj["number"] = line[0];
            transObj["date"] = line[1];
            line[6] ? (transObj["detail"] = line[6]) : (transObj["detail"] = "No detail provided");
            line[7] ? (transObj["value"] = line[7] * 100) : (transObj["value"] = line[8] * -100);
            clientNL.push(transObj);
          }
        });
      }
      await context.sync();
      return clientNL;
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
  const updatedCustAndAssDb = await fetch(postClientNLUrl, options);
  const updatedCustAndAss = await updatedCustAndAssDb.json();
  return updatedCustAndAss;
};
