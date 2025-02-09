import {
  AssetDb,
  AssetRegisterDb,
  AssetSubTransaction,
  JournalDetailsProps,
  RegisterType,
} from "../interfaces/interfaces";
import { registerTypes } from "../static-values/register-types";
import { INTRAY_DETAILS } from "../static-values/views";
import { calculateDiffInDays } from "../utils/helper-functions";
import { processTransBatch } from "../utils/transactions/transactions";
import { InTrayItem } from "./in-trays/global";
import { Session } from "./session";
import { AssetTransaction, DetailedAssetTransaction } from "./transaction";
import { addOneWorksheet } from "../utils/worksheet";
import { STANDARD_NUMBER_FORMAT } from "../static-values/worksheet-formats";
import { ActiveJournal, Journal, TransactionAttachmentProps } from "./journal";
import { calculateCharge, populateDepnCols } from "../utils/transactions/asset-reg-generation";
import { Client } from "./client";
import { TransactionMap } from "./transaction-map";
import { ExcelRangeObject } from "./range-objects";
import { createEditableWorksheet } from "./editable-worksheet";
import _ from "lodash";
/* global Excel */

export class AssetRegister {
  registerType: "Tangible" | "Intangible" | "Investment property";
  assets: AssetRegisterItem[];
  constructor(
    session: Session,
    register: AssetRegisterDb,
    registerType: "Tangible" | "Intangible" | "Investment property"
  ) {
    const periodId = session.assignment.reportingPeriod._id;
    this.registerType = registerType;
    this.assets = register.assets.map(
      (asset) => asset.activePeriods.includes(periodId) && new AssetRegisterItem(asset, periodId)
    );
  }
}

class AssetRegisterItem {
  transactionDate: string;
  transactionDateUser: string;
  transactionDateClt: number;
  transactionDateExcel: number;
  narrative: string;
  assetNarrative: string;
  assetCategory: string;
  assetCategoryNo: number;
  cerysCategory: string;
  value: number;
  amortBasis?: string;
  amortRate?: string;
  depnBasis?: string;
  depnRate?: string;
  disposedOf: boolean;
  subTransactions: AssetSubTransaction[];
  _id: string;
  constructor(asset: AssetDb, periodId: string) {
    this.transactionDate = asset.transactionDate;
    this.transactionDateUser = asset.transactionDateUser;
    this.transactionDateClt = asset.transactionDateClt;
    this.transactionDateExcel = asset.transactionDateExcel;
    this.narrative = asset.narrative;
    this.assetNarrative = asset.assetNarrative;
    this.assetCategory = asset.assetCategory;
    this.cerysCategory = asset.cerysCategory;
    this.value = asset.value;
    if (asset.amortBasis) this.amortBasis = asset.amortBasis;
    if (asset.amortRate) this.amortRate = asset.amortRate;
    if (asset.depnBasis) this.depnBasis = asset.depnBasis;
    if (asset.depnRate) this.depnRate = asset.depnRate;
    this.disposedOf = asset.disposedOf;
    this.subTransactions = asset.periods.find((period) => period.reportingPeriodId === periodId).subTransactions;
  }
}

export class ActiveSubCategory {
  assetSubCategory: string;
  assetSubCatCode: number;
  regColNameOne: string;
  regColNameTwo: string;
  regCol?: number;
  constructor(subTransaction: AssetSubTransaction) {
    this.assetSubCategory = subTransaction.assetSubCategory;
    this.assetSubCatCode = subTransaction.assetSubCatCode;
    this.regColNameOne = subTransaction.regColNameOne;
    this.regColNameTwo = subTransaction.regColNameTwo;
  }
}

