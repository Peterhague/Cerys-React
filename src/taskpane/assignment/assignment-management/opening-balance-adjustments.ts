import { Assignment } from "../../classes/assignment";
import { AssignmentClientTBObject } from "../../classes/assignment-client-TB-obj";
import { createControlledWorksheet, updateControlledWorksheet } from "../../classes/controlled-worksheet";
import { Customer } from "../../classes/customer";
import { DrillableCollection } from "../../classes/drillable-collection";
import { createEditableWorksheet } from "../../classes/editable-worksheet";
import { ExcelRangeObject } from "../../classes/range-objects";
import { Session } from "../../classes/session";
import { Transaction } from "../../classes/transaction";
import { ControlledInputMap, TransactionMap } from "../../classes/transaction-map";
import { TransactionUpdate } from "../../classes/transaction-update";
import { reverseCustomMappingUrl, updateCerysCodeMappingUrl } from "../../fetching/apiEndpoints";
import { fetchOptionsReverseCustomMapping, fetchOptionsUpdateCerysCodeMapping } from "../../fetching/generateOptions";
import { ClientTransaction } from "../../interfaces/interfaces";
import { BLANK_VIEW_OPTIONS } from "../../static-values/view-options";
import { REVIEW_CUSTOM_MAPPED_TRANS, USER_CONFIRM_PROMPT } from "../../static-values/views";
import { STANDARD_NUMBER_FORMAT } from "../../static-values/worksheet-formats";
import { OBA_WSNAME } from "../../static-values/worksheet-names";
import {
  buildClientTBBalSheetOnly,
  callNextView,
  combineClientTrialBalances,
  convertAssignmentTBForOBAs,
  getUpdatedDate,
  getUpdatedNarrative,
  handleEditButtonClick,
  handleWorksheetDrill,
  interpretEventAddress,
} from "../../utils/helper-functions";
import { getClientCodeMappingMessage } from "../../utils/messages";
import { addOneWorksheet, setExcelRangeValue } from "../../utils/worksheet";
import { cerysNomDetailView } from "../../utils/worksheet-drilling/cerys-drilling";
import { clientNomDetailView } from "../../utils/worksheet-drilling/client-drilling";
import { updateEdSheetClientCodeMapping } from "../../utils/worksheet-editing/ed-sheet-change-handling";
import { applyWorkhseetHeader, worksheetHeader } from "../../workbook views/components/schedule-header";
/* global Excel */

export const getOBARelTrans = (session: Session) => {
  return session.assignment.transactions.filter((tran) => tran.getCerysCodeObj(session).clientAdj);
};

