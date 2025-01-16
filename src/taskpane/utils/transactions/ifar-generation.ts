import { Assignment } from "../../classes/assignment";
import { Session } from "../../classes/session";
import { createIFARegister, updateIFARegister, updateAssignmentUrl } from "../../fetching/apiEndpoints";
import { fetchOptionsIFA, fetchOptionsUpdateAssignment } from "../../fetching/generateOptions";
import { DetailedTransaction } from "../../interfaces/interfaces";
import { applyWorkhseetHeader, worksheetHeader } from "../../workbook views/components/schedule-header";
import { addOneWorksheet, deleteManyWorksheets } from "../worksheet";
import { createCurrentPeriodRegister } from "./asset-reg-generation";
import { populateAssetRegWs } from "./asset-reg-population";
/* global Excel */

export const setAutoAmortNominals = (catNo: number) => {
  switch (catNo) {
    case 1:
      return { debit: 3891, credit: 5032 };
    case 2:
      return { debit: 3892, credit: 5052 };
    case 3:
      return { debit: 3893, credit: 5072 };
    case 4:
      return { debit: 3894, credit: 5092 };
    default:
      return { debit: 3890, credit: 5012 };
  }
};

export const adjustAutoAmortJnls = (session: Session, tran, charge) => {
  session.activeJournal.journals.forEach((jnl) => {
    if (jnl.transactionId === tran._id) {
      if (jnl.value > 0) jnl.value = charge;
      if (jnl.value < 0) jnl.value = charge * -1;
    }
  });
};

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
  const iFAR = await iFARDb.json();
  session.IFARegister = createCurrentPeriodRegister(iFAR, session);
  if (!session.assignment.IFARegisterCreated) {
    const options = fetchOptionsUpdateAssignment(session.customer._id, session.assignment._id, "IFARegisterCreated");
    const assignmentDb = await fetch(updateAssignmentUrl, options);
    assignment = await assignmentDb.json();
  }
  console.log(assignment);
  return assignment;
}

export async function createIFARWs(context: Excel.RequestContext, session: Session) {
  //const transToPost = session.assignment.IFAR;
  const transToPost = session.IFARegister;
  console.log(transToPost);
  const activeCatsNames = [];
  const IFAActiveCats = [];
  transToPost.forEach((i) => {
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