export class ColumnsIndex {
  costCFNum: number;
  costCFLetter: string;
  depnBFNum: number;
  depnBFLetter: string;
  depnCFNum: number;
  depnCFLetter: string;
  nBVCFNum: number;
  nBVCFLetter: string;
  nBVBFNum: number;
  nBVBFLetter: string;
  costTotalEndLetter: string;
  depnTotalEndLetter: string;
  blankCellOneNum: number;
  blankCellOneLetter: string;
  blankCellTwoNum: number;
  blankCellTwoLetter: string;
  colsToTotal: { number: number; letter: string }[];
  constructor() {
    this.costCFNum = 0;
    this.costCFLetter = "";
    this.depnBFNum = 0;
    this.depnBFLetter = "";
    this.depnCFNum = 0;
    this.depnCFLetter = "";
    this.nBVCFNum = 0;
    this.nBVCFLetter = "";
    this.nBVBFNum = 0;
    this.nBVBFLetter = "";
    this.costTotalEndLetter = "";
    this.depnTotalEndLetter = "";
    this.blankCellOneNum = 0;
    this.blankCellOneLetter = "";
    this.blankCellTwoNum = 0;
    this.blankCellTwoLetter = "";
    this.colsToTotal = [{ number: 4, letter: "D" }];
  }
}

export class RegisterCreationTemplate {
  registerType: "IFA" | "TFA" | "IP";
  register: RegisterType;
  allTransactions: DetailedAssetTransaction[];
  possibleAdditions: AssetTransaction[];
  refinedTransactions: DetailedAssetTransaction[];
  constructor(session: Session, registerType: "IFA" | "TFA" | "IP") {
    this.registerType = registerType;
    this.register = registerTypes[registerType];
    const relevantTrans = session.assignment.getUnprocessedFATransByType(session, registerType);
    const convertedTrans: AssetTransaction[] = [];
    relevantTrans.forEach((tran) => {
      if (tran.getActiveClientTransactions(session).length > 0 && !tran.representsClientTransaction(session)) {
        const clientTrans = tran.getClientTransAsAssetTrans(session, true);
        convertedTrans.push(...clientTrans);
      } else convertedTrans.push(tran);
    });
    this.finaliseAssetObjects(session, convertedTrans);
    // this.allTransactions = convertedTrans.map((assetTran) => {
    //   const cerysCodeObj = assetTran.getCerysCodeObj(session);
    //   return { ...cerysCodeObj, ...assetTran };
    // });
    this.allTransactions = convertedTrans.map((tran) => new DetailedAssetTransaction(session, tran));
    const { refined, possible } = this.refineTransactions(session, convertedTrans, registerType);
    this.possibleAdditions = possible;
    this.refinedTransactions = refined;
  }

  finaliseAssetObjects(session: Session, relevantTransactions: AssetTransaction[]) {
    const reportingPeriod = session.assignment.reportingPeriod;
    relevantTransactions.forEach((asset) => {
      asset.activePeriods = [reportingPeriod._id];
      asset.periods = [
        {
          reportingPeriodNumber: reportingPeriod.periodNumber,
          reportingPeriodId: reportingPeriod._id,
          subTransactions: asset.subTransactions,
        },
      ];
    });
  }

  // identifyPossibleAdditions(
  //   session: Session,
  //   relevantTransactions: AssetTransaction[],
  //   registerType: "IFA" | "TFA" | "IP"
  // ) {
  //   return relevantTransactions.filter((tran) => {
  //     let test: number;
  //     if (!tran.processedAsAsset && !tran.clientTransactionAttachment) {
  //       const cerysCodeObj = tran.getCerysCodeObj(session);
  //       if (
  //         (registerType === "IFA" &&
  //           cerysCodeObj.cerysCategory === "Intangible assets" &&
  //           cerysCodeObj.assetCodeType === "iFACostBF") ||
  //         (registerType === "TFA" &&
  //           cerysCodeObj.cerysCategory === "Tangible assets" &&
  //           cerysCodeObj.assetCodeType === "tFACostBF") ||
  //         (registerType === "IP" &&
  //           cerysCodeObj.cerysCategory === "Investment property" &&
  //           cerysCodeObj.assetCodeType === "iPCostBF")
  //       ) {
  //         test = calculateDiffInDays(session.assignment.reportingPeriod.periodStart, tran.transactionDate);
  //       }
  //     }
  //     return test > 0;
  //   });
  // }

