import { postClientNLUrl } from "../fetching/apiEndpoints";
import { fetchOptionsPostClientNL } from "../fetching/generateOptions";

export async function enterNL(session, updateSession) {
  try {
    await Excel.run(async (context) => {
      await postClientNLMem(session, context);
      postCltNltoDb(session);
      updateSession(session);
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
}

const postClientNLMem = async (session, context) => {
  const clientNL = await createClientNLObject(context);
  session.activeAssignment.clientNL = clientNL;
  session.activeAssignment.NLentered = true;
};

export async function createClientNLObject(context) {
  const clientNL = [];
  const ws = context.workbook.worksheets.getItemOrNullObject("Client NL");
  ws.load("values");
  await context.sync();
  if (ws.isNullObject) {
    //addWorksheet(context, "Client NL");
    return "";
  } else {
    const range = ws.getUsedRange();
    const values = range.load("values");
    await context.sync();
    const innerValues = values.values;
    let operativeCode = 0;
    let nominal;
    innerValues.forEach((line) => {
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
    await context.sync();
    return clientNL;
  }
}

export async function postCltNltoDb(session) {
  let assignmentId = session.activeAssignment._id;
  let customerId = session.customer._id;
  let clientNL = session.activeAssignment.clientNL;
  const options = fetchOptionsPostClientNL(clientNL, assignmentId, customerId);
  const updatedCustAndAssDb = await fetch(postClientNLUrl, options);
  const updatedCustAndAss = await updatedCustAndAssDb.json();
  console.log(updatedCustAndAss);
}
