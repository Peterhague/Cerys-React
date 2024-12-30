import { Session } from "../../classes/session";
import { createIFARegister, updateIFARegister, updateAssignmentUrl } from "../../fetching/apiEndpoints";
import { fetchOptionsIFA, fetchOptionsUpdateAssignment } from "../../fetching/generateOptions";
import { applyWorkhseetHeader, worksheetHeader } from "../../workbook views/components/schedule-header";
import { calculateDiffInDays } from "../helperFunctions";
import { addOneWorksheet, deleteManyWorksheets } from "../worksheet";
import { createCurrentPeriodRegister } from "./asset-reg-generation";
import { populateAssetRegWs } from "./asset-reg-population";

export function calculateAmortChg(session: Session, tran) {
  const periodEnd = session.activeAssignment.reportingPeriod.reportingDateOrig;
  const daysHeld = calculateDiffInDays(tran.transactionDate, periodEnd) + 1;
  const daysInPeriod = session.activeAssignment.reportingPeriod.noOfDays;
  const charge = Math.round(tran.value * (parseInt(tran.amortRate) / 100) * (daysHeld / daysInPeriod));
  tran.amortChg = charge;
  tran.assetSubCatCodes.push(11);
  const subTran = {
    assetSubCatCode: 11,
    assetSubCategory: "Amort chg",
    regColNameOne: "Amort",
    regColNameTwo: "Charge",
    value: charge,
  };
  tran.subTransactions.push(subTran);
  const jnls = buildAutoAmortJnls(session, tran);
  session.activeJournal.journals.push(jnls.debit);
  session.activeJournal.netValue += jnls["debit"]["value"];
  session.activeJournal.journals.push(jnls.credit);
  session.activeJournal.netValue += jnls["credit"]["value"];
  return `=ROUND(SUM((${tran.value / 100})*(${parseInt(tran.amortRate)}/100)*((${session.activeAssignment.reportingPeriod.reportingDateExcel + 1}-B3)/${daysInPeriod})), 2)`;
  //console.log(excelAmortFormula);
}

export const updateIFANarrative = async (session: Session, tran, e) => {
  session.IFATransactions.forEach((i) => {
    if (i._id === tran._id) {
      i.assetNarrative = e.details.valueAfter;
    }
  });
};

export const buildAutoAmortJnls = (session: Session, tran) => {
  console.log(tran);
  const catNo = tran.assetCategoryNo;
  const jnls = setAutoAmortNominals(catNo);
  session.chart.forEach((nom) => {
    if (nom.cerysCode === jnls.debit) jnls.debit = nom;
    if (nom.cerysCode === jnls.credit) jnls.credit = nom;
  });
  jnls.debit["transactionId"] = tran._id;
  jnls.credit["transactionId"] = tran._id;
  jnls.debit["value"] = tran.amortChg;
  jnls.credit["value"] = tran.amortChg * -1;
  jnls.debit["transactionDate"] = session.activeAssignment.reportingPeriod.reportingDateOrig;
  jnls.credit["transactionDate"] = session.activeAssignment.reportingPeriod.reportingDateOrig;
  jnls.debit["narrative"] = "Amortisation charged automatically";
  jnls.credit["narrative"] = "Amortisation charged automatically";
  return jnls;
};

export const setAutoAmortNominals = (catNo) => {
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

export async function createIFAR(context, session: Session) {
  const assignment = await postIFAtoDB(session);
  session.activeAssignment = assignment;
  createIFARWs(context, session);
}

export async function postIFAtoDB(session: Session) {
  let assignment = session.activeAssignment;
  const options = fetchOptionsIFA(session);
  const endpoint = session.activeAssignment.IFARegisterCreated ? updateIFARegister : createIFARegister;
  const iFARDb = await fetch(endpoint, options);
  const iFAR = await iFARDb.json();
  session.IFARegister = createCurrentPeriodRegister(iFAR, session);
  if (!session.activeAssignment.IFARegisterCreated) {
    const options = fetchOptionsUpdateAssignment(
      session.customer._id,
      session.activeAssignment._id,
      "IFARegisterCreated"
    );
    const assignmentDb = await fetch(updateAssignmentUrl, options);
    assignment = await assignmentDb.json();
  }
  //const updatedAssignmentDb = await fetch(postIFA, options);
  //const updatedAssignment = await updatedAssignmentDb.json();
  console.log(assignment);
  return assignment;
}

export async function createIFARWs(context, session: Session) {
  //const transToPost = session.activeAssignment.IFAR;
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