  refineTransactions(session: Session, relevantTransactions: AssetTransaction[], registerType: "IFA" | "TFA" | "IP") {
    const refined = [];
    const possible = [];
    relevantTransactions.forEach((tran) => {
      let test: number;
      if (!tran.processedAsAsset && (!tran.clientTransactionAttachment || tran.representsClientTransaction(session))) {
        const cerysCodeObj = tran.getCerysCodeObj(session);
        if (
          (registerType === "IFA" &&
            cerysCodeObj.cerysCategory === "Intangible assets" &&
            cerysCodeObj.assetCodeType === "iFACostBF") ||
          (registerType === "TFA" &&
            cerysCodeObj.cerysCategory === "Tangible assets" &&
            cerysCodeObj.assetCodeType === "tFACostBF") ||
          (registerType === "IP" &&
            cerysCodeObj.cerysCategory === "Investment property" &&
            cerysCodeObj.assetCodeType === "iPCostBF")
        ) {
          test = calculateDiffInDays(session.assignment.reportingPeriod.periodStart, tran.transactionDate);
        }
      }
      test > 0 ? possible.push(tran) : refined.push(tran);
    });
    return { refined, possible };
  }
}

export class IdenitfyPossibleAdditionsPrompt extends InTrayItem {
  register: RegisterType;
  transactions: AssetTransaction[];
  constructor(registerTemplate: RegisterCreationTemplate) {
    super({
      title: `Identify possible ${registerTemplate.registerType} additions`,
      getSubtitle: null,
      getSummaryText: null,
      detailsAction: null,
      detailsPath: INTRAY_DETAILS,
      affirmativeAction: null,
    });
    this.register = registerTemplate.register;
    this.transactions = registerTemplate.possibleAdditions;
    this.getSubtitle = this.getIntraySubtitle;
    this.getSummaryText = this.getIntraySummaryText;
    this.detailsAction = this.createLikelyAdditionsSumm;
    this.detailsActionParams = [this.transactions, this.register.initials];
    this.affirmativeAction = this.handleReanalysis;
  }

  // handleClick(session: Session, inTray: InTray) {
  //   this.createLikelyAdditionsSumm(session);
  //   this.handleClickGeneric(session, inTray);
  // }

  getIntraySubtitle() {
    return null;
  }

  getIntraySummaryText() {
    return `These transactions were posted as b/fwd balances but from their dates would appear to be additions.
          Would you like to repost them as additions?`;
  }

  handleReanalysis = async (session: Session) => {
    try {
      await Excel.run(async (context) => {
        const activeJournal = this.createTransactionUpdates(session);
        await processTransBatch(context, session, activeJournal);
      });
    } catch (e) {
      console.error(e);
    }
  };

  createTransactionUpdates(session: Session) {
    const journals: Journal[] = [];
    this.transactions.forEach((tran) => {
      const chart = session.chart;
      for (let i = 0; i < chart.length; i++) {
        if (chart[i].cerysCode === tran.cerysCode + 1) {
          const drJnl: JournalDetailsProps = {
            cerysCode: chart[i].cerysCode,
            value: tran.value,
            transactionDate: tran.transactionDate,
            transactionType: "auto-addition",
            narrative: `${tran.assetNarrative} reanalysed as addition`,
            clientNominalCode: tran.clientNominalCode,
          };
          const transactionAttachment: TransactionAttachmentProps = {
            type: "client",
            transactionId: tran.clientTransactionId,
          };
          journals.push(new Journal(session, drJnl, transactionAttachment));
        }
        // back to here please
        if (chart[i].cerysCode === tran.cerysCode) {
          const crJnl: JournalDetailsProps = {
            cerysCode: chart[i].cerysCode,
            value: tran.value * -1,
            transactionDate: tran.transactionDate,
            transactionType: "auto-addition",
            narrative: `${tran.assetNarrative} reanalysed as addition`,
            clientNominalCode: tran.clientNominalCode,
          };
          const transactionAttachment: TransactionAttachmentProps = {
            type: "client",
            transactionId: tran.clientTransactionId,
          };
          journals.push(new Journal(session, crJnl, transactionAttachment));
        }
      }
    });
    return new ActiveJournal({ type: "auto-addition", journals });
  }

