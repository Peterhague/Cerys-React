import { Assignment } from "../../classes/assignment";
import { EditableWorksheet } from "../../classes/editable-worksheet";
import { ExcelDeletionObject } from "../../classes/excel-range-editing";
import { ActiveJournal } from "../../classes/journal";
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
import { callNextView, getUpdatedTransactions, updateAssignmentFigures } from "../helper-functions";
import { getActiveWorksheet, highlightEditableRanges } from "../worksheet";
import { renewEdSheetsTransRefs } from "../worksheet-editing/ed-sheet-change-handling";
/* global Excel */

export const processTransBatch = async (session: Session, activeJournal: ActiveJournal) => {
  try {
    await Excel.run(async (context) => {
      activeJournal.finaliseJournalsForDb(session);
      const transDtls = { customerId: session.customer.customerId, assignmentId: session.assignment.assignmentId };
      const { assignment } = await postTransactionsDb(session, activeJournal, transDtls);
      session.assignment = new Assignment(assignment);
      await updateAssignmentFigures(session);
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
};

export const submitTransactionUpdates = async (session: Session) => {
  let updatedTrans = getUpdatedTransactions(session);
  const isTBUpdated = checkTransForRecoding(updatedTrans);
  updatedTrans.forEach((tran) => {
    tran.updates.forEach((update) => {
      session.editableSheets.forEach((sheet) => {
        if (update.worksheetName === sheet.name) {
          highlightEditableRanges(sheet);
        }
      });
    });
  });
  await processUpdateBatch(session);
  const promptSheetDeletion = await renewEdSheetsTransRefs(session);
  if (isTBUpdated) {
    if (promptSheetDeletion) {
      await updateAssignmentFigures(session);
      session.options.updatedTransactions = updatedTrans;
      session.handleView(DELETE_SHEET_PROMPT);
    } else {
      await updateAssignmentFigures(session);
      checkNewTransForAssets(session);
    }
  } else {
    callNextView(session);
  }
  session.editableSheets.forEach((sheet) => {
    if (sheet.editButtonStatus === "inProgress") sheet.editButtonStatus = "hide";
  });
  const activeWs = await getActiveWorksheet();
  const acitveEditableWS = session.editableSheets.find((sheet) => sheet.name === activeWs.name);
  if (acitveEditableWS) session.setEditButton(acitveEditableWS.editButtonStatus);
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
  activeJournal: ActiveJournal,
  transDtls: { customerId: string; assignmentId: string }
) => {
  const options = fetchOptionsTransBatch(session, activeJournal, transDtls);
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
