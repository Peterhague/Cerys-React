import { postJournalBatch, updateTransactionBatch } from "../../fetching/apiEndpoints";
import { fetchOptionsTransBatch, fetchOptionsTransBatchUpdate } from "../../fetching/generateOptions";
import { wsBalanceSheet } from "../../workbook views/workbook-templates/financial-statements/balance-sheet";
import { wsPLAccount } from "../../workbook views/workbook-templates/financial-statements/p&laccount";
import { calculateExcelDate, callNextView } from "../helperFunctions";
import { postTbToWbook, tbForPosting } from "../trial-balance/tb-maintenance";
import { addBsClickListener, addPlClickListener, addTbClickListener } from "../worksheet-drilling/cerys-drilling";

export const processTransBatch = async (session) => {
    console.log("yes still owrking here")
  const activeJournal = session["activeJournal"];
  const transactions = [];
  activeJournal.journals.forEach((jnl) => {
    const periodStartDate = session.activeAssignment.reportingPeriod.periodStart.split("T")[0];
    if (jnl.narrative === "") jnl.narrative = "No narrative";
    if (jnl.transactionDate === "") {
      if (
        jnl.assetSubCategory === "Cost bfwd" ||
        jnl.assetSubCategory === "Amort bfwd" ||
        jnl.assetSubCategory === "Depn bfwd"
      ) {
        jnl.transactionDate = periodStartDate;
      } else {
        jnl.transactionDate = session.activeAssignment.reportingPeriod.reportingDateOrig;
      }
    }
    jnl.transactionDateExcel = calculateExcelDate(jnl.transactionDate);
    jnl.transactionType = activeJournal.journalType;
    jnl.clientTB = activeJournal.clientTB;
    jnl.journal = activeJournal.journal;
    transactions.push(jnl);
  });
  const transDtls = { customerId: session["customer"]["_id"], assignmentId: session["activeAssignment"]["_id"] };
  const transactionType = activeJournal.journalType;
  const updatedCustAndAss = await postTransactionsDb(transactions, transDtls, transactionType);
  session["activeAssignment"] = updatedCustAndAss.assignment;
  updatedCustAndAss.newTransactions.forEach((tran) => {
    tran.processedAsAsset = false;
  });
  session["activeJournal"] = { journals: [], netValue: 0, journalType: "journal", journal: true, clientTB: false };
  const tbArray = tbForPosting(session["activeAssignment"]["tb"]);
  await postTbToWbook(session, tbArray);
  await wsPLAccount(session);
  await wsBalanceSheet(session);
  addTbClickListener(session);
  addPlClickListener(session["activeAssignment"]);
  addBsClickListener(session["activeAssignment"]);
  return updatedCustAndAss.newTransactions;
};

export const processUpdateBatch = async (session) => {
  const options = fetchOptionsTransBatchUpdate(session);
  const updatedAssignmentAndTransDB = await fetch(updateTransactionBatch, options);
  const updatedAssignmentAndTrans = await updatedAssignmentAndTransDB.json();
  const updatedTransactions = updatedAssignmentAndTrans.processedTrans;
  updatedTransactions.forEach((tran) => {
    tran.processedAsAsset = false;
  });
  session["activeAssignment"] = updatedAssignmentAndTrans.assignment;
  session["updatedTransactions"] = [];
  return updatedTransactions;
};

export const checkAssetRegStatus = (session, handleView) => {
  if (
    !session["activeAssignment"]["IFARegisterCreated"] &&
    session["activeAssignment"]["activeCategories"].includes("Intangible assets") &&
    (session["activeAssignment"]["activeAssetCodeTypes"].includes("iFACostAddns") ||
      session["activeAssignment"]["activeAssetCodeTypes"].includes("iFACostBF"))
  ) {
    handleView("promptIFARCreation");
  } else if (
    !session["activeAssignment"]["TFARegisterCreated"] &&
    session["activeAssignment"]["activeCategories"].includes("Tangible assets") &&
    (session["activeAssignment"]["activeAssetCodeTypes"].includes("tFACostAddns") ||
      session["activeAssignment"]["activeAssetCodeTypes"].includes("tFACostBF"))
  ) {
    handleView("promptTFARCreation");
  } else if (
    !session["activeAssignment"]["IPRegisterCreated"] &&
    session["activeAssignment"]["activeCategories"].includes("Investment property") &&
    (session["activeAssignment"]["activeAssetCodeTypes"].includes("iPCostAddns") ||
      session["activeAssignment"]["activeAssetCodeTypes"].includes("iPCostBF"))
  ) {
    handleView("promptIPRCreation");
  } else {
    console.log("next view called");
    callNextView(session);
  }
  //if (
  //  session["activeAssignment"]["activeCategories"].includes("Intangible assets") &&
  //  (session["activeAssignment"]["activeAssetCodeTypes"].includes("iFACostAddns") ||
  //    session["activeAssignment"]["activeAssetCodeTypes"].includes("iFACostBF"))
  //) {
  //  handleView("promptIFARCreation");
  //} else if (
  //  !session["activeAssignment"]["TFARegisterCreated"] &&
  //  session["activeAssignment"]["activeCategories"].includes("Tangible assets") &&
  //  (session["activeAssignment"]["activeAssetCodeTypes"].includes("tFACostAddns") ||
  //    session["activeAssignment"]["activeAssetCodeTypes"].includes("tFACostBF"))
  //) {
  //  handleView("promptTFARCreation");
  //} else if (
  //  !session["activeAssignment"]["IPRegisterCreated"] &&
  //  session["activeAssignment"]["activeCategories"].includes("Investment property") &&
  //  (session["activeAssignment"]["activeAssetCodeTypes"].includes("iPCostAddns") ||
  //    session["activeAssignment"]["activeAssetCodeTypes"].includes("iPCostBF"))
  //) {
  //  handleView("promptIPRCreation");
  //} else {
  //  callNextView(session);
  //}
};

export const checkNewTransForAssets = (session, newTransactions) => {
  //const newTransactions = session.latestTransactions;
  console.log(newTransactions);
  session.newFATransactions = newTransactions;
  let nextView = true;
  for (let i = 0; i < newTransactions.length; i++) {
    if (
      newTransactions[i].processedAsAsset === false &&
      (newTransactions[i].assetCodeType === "iFACostAddns" || newTransactions[i].assetCodeType === "iFACostBF")
    ) {
      session.handleView("promptIFARCreation");
      nextView = false;
      break;
    } else if (
      newTransactions[i].processedAsAsset === false &&
      (newTransactions[i].assetCodeType === "tFACostAddns" || newTransactions[i].assetCodeType === "tFACostBF")
    ) {
      session.handleView("promptTFARCreation");
      nextView = false;
      break;
    } else if (
      newTransactions[i].processedAsAsset === false &&
      (newTransactions[i].assetCodeType === "iPCostAddns" || newTransactions[i].assetCodeType === "iPCostBF")
    ) {
      session.handleView("promptIPRCreation");
      nextView = false;
      break;
    }
  }
  if (nextView) {
    callNextView(session);
    session.newFATranasctions = [];
  }
};

const postTransactionsDb = async (transactions, transDtls, transactionType) => {
  const options = fetchOptionsTransBatch(transactions, transDtls, transactionType);
  const objsDb = await fetch(postJournalBatch, options);
  const objs = await objsDb.json();
  return objs;
};
