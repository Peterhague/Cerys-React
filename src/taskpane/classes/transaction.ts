import {
  AssetSubTransaction,
  AssetTransactionProps,
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
  defaultClientMapping: ClientMapping;
  activeClientMapping: ClientMapping;
  updates: TransactionUpdate[];
  cerysCode: number;
  processedAsAsset: boolean;
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
    this.defaultClientMapping = transaction.defaultClientMapping;
    this.activeClientMapping = transaction.activeClientMapping;
    this.updates = transaction.updates;
    this.cerysCode = transaction.cerysCode;
    this.processedAsAsset = transaction.processedAsAsset;
    this._id = transaction._id;
  }

  getCerysCodeObj(session: Session) {
    return session.chart.find((code) => code.cerysCode === this.cerysCode);
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

// export class DetailedTransaction implements BaseCerysCodeObject, AssetTransactionProps, TransactionProps {
//   cerysCode: number;
//   cerysName: string;
//   cerysShortName: string;
//   cerysExcelName: string;
//   cerysCategory: string;
//   cerysSubCategory: string | null;
//   isFixedAsset: boolean;
//   assetCategory: string | null;
//   assetCategoryNo: number | null;
//   assetSubCategory: string | null;
//   assetSubCatCode: number | null;
//   assetCodeType: string | null;
//   regColNameOne: string | null;
//   regColNameTwo: string | null;
//   altCategory: string | null;
//   defaultSign: string | null;
//   clientAdj: boolean;
//   closeOffCode: number;
//   transactionDateUser?: string;
//   transactionDateClt?: number;
//   assetNarrative?: string;
//   assetSubCatCodes?: (number | null)[];
//   amortBasis?: string;
//   amortRate?: string;
//   amortChg?: number;
//   depnBasis?: string;
//   depnRate?: string;
//   depnChg?: number;
//   subTransactions?: AssetSubTransaction[];
//   activePeriods?: string[];
//   periods?: {
//     reportingPeriodNumber: ReportingPeriod["periodNumber"];
//     reportingPeriodId: ReportingPeriod["_id"];
//     subTransactions: AssetSubTransaction[];
//   }[];
//   value: number;
//   transactionType: string;
//   transactionDate: Date | string;
//   transactionDateExcel: number;
//   transactionNumber: number;
//   transactionBatchNumber: number;
//   iteration: number;
//   iterations: {
//     iteration: number;
//     transactionDate: string;
//     cerysCode: number;
//     narrative: string;
//   }[];
//   narrative: string;
//   user: string;
//   clientTB: boolean;
//   clientNominalCode: number;
//   clientNominalName: string;
//   clientAdjustment: boolean;
//   journal: boolean;
//   reviewJournal: boolean;
//   finalJournal: boolean;
//   workbookRef: string;
//   worksheetRef: string;
//   dateCreated: string;
//   defaultClientMapping: ClientMapping;
//   activeClientMapping: ClientMapping;
//   updates: TransactionUpdate[];
//   processedAsAsset: boolean;
//   _id: string;
//   constructor(session: Session, transaction: Transaction) {
//     const cerysCodeObj = transaction.getCerysCodeObj(session);
//     this.cerysCode = transaction.cerysCode;
//     this.cerysName = cerysCodeObj.cerysName;
//     this.cerysShortName = cerysCodeObj.cerysShortName;
//     this.cerysExcelName = cerysCodeObj.cerysExcelName;
//     this.cerysCategory = cerysCodeObj.cerysCategory;
//     this.cerysSubCategory = cerysCodeObj.cerysSubCategory;
//     this.isFixedAsset = cerysCodeObj.isFixedAsset;
//     this.assetCategory = cerysCodeObj.assetCategory;
//     assetCategoryNo;
//     assetSubCategory;
//     assetSubCatCode;
//     assetCodeType;
//     regColNameOne;
//     regColNameTwo;
//     altCategory;
//     defaultSign;
//     clientAdj;
//     closeOffCode;
//     transactionDateUser;
//     transactionDateClt;
//     assetNarrative;
//     assetSubCatCodes;
//     amortBasis;
//     amortRate;
//     amortChg;
//     depnBasis;
//     depnRate;
//     depnChg;
//     subTransactions;
//     activePeriods;
//     periods;
//     value;
//     transactionType;
//     transactionDate;
//     transactionDateExcel;
//     transactionNumber;
//     transactionBatchNumber;
//     iteration;
//     iterations;
//     narrative;
//     user;
//     clientTB;
//     clientNominalCode;
//     clientNominalName;
//     clientAdjustment;
//     journal;
//     reviewJournal;
//     finalJournal;
//     workbookRef;
//     worksheetRef;
//     dateCreated;
//     defaultClientMapping;
//     activeClientMapping;
//     updates;
//     processedAsAsset;
//     _id;
//   }
// }
