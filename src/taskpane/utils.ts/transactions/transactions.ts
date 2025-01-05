import { Assignment } from "../../classes/assignment";
import { ExcelDeletionObject } from "../../classes/excel-range-editing";
import { Session } from "../../classes/session";
import { Transaction } from "../../classes/transaction";
import { postJournalBatch, updateTransactionBatch } from "../../fetching/apiEndpoints";
import { fetchOptionsTransBatch, fetchOptionsTransBatchUpdate } from "../../fetching/generateOptions";
import { RegisterType } from "../../interfaces/interfaces";
import { IFARegister, IPRegister, TFARegister } from "../../static-values/register-types";
import { getViewOptions } from "../../static-values/view-options";
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
    const periodStartDate = session.assignment.reportingPeriod.periodStart.split("T")[0];
    if (jnl.narrative === "") jnl.narrative = "No narrative";
    if (jnl.transactionDate === "") {
      if (
        jnl.cerysCodeObj.assetSubCategory === "Cost bfwd" ||
        jnl.cerysCodeObj.assetSubCategory === "Amort bfwd" ||
        jnl.cerysCodeObj.assetSubCategory === "Depn bfwd"
      ) {
        jnl.transactionDate = periodStartDate;
      } else {
        jnl.transactionDate = session.assignment.reportingPeriod.reportingDateOrig;
      }
    }
    jnl.transactionDateExcel = calculateExcelDate(jnl.transactionDate);
    jnl.transactionType = activeJournal.journalType;
    jnl.clientTB = activeJournal.clientTB;
    jnl.journal = activeJournal.journal;
  });
  const transDtls = { customerId: session.customer._id, assignmentId: session.assignment._id };
  const { assignment, newTransactions } = await postTransactionsDb(session, transactions, transDtls);
  session.assignment = new Assignment(assignment);
  newTransactions.forEach((tran) => {
    tran.processedAsAsset = false;
  });
  session.activeJournal = { journals: [], netValue: 0, journalType: "journal", journal: true, clientTB: false };
  await updateAssignmentFigures(context, session);
  return newTransactions;
};

export const submitTransactionUpdates = async (session: Session) => {
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
          checkNewTransForAssets(session);
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
  const { processedTrans, assignment } = await updatedAssignmentAndTransDB.json();
  const updatedTransactions = processedTrans;
  updatedTransactions.forEach((tran) => {
    tran.processedAsAsset = false;
  });
  session.assignment = new Assignment(assignment);
  return updatedTransactions;
};

export const checkAssetRegStatus = (session: Session, handleView) => {
  if (
    !session.assignment.IFARegisterCreated &&
    session.assignment.activeCategories.includes("Intangible assets") &&
    (session.assignment.activeAssetCodeTypes.includes("iFACostAddns") ||
      session.assignment.activeAssetCodeTypes.includes("iFACostBF"))
  ) {
    handleView("promptIFARCreation");
  } else if (
    !session.assignment.TFARegisterCreated &&
    session.assignment.activeCategories.includes("Tangible assets") &&
    (session.assignment.activeAssetCodeTypes.includes("tFACostAddns") ||
      session.assignment.activeAssetCodeTypes.includes("tFACostBF"))
  ) {
    handleView("promptTFARCreation");
  } else if (
    !session.assignment.IPRegisterCreated &&
    session.assignment.activeCategories.includes("Investment property") &&
    (session.assignment.activeAssetCodeTypes.includes("iPCostAddns") ||
      session.assignment.activeAssetCodeTypes.includes("iPCostBF"))
  ) {
    handleView("promptIPRCreation");
  } else {
    console.log("next view called");
    callNextView(session);
  }
};

export const checkNewTransForAssets = (session: Session) => {
  //const newFATransactions: Transaction[] = [];
  let iFAPresent = false;
  let tFAPresent = false;
  let iPPresent = false;
  let nextView = true;
  // newTransactions.forEach((tran) => {
  //   const cerysCodeObj = tran.getCerysCodeObj(session);
  //   if (
  //     tran.processedAsAsset === false &&
  //     (cerysCodeObj.assetCodeType === "iFACostAddns" || cerysCodeObj.assetCodeType === "iFACostBF")
  //   ) {
  //     iFAPresent = true;
  //     nextView = false;
  //     newFATransactions.push(tran);
  //   } else if (
  //     tran.processedAsAsset === false &&
  //     (cerysCodeObj.assetCodeType === "tFACostAddns" || cerysCodeObj.assetCodeType === "tFACostBF")
  //   ) {
  //     tFAPresent = true;
  //     nextView = false;
  //     newFATransactions.push(tran);
  //   } else if (
  //     tran.processedAsAsset === false &&
  //     (cerysCodeObj.assetCodeType === "iPCostAddns" || cerysCodeObj.assetCodeType === "iPCostBF")
  //   ) {
  //     iPPresent = true;
  //     nextView = false;
  //     newFATransactions.push(tran);
  //   }
  // });
  let register: RegisterType;
  if (nextView) {
    callNextView(session);
    return;
  } else if (iFAPresent) {
    //session.handleView("promptIFARCreation");
    register = IFARegister;
  } else if (tFAPresent) {
    //session.handleView("promptTFARCreation");
    register = TFARegister;
  } else if (iPPresent) {
    //session.handleView("promptIPRCreation");
    register = IPRegister;
  }
  const options = getViewOptions([{ key: "registerType", value: register }]);
  session.handleDynamicView("promptAssetRegisterCreation", options);
};

export const checkFATranUpdatesForAssets = (session: Session, newTransactions: Transaction[]) => {
  console.log(newTransactions);
  newTransactions.forEach((tran) => {
    const cerysCodeObj = tran.getCerysCodeObj(session);
    if (tran.processedAsAsset === false && cerysCodeObj.assetCodeType === "iFACostAddns") {
      //session.newFATransactions.push(tran);
    } else if (tran.processedAsAsset === false && cerysCodeObj.assetCodeType === "tFACostAddns") {
      //session.newFATransactions.push(tran);
    } else if (tran.processedAsAsset === false && cerysCodeObj.assetCodeType === "iPCostAddns") {
      //session.newFATransactions.push(tran);
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
