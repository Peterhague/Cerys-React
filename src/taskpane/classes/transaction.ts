import {
  AssetSubTransaction,
  ClientCodeObjectProps,
  ClientMapping,
  ClientTransaction,
  ReportingPeriod,
  TransactionProps,
} from "../interfaces/interfaces";
import { convertExcelDate } from "../utils/helper-functions";
import { Session } from "./session";
import { TransactionUpdate } from "./transaction-update";

export class Transaction {
  value: number;
  transactionType: string;
  transactionDate: string;
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

  constructor(transaction: TransactionProps) {
    this.value = transaction.value;
    this.transactionType = transaction.transactionType;
    this.transactionDate = transaction.transactionDate;
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
    let clientCodeObj: ClientCodeObjectProps;
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

  getExcelDate() {
    const date = new Date(this.transactionDate);
    const baseDate = new Date("1899-12-30");
    const utc1 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    const utc2 = Date.UTC(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
    const timeDiff = Math.abs(utc2 - utc1);
    const excelDate = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return excelDate;
  }

  getClientTransactions(session: Session) {
    return session.assignment.clientNL.filter((tran) => tran.code === this.clientNominalCode);
  }

  getClientTransAsCerysTrans(session: Session) {
    const trans = this.getClientTransactions(session);
    return trans
      .map((tran) => new ClientTransactionConversion(tran, this))
      .map((conversion) => new Transaction(conversion));
  }
}

export class ClientTransactionConversion {
  cerysCode: number;
  value: number;
  transactionType: string;
  transactionDate: string;
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
  processedAsAsset: boolean;
  clientMappingOverridden: boolean;
  clientMappingOverride: ClientMapping;
  _id: string;
  constructor(clientTransaction: ClientTransaction, cerysTransaction: Transaction) {
    this.value = clientTransaction.value;
    this.transactionType = cerysTransaction.transactionType;
    this.transactionDate = convertExcelDate(clientTransaction.date);
    this.transactionNumber = clientTransaction.number;
    this.transactionBatchNumber = cerysTransaction.transactionBatchNumber;
    this.iteration = null;
    this.iterations = null;
    this.narrative = clientTransaction.detail;
    this.user = cerysTransaction.user;
    this.clientTB = cerysTransaction.clientTB;
    this.clientNominalCode = cerysTransaction.clientNominalCode;
    this.clientAdjustment = cerysTransaction.clientAdjustment;
    this.journal = cerysTransaction.journal;
    this.reviewJournal = cerysTransaction.reviewJournal;
    this.finalJournal = cerysTransaction.finalJournal;
    this.workbookRef = cerysTransaction.workbookRef;
    this.worksheetRef = cerysTransaction.worksheetRef;
    this.dateCreated = cerysTransaction.dateCreated;
    this.updates = null;
    this.cerysCode = cerysTransaction.cerysCode;
    this.processedAsAsset = false;
    this.clientMappingOverridden = null;
    this.clientMappingOverride = null;
    this._id = clientTransaction._id;
  }
}

export class AssetTransaction extends Transaction {
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

  constructor(session: Session, transaction: Transaction) {
    super(transaction);
    const cerysCodeObj = this.getCerysCodeObj(session);
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
  }
  //why would you need this method? This is an extension of that transaction...
  getTransaction(session: Session) {
    return session.assignment.transactions.find((tran) => tran._id === this._id);
  }

  getTranAndCerysCodeObj(session: Session) {
    const transaction = session.assignment.transactions.find((tran) => tran._id === this._id);
    const cerysCodeObj = transaction.getCerysCodeObj(session);
    return { transaction, cerysCodeObj };
  }

  getClientTransAsAssetTrans(session: Session) {
    return this.getClientTransAsCerysTrans(session).map((tran) => new AssetTransaction(session, tran));
  }
}
