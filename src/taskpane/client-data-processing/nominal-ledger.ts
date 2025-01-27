import { Assignment } from "../classes/assignment";
import { Session } from "../classes/session";
import { postClientNLUrl } from "../fetching/apiEndpoints";
import { fetchOptionsPostClientNL } from "../fetching/generateOptions";
import { ClientTBLineProps } from "../interfaces/interfaces";
/* global Excel */

export async function enterNL(session: Session) {
  const { clientNL, openingBalances } = await createClientNLObject();
  console.log(openingBalances);
  session.assignment.clientNL = clientNL;
  const assignment = await postCltNLToDb(session);
  console.log(assignment);
  session.assignment = new Assignment(assignment);
}

export async function createClientNLObject() {
  try {
    const rtnVal = await Excel.run(async (context) => {
      const clientNL = [];
      const openingBalances: ClientTBLineProps[] = [];
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
            const opBal: ClientTBLineProps = {
              clientCode: operativeCode,
              clientCodeName: nominal,
              value:
                line[7] || line[7] === 0 ? Math.round(line[7] * 100) : line[8] === 0 ? 0 : Math.round(line[8] * -100),
              statement: "NA",
            };
            openingBalances.push(opBal);
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