  async createLikelyAdditionsSumm(session: Session) {
    try {
      await Excel.run(async (context) => {
        const registerType = this.register.initials;
        const name = `${registerType} Possible Additions`;
        const { ws } = await addOneWorksheet(context, session, { name, addListeners: undefined });
        const valuesToPost = [
          ["TRANSACTION", "CLIENT", "CLIENT", "CLIENT", "CLIENT", "DEBIT/", "POSTING", "CERYS", "CERYS", "CERYS"],
          ["NUMBER", "DATE", "NARRATIVE", "NC", "NOMINAL", "(CREDIT)", "SOURCE", "CODE", "NOMINAL", "NARRATIVE"],
        ];
        this.transactions.forEach((transaction) => {
          const cerysCodeObj = transaction.getCerysCodeObj(session);
          const transVals = [];
          transVals.push(transaction.transactionNumber);
          transVals.push(transaction.getExcelDate());
          transVals.push(transaction.assetNarrative);
          transVals.push(transaction.clientNominalCode);
          transVals.push(transaction.getClientNominalCodeObj(session).clientCodeName);
          transVals.push(transaction.value / 100);
          if (transaction.transactionType === "journal") {
            transVals.push("Journal");
          } else if (transaction.transactionType === "final journal") {
            transVals.push("Final journal");
          } else if (transaction.transactionType === "review journal") {
            transVals.push("Review journal");
          } else if (transaction.transactionType === "client trial balance") {
            transVals.push("Client TB");
          } else if (transaction.transactionType === "client adjustment") {
            transVals.push("Client adjustment");
          }
          transVals.push(transaction.cerysCode);
          transVals.push(cerysCodeObj.cerysShortName);
          transVals.push(transaction.narrative);
          valuesToPost.push(transVals);
        });
        const headerRange = ws.getRange("A1:J2");
        headerRange.format.font.bold = true;
        const range = ws.getRange(`A1:J${valuesToPost.length}`);
        range.values = valuesToPost;
        const rangeB = ws.getRange("B:B");
        rangeB.numberFormat = [["dd/mm/yyyy"]];
        const rangeF = ws.getRange("F:F");
        rangeF.numberFormat = STANDARD_NUMBER_FORMAT;
        const rangeAJ = ws.getRange("A:J");
        rangeAJ.format.autofitColumns();
        await context.sync();
        ws.activate();
      });
    } catch (e) {
      console.error(e);
    }
  }
}

export class AssetRegCreationPrompt extends InTrayItem {
  register: RegisterType;
  transactions: DetailedAssetTransaction[];
  constructor(registerTemplate: RegisterCreationTemplate) {
    super({
      title: `Create ${registerTemplate.registerType} register?`,
      getSubtitle: null,
      getSummaryText: null,
      detailsAction: null,
      detailsPath: INTRAY_DETAILS,
      affirmativeAction: null,
    });
    this.register = registerTemplate.register;
    this.transactions = registerTemplate.refinedTransactions;
    this.getSubtitle = this.getIntraySubtitle;
    this.getSummaryText = this.getIntraySummaryText;
    this.detailsAction = this.createTransactionsSummary;
    this.affirmativeAction = this.createRegister;
  }

  // handleClick(session: Session, inTray: InTray) {
  //   this.previewRelevantTransactions(session);
  //   this.handleClickGeneric(session, inTray);
  // }

  getIntraySubtitle() {
    return null;
  }

  getIntraySummaryText() {
    return `Your data suggests this client owns ${this.register.longLower}.
          You have not set up a relevant asset register.
          Would you like to create one automatically?`;
  }

  async createRegister(session: Session) {
    await this.register.createRegister(session, this.transactions);
  }

  // previewRelevantTransactions(session: Session) {
  //   createRelTrans(session, this.register.initials);
  // }

