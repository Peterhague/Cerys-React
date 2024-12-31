import { ExcelDeletionObject } from "../../classes/excel-range-editing";
import { Session } from "../../classes/session";
import { postJournalBatch, updateTransactionBatch } from "../../fetching/apiEndpoints";
import { fetchOptionsTransBatch, fetchOptionsTransBatchUpdate } from "../../fetching/generateOptions";
import { colNumToLetter } from "../excel-col-conversion";
import { calculateExcelDate, callNextView, getUpdatedTransactions, updateAssignmentFigures } from "../helperFunctions";
import { getActiveWorksheet, highlightEditableRanges } from "../worksheet";
import { renewEdSheetsTransRefs } from "../worksheet-editing/ws-editing";
/* global Excel */

export const processTransBatch = async (context, session: Session) => {
  const activeJournal = session.activeJournal;
  const transactions = activeJournal.journals.map((jnl) => {
    return { ...jnl, ...jnl.cerysCodeObj };
  });
  transactions.forEach((jnl) => {
    const periodStartDate = session.activeAssignment.reportingPeriod.periodStart.split("T")[0];
    if (jnl.narrative === "") jnl.narrative = "No narrative";
    if (jnl.transactionDate === "") {
      if (
        jnl.cerysCodeObj.assetSubCategory === "Cost bfwd" ||
        jnl.cerysCodeObj.assetSubCategory === "Amort bfwd" ||
        jnl.cerysCodeObj.assetSubCategory === "Depn bfwd"
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
  });
  const transDtls = { customerId: session.customer._id, assignmentId: session.activeAssignment._id };
  const { assignment, newTransactions } = await postTransactionsDb(session, transactions, transDtls);
  session.activeAssignment = assignment;
  newTransactions.forEach((tran) => {
    tran.processedAsAsset = false;
  });
  session.activeJournal = { journals: [], netValue: 0, journalType: "journal", journal: true, clientTB: false };
  await updateAssignmentFigures(context, session);
  return newTransactions;
};

export const submitTransactionUpdates = async (session) => {
  try {
    await Excel.run(async (context) => {
      let updatedTrans = getUpdatedTransactions(session);
      const isTBUpdated = checkTransForRecoding(updatedTrans);
      updatedTrans.forEach((tran) => {
        tran.updates.forEach((update) => {
          session.editableSheets.forEach((sheet) => {
            if (update.worksheetName === sheet.name) {
              highlightEditableRanges(context, sheet);
            }
          });
        });
      });
      await processUpdateBatch(session);
      const promptSheetDeletion = renewEdSheetsTransRefs(context, session);
      //await updateEdSheetsTransValues(context, session); // pertains to all other sheets, ie effects of the update
      if (isTBUpdated) {
        if (promptSheetDeletion) {
          await updateAssignmentFigures(context, session);
          session.options.updatedTransactions = updatedTrans;
          session.handleView("deleteSheetPrompt");
        } else {
          await updateAssignmentFigures(context, session);
          checkNewTransForAssets(session, updatedTrans);
        }
      } else {
        callNextView(session);
      }
      session.editableSheets.forEach((sheet) => {
        if (sheet.editButtonStatus === "inProgress") sheet.editButtonStatus = "hide";
      });
      const activeWs = await getActiveWorksheet(context);
      const acitveEditableWS = session.editableSheets.find((sheet) => sheet.name === activeWs.name);
      if (acitveEditableWS) session.setEditButton(acitveEditableWS.editButtonStatus);
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
};

export const processUpdateBatch = async (session: Session) => {
  const options = fetchOptionsTransBatchUpdate(session);
  const updatedAssignmentAndTransDB = await fetch(updateTransactionBatch, options);
  const updatedAssignmentAndTrans = await updatedAssignmentAndTransDB.json();
  const updatedTransactions = updatedAssignmentAndTrans.processedTrans;
  updatedTransactions.forEach((tran) => {
    tran.processedAsAsset = false;
  });
  session.activeAssignment = updatedAssignmentAndTrans.assignment;
  return updatedTransactions;
};

export const checkAssetRegStatus = (session: Session, handleView) => {
  if (
    !session.activeAssignment.IFARegisterCreated &&
    session.activeAssignment.activeCategories.includes("Intangible assets") &&
    (session.activeAssignment.activeAssetCodeTypes.includes("iFACostAddns") ||
      session.activeAssignment.activeAssetCodeTypes.includes("iFACostBF"))
  ) {
    handleView("promptIFARCreation");
  } else if (
    !session.activeAssignment.TFARegisterCreated &&
    session.activeAssignment.activeCategories.includes("Tangible assets") &&
    (session.activeAssignment.activeAssetCodeTypes.includes("tFACostAddns") ||
      session.activeAssignment.activeAssetCodeTypes.includes("tFACostBF"))
  ) {
    handleView("promptTFARCreation");
  } else if (
    !session.activeAssignment.IPRegisterCreated &&
    session.activeAssignment.activeCategories.includes("Investment property") &&
    (session.activeAssignment.activeAssetCodeTypes.includes("iPCostAddns") ||
      session.activeAssignment.activeAssetCodeTypes.includes("iPCostBF"))
  ) {
    handleView("promptIPRCreation");
  } else {
    console.log("next view called");
    callNextView(session);
  }
};

export const checkNewTransForAssets = (session: Session, newTransactions) => {
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

export const checkFATranUpdatesForAssets = (session: Session, newTransactions) => {
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

const postTransactionsDb = async (session: Session, transactions, transDtls) => {
  const options = fetchOptionsTransBatch(session, transactions, transDtls);
  const objsDb = await fetch(postJournalBatch, options);
  const objs = await objsDb.json();
  return objs;
};

export const checkTransForRecoding = (updatedTrans) => {
  let isTBUpdated = false;
  updatedTrans.forEach((tran) => {
    tran.updates.forEach((update) => {
      if (update.type === "cerysCode") {
        isTBUpdated = true;
      }
    });
  });
  return isTBUpdated;
};

export const createDeletionObject = (map, sheet) => {
  const rowNumber = map.rowNumber;
  const firstCol = colNumToLetter(sheet.protectedRange.firstCol);
  const lastCol = colNumToLetter(sheet.protectedRange.lastCol);
  const deletionRange = `${firstCol}${rowNumber}:${lastCol}${rowNumber}`;
  return new ExcelDeletionObject(sheet.name, deletionRange, rowNumber);
};

// export const createDeletionObjects = (session, updatedTrans) => {
//   const deletionObjs = [];
//   const otherTrans = [];
//   updatedTrans.forEach((tran) => {
//     session.editableSheets.forEach((sheet) => {
//       if (tran[sheet.filterObj.target] !== sheet.filterObj.value) {
//         const rowNumber = getTransRowNumber(tran, sheet);
//         const firstCol = colNumToLetter(sheet.protectedRange.firstCol);
//         const lastCol = colNumToLetter(sheet.protectedRange.lastCol);
//         const deletionRange = `${firstCol}${rowNumber}:${lastCol}${rowNumber}`;
//         const deletionObj = { wsName: sheet.name, range: deletionRange, rowNumber };
//         deletionObjs.push(deletionObj);
//         sheet.editButtonStatus = "hide";
//       } else otherTrans.push(tran);
//     });
//   });
//   return { deletionObjs, otherTrans };
// };
