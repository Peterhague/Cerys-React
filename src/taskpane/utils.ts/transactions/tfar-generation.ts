import { Session } from "../../classes/session";
import { createTFARegister, updateAssignmentUrl, updateTFARegister } from "../../fetching/apiEndpoints";
import { fetchOptionsTFA, fetchOptionsUpdateAssignment } from "../../fetching/generateOptions";
import { applyWorkhseetHeader, worksheetHeader } from "../../workbook views/components/schedule-header";
import { calculateDiffInDays } from "../helperFunctions";
import { addOneWorksheet, deleteManyWorksheets } from "../worksheet";
import { createCurrentPeriodRegister } from "./asset-reg-generation";
import { populateAssetRegWs } from "./asset-reg-population";

export function calculateDepnChg(session: Session, tran) {
  console.log(tran);
  const periodEnd = session.activeAssignment.reportingPeriod.reportingDateOrig;
  const daysHeld = calculateDiffInDays(tran.transactionDate, periodEnd) + 1;
  const daysInPeriod = session.activeAssignment.reportingPeriod.noOfDays;
  const charge = Math.round(tran.value * (parseInt(tran.depnRate) / 100) * (daysHeld / daysInPeriod));
  console.log(charge);
  tran.depnChg = charge;
  tran.assetSubCatCodes.push(11);
  const subTran = {
    assetSubCatCode: 11,
    assetSubCategory: "Depn chg",
    regColNameOne: "Depn",
    regColNameTwo: "Charge",
    value: charge,
  };
  tran.subTransactions.push(subTran);
  const jnls = buildAutoDepnJnls(session, tran);
  session.activeJournal.journals.push(jnls.debit);
  session.activeJournal.netValue += jnls["debit"]["value"];
  session.activeJournal.journals.push(jnls.credit);
  session.activeJournal.netValue += jnls["credit"]["value"];
}

export const buildAutoDepnJnls = (session: Session, tran) => {
  const catNo = tran.assetCategoryNo;
  const jnls = setAutoDepnNominals(catNo);
  session.chart.forEach((nom) => {
    if (nom.cerysCode === jnls.debit) jnls.debit = nom;
    if (nom.cerysCode === jnls.credit) jnls.credit = nom;
  });
  jnls.debit["value"] = tran.depnChg;
  jnls.credit["value"] = tran.depnChg * -1;
  jnls.debit["transactionDate"] = session.activeAssignment.reportingPeriod.reportingDateOrig;
  jnls.credit["transactionDate"] = session.activeAssignment.reportingPeriod.reportingDateOrig;
  jnls.debit["narrative"] = "Depreciation charged automatically";
  jnls.credit["narrative"] = "Depreciation charged automatically";
  return jnls;
};

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

export async function createTFAR(context, session: Session) {
  const assignment = await postTFAtoDB(session);
  session.activeAssignment = assignment;
  createTFARWs(context, session);
}

export async function postTFAtoDB(session: Session) {
  let assignment = session.activeAssignment;
  const options = fetchOptionsTFA(session);
  const endpoint = session.activeAssignment.TFARegisterCreated ? updateTFARegister : createTFARegister;
  const tFARDb = await fetch(endpoint, options);
  const tFAR = await tFARDb.json();
  session.TFARegister = createCurrentPeriodRegister(tFAR, session);
  if (!session.activeAssignment.TFARegisterCreated) {
    const options = fetchOptionsUpdateAssignment(
      session.customer._id,
      session.activeAssignment._id,
      "TFARegisterCreated"
    );
    const assignmentDb = await fetch(updateAssignmentUrl, options);
    assignment = await assignmentDb.json();
  }
  //const updatedAssignmentDb = await fetch(postIFA, options);
  //const updatedAssignment = await updatedAssignmentDb.json();
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