  async createTransactionsSummary(session: Session) {
    try {
      await Excel.run(async (context) => {
        const sheetMapping = [];
        const name = `${this.register.initials} Transactions`;
        const { ws } = await addOneWorksheet(context, session, { name, addListeners: undefined });
        const activeClient: Client = session.customer.clients.find(
          (client) => client._id === session.assignment.clientId
        );
        const amortOrDepn = this.register.initials === "IFA" ? "AMORT" : "DEPN";
        const valuesToPost = [
          [
            "TRANSACTION",
            "CERYS",
            "CERYS",
            "POSTING",
            "CERYS",
            "CERYS",
            "CLIENT",
            "CLIENT",
            "CLIENT",
            "DEBIT/",
            amortOrDepn,
            amortOrDepn,
            amortOrDepn,
          ],
          [
            "NUMBER",
            "DATE",
            "NARRATIVE",
            "SOURCE",
            "CODE",
            "NOMINAL",
            "NC",
            "NOMINAL",
            "NARRATIVE",
            "(CREDIT)",
            "BASIS",
            "RATE",
            "CHARGE",
          ],
        ];
        session[`${this.register.initials}Transactions`] = [];
        this.transactions.forEach((tran) => {
          const map = new TransactionMap(tran._id, session[`${this.register.initials}Transactions`].length + 3, null); // Issue: is this right?? don't think so...
          sheetMapping.push(map);
        });
        this.transactions.forEach((tran) => {
          const cerysCodeObj = tran.getCerysCodeObj(session);
          const transVals = [];
          transVals.push(tran.transactionNumber);
          transVals.push(tran.getExcelDate());
          transVals.push(tran.narrative);
          if (tran.transactionType === "journal") {
            transVals.push("Journal");
          } else if (tran.transactionType === "final journal") {
            transVals.push("Final journal");
          } else if (tran.transactionType === "review journal") {
            transVals.push("Review journal");
          } else if (tran.transactionType === "client trial balance") {
            transVals.push("Client TB");
          } else if (tran.transactionType === "client adjustment") {
            transVals.push("Client adjustment");
          } else {
            transVals.push("Sticking plaster");
          }
          transVals.push(tran.cerysCode);
          transVals.push(cerysCodeObj.cerysShortName);
          if (tran.clientNominalCode >= 0) {
            transVals.push(tran.clientNominalCode);
          } else {
            transVals.push("NA");
          }
          if (tran.clientNominalCode >= 0) {
            transVals.push(tran.getClientNominalCodeObj(session).clientCodeName);
          } else {
            transVals.push("NA");
          }
          if (tran.assetNarrative) {
            transVals.push(tran.assetNarrative);
          } else {
            transVals.push("NA");
          }
          transVals.push(tran.value / 100);
          populateDepnCols(session, activeClient, transVals, tran, this.register.initials);
          calculateCharge(session, tran, this.register.initials);
          tran.amortChg ? transVals.push(tran.amortChg / 100) : transVals.push(tran.depnChg / 100);
          valuesToPost.push(transVals);
        });
        const headerRange = ws.getRange("A1:M2");
        headerRange.format.font.bold = true;
        const range = ws.getRange(`A1:M${valuesToPost.length}`);
        range.values = valuesToPost;
        const rangeB = ws.getRange("B:B");
        rangeB.numberFormat = [["dd/mm/yyyy"]];
        const rangeJ = ws.getRange("J:J");
        rangeJ.numberFormat = STANDARD_NUMBER_FORMAT;
        const rangeM = ws.getRange("M:M");
        rangeM.numberFormat = STANDARD_NUMBER_FORMAT;
        const rangeAM = ws.getRange("A:M");
        rangeAM.format.autofitColumns();
        const controlledRangeObj = new ExcelRangeObject({ row: 1, col: 1 }, valuesToPost);
        const transactions = _.cloneDeep(session[`${this.register.initials}Transactions`]);
        createEditableWorksheet(
          session,
          transactions,
          ws,
          valuesToPost,
          "FATransactions",
          sheetMapping,
          controlledRangeObj
        );
        await context.sync();
        ws.activate();
      });
    } catch (e) {
      console.error(e);
    }
  }
}
