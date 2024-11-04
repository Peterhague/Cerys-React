import { postJournalBatch } from "../../fetching/apiEndpoints";
import { fetchOptionsTransBatch } from "../../fetching/generateOptions";
import { wsBalanceSheet } from "../../workbook views/workbook-templates/financial-statements/balance-sheet";
import { wsPLAccount } from "../../workbook views/workbook-templates/financial-statements/p&laccount";
import { calculateExcelDate, callNextView } from "../helperFunctions";
import { postTbToWbook, tbForPosting } from "../trial-balance/tb-maintenance";
import { addBsClickListener, addPlClickListener, addTbClickListener } from "../worksheet-drilling/cerys-drilling";

export const processTransBatch = async (session) => {
  const activeJournal = session["activeJournal"];
  const transactions = [];
  console.log(activeJournal.journals);
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
  //postTransactionsMem(session, transactions);
  const transactionType = activeJournal.journalType;
  const updatedCustAndAss = await postTransactionsDb(transactions, transDtls, transactionType);
  session["activeAssignment"] = updatedCustAndAss.assignment;
  session["customer"] = updatedCustAndAss.customer;
  session["activeJournal"] = { journals: [], netValue: 0, journalType: "journal", journal: true, clientTB: false };
  const tbArray = tbForPosting(session["activeAssignment"]["tb"]);
  await postTbToWbook(session, tbArray);
  await wsPLAccount(session);
  await wsBalanceSheet(session);
  addTbClickListener(session);
  addPlClickListener(session["activeAssignment"]);
  addBsClickListener(session["activeAssignment"]);
  //checkAssetRegStatus(session, handleView);
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
    callNextView(session);
  }
};

const postTransactionsDb = async (transactions, transDtls, transactionType) => {
  const options = fetchOptionsTransBatch(transactions, transDtls, transactionType);
  const objsDb = await fetch(postJournalBatch, options);
  const objs = await objsDb.json();
  console.log(objs);
  return objs;
};

//const postTransactionsMem = (session, transactions) => {
//  const actAss = session["activeAssignment"];
//  actAss.transactions.push(...transactions);
//  actAss.transactionsPosted = true;
//  const tb = tbCreator(actAss.transactions);
//  actAss.tb = tb;
//  const activeCats = setActiveCategories(tb);
//  console.log(activeCats);
//  actAss.activeCategoriesDetails = activeCats.arrCats;
//  actAss.activeCategories = activeCats.categories;
//  actAss.activeAssetCodeTypes = setActiveAssetCodeTypes(tb);
//  if (session.activeJournal.journalType === "clientTB") actAss.TBEntered = true;
//  session["activeAssignment"] = actAss;
//};

//function tbCreator(transactions) {
//  const tbCodes = [];
//  transactions.forEach((tran) => {
//    if (!tbCodes.includes(tran.cerysCode)) {
//      tbCodes.push(tran.cerysCode);
//    }
//  });
//  const tb = [];
//  populateTransactions(transactions, tbCodes, tb);
//  return tb;
//}

//function populateTransactions(transactions, tbCodes, tb) {
//  tbCodes.forEach((code) => {
//    const obj = {};
//    obj["cerysCode"] = code;
//    obj["value"] = 0;
//    transactions.forEach((tran) => {
//      if (tran.cerysCode === code) {
//        obj["cerysName"] = tran.cerysName;
//        obj["value"] += tran.value;
//        obj["cerysCategory"] = tran.cerysCategory;
//        obj["assetCodeType"] = tran.assetCodeType;
//      }
//    });
//    tb.push(obj);
//  });
//}

//function setActiveCategories(tb) {
//  const categories = [];
//  tb.forEach((line) => {
//    if (!categories.includes(line.cerysCategory)) {
//      categories.push(line.cerysCategory);
//    }
//  });
//  const arrCats = [];
//  categories.forEach((cat) => {
//    const obj = {};
//    obj["cerysCategory"] = cat;
//    obj["value"] = 0;
//    obj["cerysCodes"] = [];
//    tb.forEach((line) => {
//      if (line.cerysCategory === cat) {
//        obj["value"] += line.value;
//        obj["cerysCodes"].push(line.cerysCode);
//      }
//    });
//    arrCats.push(obj);
//  });
//  return { arrCats, categories };
//}

//function setActiveAssetCodeTypes(tb) {
//  const assetCodeTypes = [];
//  tb.forEach((line) => {
//    if (!assetCodeTypes.includes(line.assetCodeType)) {
//      line.assetCodeType && assetCodeTypes.push(line.assetCodeType);
//    }
//  });
//  return assetCodeTypes;
//}
