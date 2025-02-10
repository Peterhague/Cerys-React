import { AssetRegister } from "../../classes/asset-register";
import { Assignment } from "../../classes/assignment";
import { Session } from "../../classes/session";
import { AssetTransaction } from "../../classes/transaction";
import { createIPRegister, updateAssignmentUrl, updateIPRegister } from "../../fetching/apiEndpoints";
import { fetchOptionsIP, fetchOptionsUpdateAssignment } from "../../fetching/generateOptions";
import { AssetRegisterDb, AssignmentProps } from "../../interfaces/interfaces";
import { applyWorkhseetHeader, worksheetHeader } from "../../workbook views/components/schedule-header";
import { addOneWorksheet, deleteManyWorksheets } from "../worksheet";
import { populateAssetRegWs } from "./asset-reg-population";
/* global Excel */

export async function createIPR(session: Session, relevantTrans: AssetTransaction[]) {
  const assignment = await postIPtoDB(session, relevantTrans);
  if (assignment) session.assignment = new Assignment(assignment);
  createIPRWs(session);
}

export async function postIPtoDB(session: Session, relevantTrans: AssetTransaction[]) {
  const options = fetchOptionsIP(session, relevantTrans);
  const endpoint = session.assignment.IPRegisterCreated ? updateIPRegister : createIPRegister;
  const iPRDb = await fetch(endpoint, options);
  const iPR: AssetRegisterDb = await iPRDb.json();
  session.IPRegister = new AssetRegister(session, iPR, "Investment property");
  if (!session.assignment.IPRegisterCreated) {
    const options = fetchOptionsUpdateAssignment(
      session.customer.customerId,
      session.assignment.assignmentId,
      "IPRegisterCreated"
    );
    const assignmentDb = await fetch(updateAssignmentUrl, options);
    const assignment: AssignmentProps = await assignmentDb.json();
    return assignment;
  } else {
    return null;
  }
}

export async function createIPRWs(session: Session) {
  try {
    await Excel.run(async (context) => {
      const activeCatsNames = [];
      const IPActiveCats = [];
      const IPRegister = session.IPRegister;
      IPRegister.assets.forEach((i) => {
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
      populateAssetRegWs(IPActiveCats, IPRegister, ws, "IP");
      ws.activate();
      deleteManyWorksheets(context, ["IP Transactions"]);
    });
  } catch (e) {
    console.error(e);
  }
}
