import { AssetRegister } from "../../classes/asset-register";
import { Assignment } from "../../classes/assignment";
import { Session } from "../../classes/session";
import { createIFARegister, updateIFARegister, updateAssignmentUrl } from "../../fetching/apiEndpoints";
import { fetchOptionsIFA, fetchOptionsUpdateAssignment } from "../../fetching/generateOptions";
import { AssetRegisterDb, DetailedTransaction } from "../../interfaces/interfaces";
import { applyWorkhseetHeader, worksheetHeader } from "../../workbook views/components/schedule-header";
import { addOneWorksheet, deleteManyWorksheets } from "../worksheet";
import { populateAssetRegWs } from "./asset-reg-population";
/* global Excel */

export async function createIFAR(
  context: Excel.RequestContext,
  session: Session,
  relevantTrans: DetailedTransaction[]
) {
  const assignment = await postIFAtoDB(session, relevantTrans);
  session.assignment = new Assignment(assignment);
  createIFARWs(context, session);
}

export async function postIFAtoDB(session: Session, relevantTrans: DetailedTransaction[]) {
  let assignment = session.assignment;
  const options = fetchOptionsIFA(session, relevantTrans);
  const endpoint = session.assignment.IFARegisterCreated ? updateIFARegister : createIFARegister;
  const iFARDb = await fetch(endpoint, options);
  const iFAR: AssetRegisterDb = await iFARDb.json();
  //session.IFARegister = createCurrentPeriodRegister(iFAR, session);
  session.IFARegister = new AssetRegister(session, iFAR, "Intangible");
  if (!session.assignment.IFARegisterCreated) {
    const options = fetchOptionsUpdateAssignment(session.customer._id, session.assignment._id, "IFARegisterCreated");
    const assignmentDb = await fetch(updateAssignmentUrl, options);
    assignment = await assignmentDb.json();
  }
  return assignment;
}

export async function createIFARWs(context: Excel.RequestContext, session: Session) {
  const transToPost = session.IFARegister;
  const activeCatsNames = [];
  const IFAActiveCats = [];
  session.IFARegister.assets.forEach((i) => {
    if (!activeCatsNames.includes(i.assetCategory)) {
      activeCatsNames.push(i.assetCategory);
      IFAActiveCats.push({
        assetCategory: i.assetCategory,
        assetCategoryNo: i.assetCategoryNo,
      });
    }
  });
  IFAActiveCats.sort((a, b) => {
    return a.assetCategoryNo - b.assetCategoryNo;
  });
  const wsName = "IFA Register";
  const { ws } = await addOneWorksheet(context, session, { name: wsName, addListeners: undefined });
  const wsHeaders = worksheetHeader(session, "Intangible fixed assets register");
  applyWorkhseetHeader(ws, wsHeaders);
  populateAssetRegWs(IFAActiveCats, transToPost, ws, "IFA");
  ws.activate();
  deleteManyWorksheets(context, ["IFA Transactions"]);
}
