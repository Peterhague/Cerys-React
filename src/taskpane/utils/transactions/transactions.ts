import { Assignment } from "../../classes/assignment";
import { EditableWorksheet } from "../../classes/editable-worksheet";
import { ExcelDeletionObject } from "../../classes/excel-range-editing";
import { Journal } from "../../classes/journal";
import { Session } from "../../classes/session";
import { Transaction } from "../../classes/transaction";
import { TransactionMap } from "../../classes/transaction-map";
import { ViewOptions } from "../../classes/view-options";
import { postJournalBatch, updateTransactionBatch } from "../../fetching/apiEndpoints";
import { fetchOptionsTransBatch, fetchOptionsTransBatchUpdate } from "../../fetching/generateOptions";
import { RegisterType } from "../../interfaces/interfaces";
import { getAssetRegisterType } from "../../static-values/register-types";
import { getViewOptions } from "../../static-values/view-options";
import { DELETE_SHEET_PROMPT, PROMPT_ASSET_REGISTER_CREATION } from "../../static-values/views";
import { colNumToLetter } from "../excel-col-conversion";
import { calculateExcelDate, callNextView, getUpdatedTransactions, updateAssignmentFigures } from "../helper-functions";
import { getActiveWorksheet, highlightEditableRanges } from "../worksheet";
import { renewEdSheetsTransRefs } from "../worksheet-editing/ed-sheet-change-handling";
/* global Excel */

export const processTransBatch = async (context: Excel.RequestContext, session: Session) => {
  const activeJournal = session.activeJournal;
  const journals: Journal[] = activeJournal.journals.map((jnl) => {
    return { ...jnl, ...jnl.cerysCodeObj };
  });
  journals.forEach((jnl) => {
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
  const { assignment } = await postTransactionsDb(session, journals, transDtls);
  session.assignment = new Assignment(assignment);
  session.activeJournal = { journals: [], netValue: 0, journalType: "journal", journal: true, clientTB: false };
  await updateAssignmentFigures(context, session);
};

export const submitTransactionUpdates = async (session: Session) => {
  try {
    await Excel.run(async (context) => {
      console.log("surely here????");
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
      const promptSheetDeletion = await renewEdSheetsTransRefs(context, session);
      if (isTBUpdated) {
        if (promptSheetDeletion) {
          await updateAssignmentFigures(context, session);
          session.options.updatedTransactions = updatedTrans;
          session.handleView(DELETE_SHEET_PROMPT);
        } else {
          console.log("this branch?");
          await updateAssignmentFigures(context, session);
          checkNewTransForAssets(session);
        }
      } else {
        console.log("this branch??");
        callNextView(session);
      }
      session.editableSheets.forEach((sheet) => {
        if (sheet.editButtonStatus === "inProgress") sheet.editButtonStatus = "hide";
      });
      const activeWs = await getActiveWorksheet();
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

export const checkNewTransForAssets = (session: Session) => {
  const nextRegisterPrompt: "IFA" | "TFA" | "IP" = session.assignment.getNextRegisterPrompt(session);
  let register: RegisterType;
  if (!nextRegisterPrompt) {
    callNextView(session);
    return;
  } else {
    register = getAssetRegisterType(nextRegisterPrompt);
  }
  const options = getViewOptions([{ key: "registerType", value: register }]);
  session.handleDynamicView(PROMPT_ASSET_REGISTER_CREATION, new ViewOptions(options));
};

export const checkFATranUpdatesForAssets = (session: Session) => {
  session.assignment.transactions.forEach((tran) => {
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

const postTransactionsDb = async (
  session: Session,
  transactions: Journal[],
  transDtls: { customerId: string; assignmentId: string }
) => {
  const options = fetchOptionsTransBatch(session, transactions, transDtls);
  const objsDb = await fetch(postJournalBatch, options);
  const objs = await objsDb.json();
  return objs;
};

export const checkTransForRecoding = (updatedTrans: Transaction[]) => {
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

export const createDeletionObject = (map: TransactionMap, sheet: EditableWorksheet) => {
  const { protectedFirstCol, protectedLastCol } = sheet.getCurrentProtectedRange();
  const rowNumber = sheet.getCurrentRow(map.rowNumberOrig);
  const firstCol = colNumToLetter(protectedFirstCol);
  const lastCol = colNumToLetter(protectedLastCol);
  const deletionRange = `${firstCol}${rowNumber}:${lastCol}${rowNumber}`;
  return new ExcelDeletionObject(sheet.name, deletionRange, rowNumber);
};
