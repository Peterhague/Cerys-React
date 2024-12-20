import { postJournalBatch, updateTransactionBatch } from "../../fetching/apiEndpoints";
import { fetchOptionsTransBatch, fetchOptionsTransBatchUpdate } from "../../fetching/generateOptions";
import { wsBalanceSheet } from "../../workbook views/workbook-templates/financial-statements/balance-sheet";
import { wsPLAccount } from "../../workbook views/workbook-templates/financial-statements/p&laccount";
import { colNumToLetter } from "../excel-col-conversion";
import {
  calculateExcelDate,
  callNextView,
  getTransRowNumber,
  getUpdatedTransactions,
  updateAssignmentFigures,
} from "../helperFunctions";
import { postTbToWbook, tbForPosting } from "../trial-balance/tb-maintenance";
import { deleteWorksheetRangesUp, highlightEditableRanges } from "../worksheet";
import { addBsClickListener, addPlClickListener, addTbClickListener } from "../worksheet-drilling/cerys-drilling";
import { renewEdSheetsTransRefs, updateEdSheetsTransValues } from "../worksheet-editing/ws-editing";

export const processTransBatch = async (session) => {
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
  const { assignment, newTransactions } = await postTransactionsDb(session, transactions, transDtls);
  session["activeAssignment"] = assignment;
  newTransactions.forEach((tran) => {
    tran.processedAsAsset = false;
  });
  session["activeJournal"] = { journals: [], netValue: 0, journalType: "journal", journal: true, clientTB: false };
  const tbArray = tbForPosting(session["activeAssignment"]["tb"]);
  await postTbToWbook(session, tbArray);
  await wsPLAccount(session);
  await wsBalanceSheet(session);
  addTbClickListener(session);
  addPlClickListener(session);
  addBsClickListener(session["activeAssignment"]);
  return newTransactions;
};

