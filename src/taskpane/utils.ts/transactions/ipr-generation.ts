import { Session } from "../../classes/session";
import { postIP } from "../../fetching/apiEndpoints";
import { fetchOptionsIP } from "../../fetching/generateOptions";
import { applyWorkhseetHeader, worksheetHeader } from "../../workbook views/components/schedule-header";
import { addOneWorksheet, deleteManyWorksheets } from "../worksheet";
import { populateAssetRegWs } from "./asset-reg-population";

export async function createIPR(context, session: Session) {
  await postIPtoDB(session);
  createIPRWs(context, session);
}

export async function postIPtoDB(session: Session) {
  const options = fetchOptionsIP(session);
  const updatedAssignmentDb = await fetch(postIP, options);
  const updatedAssignment = await updatedAssignmentDb.json();
  session.activeAssignment = updatedAssignment;
  console.log(updatedAssignment);
}

export async function createIPRWs(context, session: Session) {
  const transToPost = session.IPTransactions;
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
  const { ws } = await addOneWorksheet(context, session, { name: wsName, addListners: undefined });
  const wsHeaders = worksheetHeader(session, "Investment property register");
  applyWorkhseetHeader(ws, wsHeaders);
  populateAssetRegWs(IPActiveCats, transToPost, ws, "IP");
  ws.activate();
  deleteManyWorksheets(context, ["IP Transactions"]);
}
