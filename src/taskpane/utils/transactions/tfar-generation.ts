import { AssetRegister } from "../../classes/asset-register";
import { Assignment } from "../../classes/assignment";
import { Session } from "../../classes/session";
import { AssetTransaction } from "../../classes/transaction";
import { createTFARegister, updateAssignmentUrl, updateTFARegister } from "../../fetching/apiEndpoints";
import { fetchOptionsTFA, fetchOptionsUpdateAssignment } from "../../fetching/generateOptions";
import { AssetRegisterDb, AssignmentProps } from "../../interfaces/interfaces";
import { applyWorkhseetHeader, worksheetHeader } from "../../workbook views/components/schedule-header";
import { addOneWorksheet, deleteManyWorksheets } from "../worksheet";
import { populateAssetRegWs } from "./asset-reg-population";
/* global Excel */

export const createTFAR = async (session: Session, relevantTrans: AssetTransaction[]) => {
  console.log(relevantTrans);
  const assignment = await postTFAtoDB(session, relevantTrans);
  if (assignment) session.assignment = new Assignment(assignment);
  createTFARWs(session);
};

export async function postTFAtoDB(session: Session, relevantTrans: AssetTransaction[]) {
  const options = fetchOptionsTFA(session, relevantTrans);
  const endpoint = session.assignment.TFARegisterCreated ? updateTFARegister : createTFARegister;
  const tFARDb = await fetch(endpoint, options);
  const tFAR: AssetRegisterDb = await tFARDb.json();
  console.log(tFAR);
  session.TFARegister = new AssetRegister(session, tFAR, "Tangible");
  if (!session.assignment.TFARegisterCreated) {
    const options = fetchOptionsUpdateAssignment(
      session.customer.customerId,
      session.assignment.assignmentId,
      "TFARegisterCreated"
    );
    const assignmentDb = await fetch(updateAssignmentUrl, options);
    const assignment: AssignmentProps = await assignmentDb.json();
    return assignment;
  } else {
    return null;
  }
}

export async function createTFARWs(session: Session) {
  try {
    await Excel.run(async (context) => {
      const register = session.TFARegister;
      const activeCatsNames = [];
      const TFAActiveCats = [];
      register.assets.forEach((i) => {
        if (!activeCatsNames.includes(i.assetCategory)) {
          activeCatsNames.push(i.assetCategory);
          TFAActiveCats.push({
            assetCategory: i.assetCategory,
            assetCategoryNo: i.assetCategoryNo,
          });
        }
      });
      TFAActiveCats.sort((a, b) => {
        return a.assetCategoryNo - b.assetCategoryNo;
      });
      const wsName = "TFA Register";
      const { ws } = await addOneWorksheet(context, session, { name: wsName, addListeners: undefined });
      const wsHeaders = worksheetHeader(session, "Tangible fixed assets register");
      applyWorkhseetHeader(ws, wsHeaders);
      populateAssetRegWs(TFAActiveCats, register, ws, "TFA");
      ws.activate();
      deleteManyWorksheets(context, ["TFA Transactions"]);
    });
  } catch (e) {
    console.error(e);
  }
}