export const submitTransactionUpdates = async (session) => {
  let tbUpdated = false;
  let otherUpdated = false;
  let updatedTrans = getUpdatedTransactions(session);
  const deletionObjs = [];
  let promptSheetDeletion = false;
  updatedTrans.forEach((tran) => {
    tran.updates.forEach((update) => {
      if (update.type === "cerysCode") {
        tbUpdated = true;
        session.editableSheets.forEach((sheet) => {
          if (sheet.name === update.worksheetName) {
            const rowNumber = getTransRowNumber(tran, sheet);
            const deletionRange = `${colNumToLetter(sheet.protectedRange.firstCol)}${rowNumber}:${colNumToLetter(sheet.protectedRange.lastCol)}${rowNumber}`;
            const deletionObj = { wsName: update.worksheetName, range: deletionRange, rowNumber };
            deletionObjs.push(deletionObj);
            sheet.editButtonStatus = "hide";
            const newTransactions = [];
            sheet.transactions.forEach((i) => {
              if (i._id !== tran._id) {
                newTransactions.push(i);
              }
            });
            sheet.transactions = newTransactions;
            if (newTransactions.length === 0) {
              sheet.promptDeletion = true;
              promptSheetDeletion = true;
            }
          }
        });
      } else {
        otherUpdated = true;
        session.editableSheets.forEach((sheet) => {
          sheet.transactions.forEach((transaction) => {
            if (transaction._id === tran._id) {
              if (update.type === "date") transaction.transactionDateExcel = update.value;
              if (update.type === "cerysNarrative") transaction.narrative = update.value;
              if (update.type === "clientCodeMapping") {
                const nomCode = session.clientChart.find((code) => code.clientCode === update.value);
                transaction.defaultClientMapping.clientCode = nomCode.clientCode;
                transaction.defaultClientMapping.clientCodeName = nomCode.clientCodeName;
              }
            }
          });
        });
      }
    });
  });
  if (otherUpdated) {
    updatedTrans.forEach((tran) => {
      tran.updates.forEach((update) => {
        session.editableSheets.forEach((sheet) => {
          if (update.worksheetName === sheet.name) {
            highlightEditableRanges(sheet);
          }
        });
      });
    });
  }
  deletionObjs.sort((a, b) => {
    return b.rowNumber - a.rowNumber;
  });
  if (deletionObjs.length > 0) await deleteWorksheetRangesUp(deletionObjs);
  await updateEdSheetsTransValues(session, updatedTrans);
  const updatedTransactionsDb = await processUpdateBatch(session);
  await renewEdSheetsTransRefs(session);
  console.log(updatedTransactionsDb);
  console.log(updatedTrans);
  if (tbUpdated) {
    if (promptSheetDeletion) {
      await updateAssignmentFigures(session);
      session.options.updatedTransactions = updatedTransactionsDb;
      session.handleView("deleteSheetPrompt");
    } else {
      await updateAssignmentFigures(session);
      checkNewTransForAssets(session, updatedTransactionsDb);
    }
  } else {
    callNextView(session);
  }
  session.setEditButton("hide");
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

//export const checkNewTransForAssets = (session, newTransactions) => {
//  //const newTransactions = session.latestTransactions;
//  console.log(newTransactions);
//  session.newFATransactions = newTransactions;
//  let nextView = true;
//  for (let i = 0; i < newTransactions.length; i++) {
//    if (
//      newTransactions[i].processedAsAsset === false &&
//      (newTransactions[i].assetCodeType === "iFACostAddns" || newTransactions[i].assetCodeType === "iFACostBF")
//    ) {
//      session.handleView("promptIFARCreation");
//      nextView = false;
//      break;
//    } else if (
//      newTransactions[i].processedAsAsset === false &&
//      (newTransactions[i].assetCodeType === "tFACostAddns" || newTransactions[i].assetCodeType === "tFACostBF")
//    ) {
//      session.handleView("promptTFARCreation");
//      nextView = false;
//      break;
//    } else if (
//      newTransactions[i].processedAsAsset === false &&
//      (newTransactions[i].assetCodeType === "iPCostAddns" || newTransactions[i].assetCodeType === "iPCostBF")
//    ) {
//      session.handleView("promptIPRCreation");
//      nextView = false;
//      break;
//    }
//  }
//  if (nextView) {
//    callNextView(session);
//    session.newFATranasctions = [];
//  }
//};

export const checkNewTransForAssets = (session, newTransactions) => {
  console.log(newTransactions);
  const newFATransactions = [];
  let iFAPresent = false;
  let tFAPresent = false;
  let iPPresent = false;
  let nextView = true;
  newTransactions.forEach((tran) => {
    if (
      tran.processedAsAsset === false &&
      (tran.assetCodeType === "iFACostAddns" || tran.assetCodeType === "iFACostBF")
    ) {
      iFAPresent = true;
      nextView = false;
      newFATransactions.push(tran);
    } else if (
      tran.processedAsAsset === false &&
      (tran.assetCodeType === "tFACostAddns" || tran.assetCodeType === "tFACostBF")
    ) {
      tFAPresent = true;
      nextView = false;
      newFATransactions.push(tran);
    } else if (
      tran.processedAsAsset === false &&
      (tran.assetCodeType === "iPCostAddns" || tran.assetCodeType === "iPCostBF")
    ) {
      iPPresent = true;
      nextView = false;
      newFATransactions.push(tran);
    }
  });
  session.newFATransactions = newFATransactions;
  if (nextView) {
    callNextView(session);
  } else if (iFAPresent) {
    session.handleView("promptIFARCreation");
  } else if (tFAPresent) {
    session.handleView("promptTFARCreation");
  } else if (iPPresent) {
    session.handleView("promptIPRCreation");
  }
};

export const checkFATranUpdatesForAssets = (session, newTransactions) => {
  console.log(newTransactions);
  newTransactions.forEach((tran) => {
    if (tran.processedAsAsset === false && tran.assetCodeType === "iFACostAddns") {
      session.newFATransactions.push(tran);
    } else if (tran.processedAsAsset === false && tran.assetCodeType === "tFACostAddns") {
      session.newFATransactions.push(tran);
    } else if (tran.processedAsAsset === false && tran.assetCodeType === "iPCostAddns") {
      session.newFATransactions.push(tran);
    }
  });
};

const postTransactionsDb = async (session, transactions, transDtls) => {
  const options = fetchOptionsTransBatch(session, transactions, transDtls);
  const objsDb = await fetch(postJournalBatch, options);
  const objs = await objsDb.json();
  return objs;
};
