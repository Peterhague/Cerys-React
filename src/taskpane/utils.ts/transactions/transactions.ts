import { postJournalBatch } from "../../fetching/apiEndpoints";
import { fetchOptionsTransBatch } from "../../fetching/generateOptions";
import { wsBalanceSheet } from "../../workbook views/workbook-templates/financial-statements/balance-sheet";
import { wsPLAccount } from "../../workbook views/workbook-templates/financial-statements/p&laccount";
import { calculateExcelDate } from "../helperFunctions";
import { postTbToWbook, tbForPosting } from "../trial-balance/tb-maintenance";
import { addBsClickListener, addPlClickListener, addTbClickListener } from "../worksheet-drilling/cerys-drilling";

export const processTransBatch = async (session, handleView) => {
  const activeJournal = session["activeJournal"];
  console.log(activeJournal);
  const transactions = [];
  activeJournal.journals.forEach((jnl) => {
    const newDate = session.activeAssignment.reportingPeriod.reportingDateConverted.split("/");
    const jnlDate = `${newDate[2]}-${newDate[1]}-${newDate[0]}`;
    const trans = {};
    if (jnl.narrative === "") jnl.narrative = "No narrative";
    if (jnl.journalDate === "") jnl.journalDate = jnlDate;
    trans["transactionDateExcel"] = calculateExcelDate(jnl.journalDate);
    trans["cerysCode"] = jnl.code;
    trans["cerysCategory"] = jnl.category;
    trans["cerysSubCategory"] = jnl.subCategory;
    trans["assetCategory"] = jnl.assetCategory;
    trans["assetSubCategory"] = jnl.assetSubCategory;
    trans["assetSubCatCode"] = jnl.assetSubCatCode;
    trans["assetCodeType"] = jnl.assetCodeType;
    trans["regColNameOne"] = jnl.regColNameOne;
    trans["regColNameTwo"] = jnl.regColNameTwo;
    trans["assetCategoryNo"] = jnl.assetCategoryNo;
    trans["cerysName"] = jnl.name;
    trans["cerysShortName"] = jnl.shortName;
    trans["narrative"] = jnl.narrative;
    trans["cerysId"] = jnl._id;
    trans["value"] = jnl.journalValue;
    trans["transactionDate"] = jnl.journalDate;
    trans["clientNominalCode"] = jnl.clientNominalCode;
    trans["transactionType"] = activeJournal.journalType;
    trans["clientTB"] = activeJournal.clientTB;
    trans["journal"] = activeJournal.journal;
    transactions.push(trans);
  });
  const transDtls = { customerId: session["customer"]["_id"], assignmentId: session["activeAssignment"]["_id"] };
  postTransactionsMem(session, transactions);
  postTransactionsDb(transactions, transDtls);
  session["activeJournal"] = { journals: [], netValue: 0, journalType: "journal", journal: true, clientTB: false };
  const tbArray = tbForPosting(session["activeAssignment"]["tb"]);
  await postTbToWbook(session, tbArray);
  await wsPLAccount(session);
  await wsBalanceSheet(session);
  addTbClickListener(session["activeAssignment"]);
  addPlClickListener(session["activeAssignment"]);
  addBsClickListener(session["activeAssignment"]);
  checkAssetRegStatus(session, handleView);
};

export const checkAssetRegStatus = (session, handleView) => {
  console.log(session);
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
    handleView(session["nextView"]);
  }
  session["nextView"] = "";
};

const postTransactionsDb = async (transactions, transDtls) => {
  const options = fetchOptionsTransBatch(transactions, transDtls);
  const objsDb = await fetch(postJournalBatch, options);
  const objs = await objsDb.json();
};

const postTransactionsMem = (session, transactions) => {
  const actAss = session["activeAssignment"];
  actAss.transactions.push(...transactions);
  actAss.transactionsPosted = true;
  const tb = tbCreator(actAss.transactions);
  actAss.tb = tb;
  const activeCats = setActiveCategories(tb);
  actAss.activeCategoriesDetails = activeCats.arrCats;
  actAss.activeCategories = activeCats.categories;
  actAss.activeAssetCodeTypes = setActiveAssetCodeTypes(tb);
  if (session.activeJournal.journalType === "clientTB") actAss.TBEntered = true;
  session["activeAssignment"] = actAss;
};

function tbCreator(transactions) {
  const tbCodes = [];
  transactions.forEach((tran) => {
    if (!tbCodes.includes(tran.cerysCode)) {
      tbCodes.push(tran.cerysCode);
    }
  });
  const tb = [];
  populateTransactions(transactions, tbCodes, tb);
  return tb;
}

function populateTransactions(transactions, tbCodes, tb) {
  tbCodes.forEach((code) => {
    const obj = {};
    obj["code"] = code;
    obj["value"] = 0;
    transactions.forEach((tran) => {
      if (tran.cerysCode === code) {
        obj["name"] = tran.cerysName;
        obj["value"] += tran.value;
        obj["category"] = tran.cerysCategory;
        obj["assetCodeType"] = tran.assetCodeType;
      }
    });
    tb.push(obj);
  });
}

function setActiveCategories(tb) {
  const categories = [];
  tb.forEach((line) => {
    if (!categories.includes(line.category)) {
      categories.push(line.category);
    }
  });
  const arrCats = [];
  categories.forEach((cat) => {
    const obj = {};
    obj["category"] = cat;
    obj["value"] = 0;
    obj["codes"] = [];
    tb.forEach((line) => {
      if (line.category === cat) {
        obj["value"] += line.value;
        obj["codes"].push(line.code);
      }
    });
    arrCats.push(obj);
  });
  return { arrCats, categories };
}

function setActiveAssetCodeTypes(tb) {
  const assetCodeTypes = [];
  tb.forEach((line) => {
    if (!assetCodeTypes.includes(line.assetCodeType)) {
      line.assetCodeType && assetCodeTypes.push(line.assetCodeType);
    }
  });
  return assetCodeTypes;
}
