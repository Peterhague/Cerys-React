import { postJournalBatch, updateTransactionBatch } from "../../fetching/apiEndpoints";
import { fetchOptionsTransBatch, fetchOptionsTransBatchUpdate } from "../../fetching/generateOptions";
import { colNumToLetter } from "../excel-col-conversion";
import {
  calculateExcelDate,
  callNextView,
  getTransRowNumber,
  getUpdatedTransactions,
  updateAssignmentFigures,
  updateAssignmentFiguresDummy,
} from "../helperFunctions";
import { highlightEditableRanges } from "../worksheet";
import { renewEdSheetsTransRefs, updateEdSheetsTransValues } from "../worksheet-editing/ws-editing";

export const processTransBatch = async (context, session) => {
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
  await updateAssignmentFigures(context, session);
  await context.sync();
  return newTransactions;
};

export const submitTransactionUpdates = async (session) => {
  try {
    await Excel.run(async (context) => {
      console.log("updates submitted");
      let updatedTrans = getUpdatedTransactions(session);
      const isTBUpdated = checkTransForRecoding(updatedTrans);
      const { deletionObjs } = createDeletionObjects(session, updatedTrans);
      updatedTrans.forEach((tran) => {
        tran.updates.forEach((update) => {
          session.editableSheets.forEach((sheet) => {
            if (update.worksheetName === sheet.name) {
              highlightEditableRanges(context, sheet);
            }
          });
        });
      });
      updatedTrans = await processUpdateBatch(session);
      deletionObjs.sort((a, b) => {
        return b.rowNumber - a.rowNumber;
      });
      await updateEdSheetsTransValues(context, session); // pertains to all other sheets, ie effects of the update
      const promptSheetDeletion = renewEdSheetsTransRefs(session);
      if (isTBUpdated) {
        if (promptSheetDeletion) {
          console.log("here");
          await updateAssignmentFigures(context, session);
          session.options.updatedTransactions = updatedTrans;
          session.handleView("deleteSheetPrompt");
        } else {
          console.log("here");
          await updateAssignmentFigures(context, session);
          checkNewTransForAssets(session, updatedTrans);
        }
      } else {
        callNextView(session);
      }
      session.setEditButton("hide");
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
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

export const createDeletionObject = (tran, sheet) => {
  const rowNumber = getTransRowNumber(tran, sheet);
  const firstCol = colNumToLetter(sheet.protectedRange.firstCol);
  const lastCol = colNumToLetter(sheet.protectedRange.lastCol);
  const deletionRange = `${firstCol}${rowNumber}:${lastCol}${rowNumber}`;
  return { wsName: sheet.name, range: deletionRange, rowNumber };
};

export const createDeletionObjects = (session, updatedTrans) => {
  const deletionObjs = [];
  const otherTrans = [];
  updatedTrans.forEach((tran) => {
    session.editableSheets.forEach((sheet) => {
      if (tran[sheet.filterObj.target] !== sheet.filterObj.value) {
        const rowNumber = getTransRowNumber(tran, sheet);
        const firstCol = colNumToLetter(sheet.protectedRange.firstCol);
        const lastCol = colNumToLetter(sheet.protectedRange.lastCol);
        const deletionRange = `${firstCol}${rowNumber}:${lastCol}${rowNumber}`;
        const deletionObj = { wsName: sheet.name, range: deletionRange, rowNumber };
        deletionObjs.push(deletionObj);
        sheet.editButtonStatus = "hide";
      } else otherTrans.push(tran);
    });
  });
  return { deletionObjs, otherTrans };
};

export const recreateDBUpdatesInMem = (session, updatedTrans) => {
  updatedTrans.forEach((tran) => {
    let cerysCodeUpdated = false;
    let cerysCodeObject;
    tran.updates.forEach((update) => {
      if (update.type === "date") {
        tran.transactionDate = update.mongoDate;
        tran.transactionDateExcel = update.value;
      } else if (update.type === "cerysCode") {
        tran.cerysCode = update.value;
        cerysCodeObject = update.cerysCodeObject;
        cerysCodeUpdated = true;
      } else if (update.type === "cerysNarrative") {
        tran.narrative = update.value;
      } else if (update.type === "clientCodeMapping") {
        tran.clientMappingOverride = true;
        const clientNomCodeObj = session.clientChart.find((code) => code.clientCode === update.value);
        tran.customClientMapping = {
          clientSoftware: session.activeAssignment.clientSoftware,
          clientCode: clientNomCodeObj.clientCode,
          clientCodeName: clientNomCodeObj.clientCodeName,
        };
      }
    });
    if (cerysCodeUpdated) {
      tran.cerysCategory = cerysCodeObject.cerysCategory;
      tran.cerysSubCategory = cerysCodeObject.cerysSubCategory;
      tran.assetSubCategory = cerysCodeObject.assetSubCategory;
      tran.assetSubCatCode = cerysCodeObject.assetSubCatCode;
      tran.regColNameOne = cerysCodeObject.regColNameOne;
      tran.regColNameTwo = cerysCodeObject.regColNameTwo;
      tran.assetCategory = cerysCodeObject.assetCategory;
      tran.assetCategoryNo = cerysCodeObject.assetCategoryNo;
      tran.assetCodeType = cerysCodeObject.assetCodeType;
      tran.cerysName = cerysCodeObject.cerysName;
      tran.cerysShortName = cerysCodeObject.cerysShortName;
      tran.cerysExcelName = cerysCodeObject.cerysExcelName;
      tran.defaultSign = cerysCodeObject.defaultSign;
      tran.clientAdj = cerysCodeObject.clientAdj;
    }
  });
};
