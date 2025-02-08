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
  transactionType: TransactionProps["transactionType"];
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
  clientNominalCode: number;
  workbookRef: string;
  worksheetRef: string;
  dateCreated: string;
  updates: TransactionUpdate[];
  cerysCode: number;
  processedAsAsset: boolean;
  clientMappingOverridden: boolean;
  clientMappingOverride: ClientMapping;
  clientTransactionId: string;
  clientTransactionAttachment: string;
  cerysTransactionAttachment: string;
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
    this.clientNominalCode = transaction.clientNominalCode;
    this.workbookRef = transaction.workbookRef;
    this.worksheetRef = transaction.worksheetRef;
    this.dateCreated = transaction.dateCreated;
    this.updates = transaction.updates;
    this.cerysCode = transaction.cerysCode;
    this.processedAsAsset = transaction.processedAsAsset;
    this.clientMappingOverridden = transaction.clientMappingOverridden;
    this.clientMappingOverride = transaction.clientMappingOverride;
    this.clientTransactionId = transaction.clientTransactionId;
    this.clientTransactionAttachment = transaction.clientTransactionAttachment;
    this.cerysTransactionAttachment = transaction.cerysTransactionAttachment;
    this._id = transaction._id;
  }

  getTransactionProps() {
    return {
      cerysCode: this.cerysCode,
      value: this.value,
      transactionType: this.transactionType,
      transactionDate: this.transactionDate,
      transactionNumber: this.transactionNumber,
      transactionBatchNumber: this.transactionBatchNumber,
      iteration: this.iteration,
      iterations: this.iterations,
      narrative: this.narrative,
      user: this.user,
      clientNominalCode: this.clientNominalCode,
      workbookRef: this.workbookRef,
      worksheetRef: this.worksheetRef,
      dateCreated: this.dateCreated,
      updates: this.updates,
      processedAsAsset: this.processedAsAsset,
      clientMappingOverridden: this.clientMappingOverridden,
      clientMappingOverride: this.clientMappingOverride,
      clientTransactionId: this.clientTransactionId,
      clientTransactionAttachment: this.clientTransactionAttachment,
      cerysTransactionAttachment: this.cerysTransactionAttachment,
      _id: this._id,
    };
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

  getActiveClientTransactions(session: Session) {
    const transToExclude = session.assignment.transactions
      .filter((tran) => tran.cerysCode === this.cerysCode && tran.clientTransactionAttachment)
      .map((tran) => tran.clientTransactionAttachment);
    const activeTrans = this.getClientTransactions(session).filter(
      (tran) => !this.clientTransactionAttachment && !transToExclude.includes(tran._id)
    );
    return activeTrans;
  }

  getClientNominalCodeObj(session: Session) {
    return session.clientChart.find((code) => code.clientCode === this.clientNominalCode);
  }

  getClientTransAsCerysTrans(session: Session, excludeNullified: boolean) {
    const trans = excludeNullified ? this.getActiveClientTransactions(session) : this.getClientTransactions(session);
    return trans
      .map((tran) => new ClientTransactionConversion(tran, this))
      .map((conversion) => new Transaction(conversion));
  }

  getClientTransAsAssetTrans(session: Session, excludeNullified: boolean) {
    const trans = excludeNullified ? this.getActiveClientTransactions(session) : this.getClientTransactions(session);
    return trans
      .map((tran) => new ClientTransactionConversion(tran, this))
      .map((item) => new AssetTransaction(session, item));
  }

  representsClientTransaction(session: Session) {
    const matchingTransaction = session.assignment.clientNL.find(
      (tran) => tran._id === this.clientTransactionAttachment && tran.value === this.value
    );
    return matchingTransaction ? true : false;
  }
}

export class ClientTransactionConversion extends Transaction {
  clientNarrative: string;
  constructor(clientTransaction: ClientTransaction, cerysTransaction: Transaction) {
    super(cerysTransaction);
    this.transactionNumber = clientTransaction.number;
    this.value = clientTransaction.value;
    this.clientNarrative = clientTransaction.detail;
    this.transactionDate = convertExcelDate(clientTransaction.date);
    this.clientTransactionId = clientTransaction._id;
  }
}

export class AssetTransaction extends Transaction {
  assetNarrative: string;
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

  constructor(session: Session, transaction: Transaction | ClientTransactionConversion) {
    const transactionProps = transaction.getTransactionProps();
    super(transactionProps);
    const cerysCodeObj = this.getCerysCodeObj(session);
    this.assetNarrative =
      transaction instanceof ClientTransactionConversion ? transaction.clientNarrative : transaction.narrative;
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
}
