import { postJournalBatch } from "../../fetching/apiEndpoints";
import { fetchOptionsTransBatch } from "../../fetching/generateOptions";
import { wsBalanceSheet } from "../../workbook views/workbook-templates/financial-statements/balance-sheet";
import { wsPLAccount } from "../../workbook views/workbook-templates/financial-statements/p&laccount";
import { postTbToWbook, tbForPosting } from "../trial-balance/tb-maintenance";
import { addBsClickListener, addPlClickListener, addTbClickListener } from "../worksheet-drilling/cerys-drilling";

export const processTransBatch = async (session, handleView) => {
  const activeJournal = session["activeJournal"];
  const transactions = [];
  activeJournal.journals.forEach((jnl) => {
    const trans = {};
    (trans["cerysCode"] = jnl.code),
      (trans["cerysCategory"] = jnl.category),
      (trans["cerysSubCategory"] = jnl.subCategory),
      (trans["assetCategory"] = jnl.assetCategory),
      (trans["assetCategoryNo"] = jnl.assetCategoryNo),
      (trans["cerysName"] = jnl.name),
      (trans["cerysShortName"] = jnl.shortName),
      (trans["narrative"] = jnl.narrative),
      (trans["cerysId"] = jnl._id),
      (trans["value"] = jnl.journalValue),
      (trans["transactionDate"] = jnl.journalDate),
      (trans["clientNominalCode"] = jnl.clientNominalCode),
      (trans["transactionType"] = activeJournal.journalType),
      (trans["clientTB"] = activeJournal.clientTB),
      (trans["journal"] = activeJournal.journal);
    transactions.push(trans);
  });
  const transDtls = { customerId: session["customer"]["_id"], assignmentId: session["activeAssignment"]["_id"] };
  postTransactionsMem(session, transactions);
  postTransactionsDb(transactions, transDtls);
  const tbArray = tbForPosting(session["activeAssignment"]["tb"]);
  await postTbToWbook(session, tbArray);
  await wsPLAccount(session);
  await wsBalanceSheet(session);
  addTbClickListener(session["activeAssignment"]);
  addPlClickListener(session["activeAssignment"]);
  addBsClickListener(session["activeAssignment"]);
  session["activeJournal"] = { journals: [], netValue: 0, journalType: "journal", journal: true, clientTB: false };
  checkAssetRegStatus(session, handleView);
};

export const checkAssetRegStatus = (session, handleView) => {
  if (
    !session["activeAssignment"]["IFARegisterCreated"] &&
    session["activeAssignment"]["activeCategories"].includes("Intangible assets")
  ) {
    handleView("promptIFARCreation");
  } else if (
    !session["activeAssignment"]["TFARegisterCreated"] &&
    session["activeAssignment"]["activeCategories"].includes("Tangible assets")
  ) {
    handleView("promptTFARCreation");
  } else if (
    !session["activeAssignment"]["IPRegisterCreated"] &&
    session["activeAssignment"]["activeCategories"].includes("Investment property")
  ) {
    handleView("promptIPRCreation");
  } else handleView(session["nextView"]);
  session["nextView"] = "";
};

const postTransactionsDb = async (transactions, transDtls) => {
  const options = fetchOptionsTransBatch(transactions, transDtls);
  const objsDb = await fetch(postJournalBatch, options);
  const objs = await objsDb.json();
  console.log(objs);
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
  session["activeAssignment"] = actAss;
  console.log(session);
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
