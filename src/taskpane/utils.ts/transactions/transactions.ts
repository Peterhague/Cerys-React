import { postJournalBatch } from "../../fetching/apiEndpoints";
import { fetchOptionsTransBatch } from "../../fetching/generateOptions";
import { wsBalanceSheet } from "../../workbook views/workbook-templates/financial-statements/balance-sheet";
import { wsPLAccount } from "../../workbook views/workbook-templates/financial-statements/p&laccount";
import { postTbToWbook, tbForPosting } from "../trial-balance/tb-maintenance";
import { addBsClickListener, addPlClickListener, addTbClickListener } from "../worksheet-drilling/cerys-drilling";

export const processTransBatch = async (session) => {
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
  const options = fetchOptionsTransBatch(transactions, transDtls);
  const objsDb = await fetch(postJournalBatch, options);
  const objs = await objsDb.json();
  console.log(objs);
  session["customer"] = objs.customer;
  session["activeAssignment"] = objs.assignment;
  const tbArray = tbForPosting(session["activeAssignment"]["tb"]);
  await postTbToWbook(tbArray);
  await wsPLAccount(session);
  await wsBalanceSheet(session);
  addTbClickListener(session["activeAssignment"]);
  addPlClickListener(session["activeAssignment"]);
  addBsClickListener(session["activeAssignment"]);
  session["activeJournal"] = { journals: [], netValue: 0, journalType: "journal", journal: true, clientTB: false };
};
