import {
  AssetSubTransaction,
  AssetTransactionProps,
  ClientCodeObject,
  ClientMapping,
  ReportingPeriod,
  TransactionProps,
} from "../interfaces/interfaces";
import { Session } from "./session";
import { TransactionUpdate } from "./transaction-update";

export class Transaction implements TransactionProps {
  value: number;
  transactionType: string;
  transactionDate: Date | string;
  transactionDateExcel: number;
  transactionDateUser?: string;
  transactionDateClt?: number;
  transactionNumber: number;
  transactionBatchNumber: number;
  iteration: number;
  iterations: {
    iteration: number;
    transactionDate: string;
    cerysCode: number;
    narrative: string;
  }[];
  narrative: string;
  user: string;
  clientTB: boolean;
  clientNominalCode: number;
  clientNominalName: string;
  clientAdjustment: boolean;
  journal: boolean;
  reviewJournal: boolean;
  finalJournal: boolean;
  workbookRef: string;
  worksheetRef: string;
  dateCreated: string;
  updates: TransactionUpdate[];
  cerysCode: number;
  processedAsAsset: boolean;
  clientMappingOverridden: boolean;
  clientMappingOverride: ClientMapping;
  _id: string;

  constructor(transaction: Transaction) {
    this.value = transaction.value;
    this.transactionType = transaction.transactionType;
    this.transactionDate = transaction.transactionDate;
    this.transactionDateExcel = transaction.transactionDateExcel;
    this.transactionNumber = transaction.transactionNumber;
    this.transactionBatchNumber = transaction.transactionBatchNumber;
    this.iteration = transaction.iteration;
    this.iterations = transaction.iterations;
    this.narrative = transaction.narrative;
    this.user = transaction.user;
    this.clientTB = transaction.clientTB;
    this.clientNominalCode = transaction.clientNominalCode;
    this.clientAdjustment = transaction.clientAdjustment;
    this.journal = transaction.journal;
    this.reviewJournal = transaction.reviewJournal;
    this.finalJournal = transaction.finalJournal;
    this.workbookRef = transaction.workbookRef;
    this.worksheetRef = transaction.worksheetRef;
    this.dateCreated = transaction.dateCreated;
    this.updates = transaction.updates;
    this.cerysCode = transaction.cerysCode;
    this.processedAsAsset = transaction.processedAsAsset;
    this.clientMappingOverridden = transaction.clientMappingOverridden;
    this.clientMappingOverride = transaction.clientMappingOverride;
    this._id = transaction._id;
  }

  getCerysCodeObj(session: Session) {
    return session.chart.find((code) => code.cerysCode === this.cerysCode);
  }

  getClientMappingObj(session: Session) {
    let clientCodeObj: ClientCodeObject;
    if (this.clientNominalCode > 0)
      clientCodeObj = session.clientChart.find((code) => code.clientCode === this.clientNominalCode);
    let clientMappingObj: ClientMapping;
    if (clientCodeObj) {
      clientMappingObj = {
        clientSoftware: session.assignment.clientSoftwareDefaults.softwareName,
        clientCode:
          clientCodeObj.statement === "PL"
            ? session.assignment.clientSoftwareDefaults.PLReservesNominalCode
            : clientCodeObj.clientCode,
        clientCodeName: clientCodeObj.clientCodeName,
      };
    } else {
      clientMappingObj = this.clientMappingOverridden
        ? this.clientMappingOverride
        : this.getCerysCodeObj(session).currentClientMapping;
    }
    return clientMappingObj;
  }
}

export class AssetTransaction implements AssetTransactionProps {
  cerysCode: number;
  transactionDateUser?: string;
  transactionDateClt?: number;
  assetNarrative?: string;
  assetSubCatCodes?: (number | null)[];
  amortBasis?: string;
  amortRate?: string;
  amortChg?: number;
  depnBasis?: string;
  depnRate?: string;
  depnChg?: number;
  subTransactions?: AssetSubTransaction[];
  activePeriods?: string[];
  periods?: {
    reportingPeriodNumber: ReportingPeriod["periodNumber"];
    reportingPeriodId: ReportingPeriod["_id"];
    subTransactions: AssetSubTransaction[];
  }[];
  _id: string;

  constructor(session: Session, transaction: Transaction) {
    this.cerysCode = transaction.cerysCode;
    const cerysCodeObj = transaction.getCerysCodeObj(session);
    this.assetSubCatCodes = [cerysCodeObj.assetSubCatCode];
    this.subTransactions = [
      {
        assetSubCategory: cerysCodeObj.assetSubCategory,
        assetSubCatCode: cerysCodeObj.assetSubCatCode,
        regColNameOne: cerysCodeObj.regColNameOne,
        regColNameTwo: cerysCodeObj.regColNameTwo,
        value: transaction.value,
      },
    ];
    this._id = transaction._id;
  }

  getTransaction(session: Session) {
    return session.assignment.transactions.find((tran) => tran._id === this._id);
  }

  getTranAndCerysCodeObj(session: Session) {
    const transaction = session.assignment.transactions.find((tran) => tran._id === this._id);
    const cerysCodeObj = transaction.getCerysCodeObj(session);
    return { transaction, cerysCodeObj };
  }
}