export async function oBARelevantTransView(session: Session) {
  try {
    await Excel.run(async (context) => {
      const relTrans = getOBARelTrans(session);
      let sheetInMidEdit = false;
      relTrans.forEach((tran) => {
        if (tran.updates.length > 0) sheetInMidEdit = true;
      });
      const wsName = "OBA relevant transactions";
      const { ws } = await addOneWorksheet(context, session, { name: wsName, addListeners: undefined });
      const range = ws.getRange(`A1:I${relTrans.length + 2}`);
      const valuesToPost = [
        [
          "Transaction",
          "Transaction",
          "Transaction",
          "Cerys",
          "Cerys",
          "Transaction",
          "Value",
          "Mapped Client",
          "Mapped Client",
        ],
        [
          "Number",
          "Date",
          "Type",
          "Nominal Code",
          "Nominal Name",
          "Narrative",
          "DR/(CR)",
          "Nominal Code",
          "Nominal Name",
        ],
      ];
      let rowNumber = 3;
      const sheetMapping: TransactionMap[] = [];
      relTrans.forEach((line) => {
        const cerysCodeObj = line.getCerysCodeObj(session);
        const date = getUpdatedDate(line) ? getUpdatedDate(line).value : line.transactionDateExcel;
        const hasUpdatedCerysCode = line.updates.find((update) => update.type === "cerysCode");
        const cerysCode = hasUpdatedCerysCode ? hasUpdatedCerysCode.value : line.cerysCode;
        const shortName = hasUpdatedCerysCode
          ? hasUpdatedCerysCode.cerysCodeObject.cerysShortName
          : cerysCodeObj.cerysShortName;
        const narrative = getUpdatedNarrative(line) ? getUpdatedNarrative(line) : line.narrative;
        let arr = [];
        arr.push(line.transactionNumber, date, line.transactionType, cerysCode, shortName, narrative, line.value / 100);
        arr.push(line.getClientMappingObj(session).clientCode);
        arr.push(line.getClientMappingObj(session).clientCodeName);
        valuesToPost.push(arr);
        const map = new TransactionMap(line._id, rowNumber, null);
        sheetMapping.push(map);
        rowNumber += 1;
      });
      range.values = valuesToPost;
      const headerRange = ws.getRange("A1:I2");
      headerRange.format.font.bold = true;
      const columnA = ws.getRange("B:B");
      columnA.numberFormat = [["dd/mm/yyyy"]];
      const columnsRange = ws.getRange("A:I");
      const columnG = ws.getRange("G:G");
      columnG.numberFormat = STANDARD_NUMBER_FORMAT;
      const controlledRangeObj = new ExcelRangeObject({ row: 1, col: 1 }, valuesToPost);
      createEditableWorksheet(
        session,
        relTrans,
        ws,
        valuesToPost,
        "OBARelevantAdjustments",
        sheetMapping,
        controlledRangeObj
      );
      columnsRange.format.autofitColumns();
      ws.activate();
      if (sheetInMidEdit) handleEditButtonClick(session);
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
}

export const handleClientCodeMapping = (session: Session, nominalCode: number | string, nominalCodeName: string) => {
  const tran = session.activeEditableCell.getActiveTransaction(session);
  const cerysCodeObj = tran.getCerysCodeObj(session);
  const wsName = session.activeEditableCell.wsName;
  const range = session.activeEditableCell.getRange();
  const options = {
    handleYes: () => checkTransForCustomMapping(session, nominalCode, nominalCodeName, cerysCodeObj.cerysCode, wsName),
    handleNo: async () => await setExcelRangeValue(wsName, range, nominalCode),
    message: getClientCodeMappingMessage(cerysCodeObj.cerysCode, cerysCodeObj.cerysName),
    yesButtonText: "All transactions",
    noButtonText: "This transaction only",
  };
  session.handleDynamicView(USER_CONFIRM_PROMPT, options);
};

export const checkTransForCustomMapping = (
  session: Session,
  nominalCode: number | string,
  nominalCodeName: string,
  cerysCode: number,
  wsName: string
) => {
  const relTrans = session.assignment.transactions.filter((tran) => tran.cerysCode === cerysCode);
  const customRemappedTrans = relTrans.filter((tran) => tran.clientMappingOverridden);
  if (customRemappedTrans.length === 0) {
    updateCerysCodeMapping(session, nominalCode, nominalCodeName, cerysCode, wsName);
  } else {
    const options = BLANK_VIEW_OPTIONS;
    options.nominalCode = nominalCode;
    options.nominalCodeName = nominalCodeName;
    options.cerysCode = cerysCode;
    options.wsName = wsName;
    session.handleDynamicView(REVIEW_CUSTOM_MAPPED_TRANS, options);
  }
};

export const updateCerysCodeMapping = async (
  session: Session,
  nominalCode: number | string,
  nominalCodeName: string,
  cerysCode: number,
  wsName: string
) => {
  const relTrans = session.assignment.transactions.filter((tran) => tran.cerysCode === cerysCode);
  const ws = session.editableSheets.find((sheet) => sheet.name === wsName);
  relTrans.forEach((tran) => {
    const clientMappingObj = tran.getClientMappingObj(session);
    tran.updates = [
      new TransactionUpdate(
        session,
        wsName,
        ws.worksheetId,
        "clientCodeMapping",
        nominalCode,
        clientMappingObj.clientCode,
        null
      ),
      new TransactionUpdate(
        session,
        wsName,
        ws.worksheetId,
        "clientCodeNameMapping",
        nominalCodeName,
        clientMappingObj.clientCodeName,
        null
      ),
    ];
  });
  updateEdSheetClientCodeMapping(session, wsName, relTrans);
  const cerysCodeObj = session.chart.find((code) => code.cerysCode === cerysCode);
  const options = fetchOptionsUpdateCerysCodeMapping(session, nominalCode, nominalCodeName, cerysCodeObj);
  const updatedClientDb = await fetch(updateCerysCodeMappingUrl, options);
  const { customer, assignment, newMapping } = await updatedClientDb.json();
  session.customer = new Customer(customer);
  session.assignment = new Assignment(assignment);
  session.chart.forEach((code) => {
    if (code.cerysCode === newMapping.cerysCode) {
      code.currentClientMapping = newMapping.currentClientMapping;
      code.previousClientMappings = newMapping.previousClientMappings;
    }
  });
  callNextView(session);
};

export const updateCerysCodeMappingIgnoreCustom = async (
  session: Session,
  nominalCode: number | string,
  nominalCodeName: string,
  cerysCode: number,
  wsName: string
) => {
  const transNotRemapped = session.assignment.transactions.filter(
    (tran) => tran.cerysCode === cerysCode && !tran.clientMappingOverridden
  );
  const ws = session.editableSheets.find((sheet) => sheet.name === wsName);
  transNotRemapped.forEach((tran) => {
    const clientMappingObj = tran.getClientMappingObj(session);
    tran.updates = [
      new TransactionUpdate(
        session,
        wsName,
        ws.worksheetId,
        "clientCodeMapping",
        nominalCode,
        clientMappingObj.clientCode,
        null
      ),
      new TransactionUpdate(
        session,
        wsName,
        ws.worksheetId,
        "clientCodeNameMapping",
        nominalCodeName,
        clientMappingObj.clientCodeName,
        null
      ),
    ];
  });
  updateEdSheetClientCodeMapping(session, wsName, transNotRemapped);
  const cerysCodeObj = session.chart.find((code) => code.cerysCode === cerysCode);
  const options = fetchOptionsUpdateCerysCodeMapping(session, nominalCode, nominalCodeName, cerysCodeObj);
  const updatedClientDb = await fetch(updateCerysCodeMappingUrl, options);
  const { customer, assignment, newMapping } = await updatedClientDb.json();
  session.customer = new Customer(customer);
  session.assignment = new Assignment(assignment);
  session.chart.forEach((code) => {
    if (code.cerysCode === newMapping.cerysCode) {
      code.currentClientMapping = newMapping.currentClientMapping;
      code.previousClientMappings = newMapping.previousClientMappings;
    }
  });
  callNextView(session);
};

export const updateCerysCodeMappingIncludeCustom = async (
  session: Session,
  nominalCode: number | string,
  nominalCodeName: string,
  cerysCode: number,
  wsName: string
) => {
  const relTrans = session.assignment.transactions.filter((tran) => tran.cerysCode === cerysCode);
  const transRemapped = relTrans.filter((tran) => tran.clientMappingOverridden);
  const ws = session.editableSheets.find((sheet) => sheet.name === wsName);
  relTrans.forEach((tran) => {
    const clientMappingObj = tran.getClientMappingObj(session);
    tran.updates = [
      new TransactionUpdate(
        session,
        wsName,
        ws.worksheetId,
        "clientCodeMapping",
        nominalCode,
        clientMappingObj.clientCode,
        null
      ),
      new TransactionUpdate(
        session,
        wsName,
        ws.worksheetId,
        "clientCodeNameMapping",
        nominalCodeName,
        clientMappingObj.clientCodeName,
        null
      ),
    ];
  });
  updateEdSheetClientCodeMapping(session, wsName, relTrans);
  const cerysCodeObj = session.chart.find((code) => code.cerysCode === cerysCode);
  const options = fetchOptionsUpdateCerysCodeMapping(session, nominalCode, nominalCodeName, cerysCodeObj);
  const updatedClientDb = await fetch(updateCerysCodeMappingUrl, options);
  const { customer, newMapping } = await updatedClientDb.json();
  const nextOptions = fetchOptionsReverseCustomMapping(session, transRemapped);
  const updatedAssDb = await fetch(reverseCustomMappingUrl, nextOptions);
  const assignment = await updatedAssDb.json();
  session.customer = new Customer(customer);
  session.assignment = new Assignment(assignment);
  session.chart.forEach((code) => {
    if (code.cerysCode === newMapping.cerysCode) {
      code.currentClientMapping = newMapping.currentClientMapping;
      code.previousClientMappings = newMapping.previousClientMappings;
    }
  });
  callNextView(session);
};

export const updateCerysCodeMappingIncludeCustomAsSelected = async (
  session: Session,
  nominalCode: number | string,
  nominalCodeName: string,
  cerysCode: number,
  wsName: string,
  selectedTransactions: { transactionId: string; narrative: string; included: boolean }[]
) => {
  const relTrans = session.assignment.transactions.filter(
    (tran) =>
      tran.cerysCode === cerysCode &&
      (!tran.clientMappingOverridden || selectedTransactions.find((item) => item.transactionId === tran._id))
  );
  const transRemapped = selectedTransactions.map((obj) => relTrans.find((tran) => tran._id === obj.transactionId));
  const ws = session.editableSheets.find((sheet) => sheet.name === wsName);
  relTrans.forEach((tran) => {
    const clientMappingObj = tran.getClientMappingObj(session);
    tran.updates = [
      new TransactionUpdate(
        session,
        wsName,
        ws.worksheetId,
        "clientCodeMapping",
        nominalCode,
        clientMappingObj.clientCode,
        null
      ),
      new TransactionUpdate(
        session,
        wsName,
        ws.worksheetId,
        "clientCodeNameMapping",
        nominalCodeName,
        clientMappingObj.clientCodeName,
        null
      ),
    ];
  });
  updateEdSheetClientCodeMapping(session, wsName, relTrans);
  const cerysCodeObj = session.chart.find((code) => code.cerysCode === cerysCode);
  const options = fetchOptionsUpdateCerysCodeMapping(session, nominalCode, nominalCodeName, cerysCodeObj);
  const updatedClientDb = await fetch(updateCerysCodeMappingUrl, options);
  const { customer, newMapping } = await updatedClientDb.json();
  const nextOptions = fetchOptionsReverseCustomMapping(session, transRemapped);
  const updatedAssDb = await fetch(reverseCustomMappingUrl, nextOptions);
  const assignment = await updatedAssDb.json();
  session.customer = new Customer(customer);
  session.assignment = new Assignment(assignment);
  session.chart.forEach((code) => {
    if (code.cerysCode === newMapping.cerysCode) {
      code.currentClientMapping = newMapping.currentClientMapping;
      code.previousClientMappings = newMapping.previousClientMappings;
    }
  });
  callNextView(session);
};

export const createOBAWorksheet = async (session: Session) => {
  try {
    await Excel.run(async (context) => {
      const combinedTBObjs: AssignmentClientTBObject[] = buildConsolidatedClientTrialBalance(session);
      console.log(combinedTBObjs);
      const wsName = OBA_WSNAME;
      const { ws } = await addOneWorksheet(context, session, { name: wsName, addListeners: undefined });
      const wsHeaders = worksheetHeader(session, wsName);
      applyWorkhseetHeader(ws, wsHeaders);
      const sheetMapping: ControlledInputMap[] = [];
      const values = [["", "", "Per Client", "", "Per Accounts", "", "Adjustments"]];
      values.push(["Code", "Name", "DR/CR", "", "DR/CR", "", "DR/CR"], ["", "", "", "", "", "", ""]);
      console.log(combinedTBObjs);
      combinedTBObjs.forEach((obj) => {
        values.push([
          `${obj.clientCode}`,
          `${obj.clientCodeName}`,
          `${obj.clientValue / 100}`,
          "",
          `${obj.assignmentValue / 100}`,
          "",
          `${obj.assignmentValue / 100 - obj.clientValue / 100}`,
        ]);
        const clientNL = session.assignment.clientNL;
        const clientFigsDrillableCollection = new DrillableCollection(
          clientNL,
          (tran: ClientTransaction) => tran.code === obj.clientCode,
          [3],
          clientNomDetailView
        );
        const accountsDrillableCollection = new DrillableCollection(
          obj.assignmentTransactions,
          null,
          [5],
          cerysNomDetailView
        );
        const adjustmentsDrillableCollection = new DrillableCollection(
          obj.assignmentTransactions,
          (tran: Transaction) => !tran.clientTB,
          [7],
          cerysNomDetailView
        );
        sheetMapping.push(
          new ControlledInputMap(
            obj,
            values.length + 8,
            [1, 2, 3, 5, 7],
            [clientFigsDrillableCollection, accountsDrillableCollection, adjustmentsDrillableCollection]
          )
        );
      });
      const excelRangeObj = new ExcelRangeObject({ row: 9, col: 1 }, values);
      const wsRange = ws.getRange(excelRangeObj.address);
      wsRange.values = values;
      ws.getRange(excelRangeObj.getColRangeAbs(3)).numberFormat = STANDARD_NUMBER_FORMAT;
      ws.getRange(excelRangeObj.getColRangeAbs(5)).numberFormat = STANDARD_NUMBER_FORMAT;
      ws.getRange(excelRangeObj.getColRangeAbs(7)).numberFormat = STANDARD_NUMBER_FORMAT;
      const autoFitRange = ws.getRange("B:G");
      autoFitRange.format.autofitColumns();
      if (session.controlledSheets.find((ws) => ws.name === wsName)) {
        updateControlledWorksheet(session, combinedTBObjs, values, sheetMapping, excelRangeObj, 1, wsName);
      } else {
        createControlledWorksheet(session, combinedTBObjs, ws, values, sheetMapping, excelRangeObj, 1, "clientCode");
      }
      ws.onSingleClicked.add((e) => handleWorksheetDrill(e, session, wsName));
      ws.activate();
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
};

export const buildConsolidatedClientTrialBalance = (session: Session) => {
  const clientTBBalSheetOnly = buildClientTBBalSheetOnly(session);
  const equivalentAssTB = convertAssignmentTBForOBAs(session);
  combineClientTrialBalances(session, clientTBBalSheetOnly, equivalentAssTB);
  return equivalentAssTB;
};

export const handleOBAWorksheetClick = async (e: Excel.WorksheetSingleClickedEventArgs, session: Session) => {
  const sheet = session.controlledSheets.find((ws) => ws.name === OBA_WSNAME);
  const addressObj = interpretEventAddress(e);
  const map = sheet.sheetMapping.find(
    (mapping) =>
      sheet.getCurrentRow(mapping.rowNumberOrig) === addressObj.firstRow &&
      sheet.getCurrentColNumbers(mapping.colNumbers).includes(addressObj.firstCol)
  );
  if (!map) return;
  map.drillableCollections.forEach((collection) => {
    const valid = collection.colNumbers.find((num) => sheet.getCurrentColumn(num) === addressObj.firstCol);
    if (valid) console.log(collection.collection);
  });
};
