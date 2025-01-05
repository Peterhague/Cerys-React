import { Assignment } from "../../classes/assignment";
import { Session } from "../../classes/session";
import { createIPRegister, updateAssignmentUrl, updateIPRegister } from "../../fetching/apiEndpoints";
import { fetchOptionsIP, fetchOptionsUpdateAssignment } from "../../fetching/generateOptions";
import { applyWorkhseetHeader, worksheetHeader } from "../../workbook views/components/schedule-header";
import { addOneWorksheet, deleteManyWorksheets } from "../worksheet";
import { createCurrentPeriodRegister } from "./asset-reg-generation";
import { populateAssetRegWs } from "./asset-reg-population";
/* global Excel */

export async function createIPR(context: Excel.RequestContext, session: Session) {
  const assignment = await postIPtoDB(session);
  session.assignment = new Assignment(assignment);
  createIPRWs(context, session);
}

export async function postIPtoDB(session: Session) {
  let assignment = session.assignment;
  console.log(session.IPTransactions["subTransactions"]);
  const options = fetchOptionsIP(session);
  const endpoint = session.assignment.IPRegisterCreated ? updateIPRegister : createIPRegister;
  const iPRDb = await fetch(endpoint, options);
  const iPR = await iPRDb.json();
  session.IPRegister = createCurrentPeriodRegister(iPR, session);
  if (!session.assignment.IPRegisterCreated) {
    const options = fetchOptionsUpdateAssignment(session.customer._id, session.assignment._id, "IPRegisterCreated");
    const assignmentDb = await fetch(updateAssignmentUrl, options);
    assignment = await assignmentDb.json();
  }
  return assignment;
}

export async function createIPRWs(context: Excel.RequestContext, session: Session) {
  console.log(session.IPRegister);
  const transToPost = session.IPRegister;
  const activeCatsNames = [];
  const IPActiveCats = [];
  transToPost.forEach((i) => {
    if (!activeCatsNames.includes(i.assetCategory)) {
      activeCatsNames.push(i.assetCategory);
      IPActiveCats.push({
        assetCategory: i.assetCategory,
        assetCategoryNo: i.assetCategoryNo,
      });
    }
  });
  IPActiveCats.sort((a, b) => {
    return a.assetCategoryNo - b.assetCategoryNo;
  });
  const wsName = "IP Register";
  const { ws } = await addOneWorksheet(context, session, { name: wsName, addListeners: undefined });
  console.log(ws);
  const wsHeaders = worksheetHeader(session, "Investment property register");
  applyWorkhseetHeader(ws, wsHeaders);
  populateAssetRegWs(IPActiveCats, transToPost, ws, "IP");
  ws.activate();
  deleteManyWorksheets(context, ["IP Transactions"]);
}
