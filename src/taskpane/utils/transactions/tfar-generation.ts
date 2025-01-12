import { Assignment } from "../../classes/assignment";
import { Session } from "../../classes/session";
import { AssetTransaction } from "../../classes/transaction";
import { createTFARegister, updateAssignmentUrl, updateTFARegister } from "../../fetching/apiEndpoints";
import { fetchOptionsTFA, fetchOptionsUpdateAssignment } from "../../fetching/generateOptions";
import { DetailedTransaction } from "../../interfaces/interfaces";
import { applyWorkhseetHeader, worksheetHeader } from "../../workbook views/components/schedule-header";
import { addOneWorksheet, deleteManyWorksheets } from "../worksheet";
import { createCurrentPeriodRegister } from "./asset-reg-generation";
import { populateAssetRegWs } from "./asset-reg-population";
/* global Excel */

export const setAutoDepnNominals = (catNo) => {
  switch (catNo) {
    case 1:
      return { debit: 3901, credit: 5132 };
    case 2:
      return { debit: 3902, credit: 5152 };
    case 3:
      return { debit: 3903, credit: 5172 };
    case 4:
      return { debit: 3904, credit: 5192 };
    case 5:
      return { debit: 3905, credit: 5212 };
    case 6:
      return { debit: 3906, credit: 5232 };
    case 7:
      return { debit: 3907, credit: 5252 };
    case 8:
      return { debit: 3908, credit: 5272 };
    case 9:
      return { debit: 3909, credit: 5292 };
    default:
      return undefined;
  }
};

export async function createTFAR(
  context: Excel.RequestContext,
  session: Session,
  relevantTrans: DetailedTransaction[]
) {
  const assignment = await postTFAtoDB(session, relevantTrans);
  session.assignment = new Assignment(assignment);
  console.log(session);
  createTFARWs(context, session);
}

export async function postTFAtoDB(session: Session, relevantTrans: DetailedTransaction[]) {
  let assignment = session.assignment;
  const options = fetchOptionsTFA(session, relevantTrans);
  const endpoint = session.assignment.TFARegisterCreated ? updateTFARegister : createTFARegister;
  const tFARDb = await fetch(endpoint, options);
  const tFAR = await tFARDb.json();
  session.TFARegister = createCurrentPeriodRegister(tFAR, session);
  if (!session.assignment.TFARegisterCreated) {
    const options = fetchOptionsUpdateAssignment(session.customer._id, session.assignment._id, "TFARegisterCreated");
    const assignmentDb = await fetch(updateAssignmentUrl, options);
    assignment = await assignmentDb.json();
  }
  console.log(assignment);
  return assignment;
}

export async function createTFARWs(context, session: Session) {
  const transToPost = session.TFARegister;
  const activeCatsNames = [];
  const TFAActiveCats = [];
  transToPost.forEach((i) => {
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
  populateAssetRegWs(TFAActiveCats, transToPost, ws, "TFA");
  ws.activate();
  deleteManyWorksheets(context, ["TFA Transactions"]);
}
