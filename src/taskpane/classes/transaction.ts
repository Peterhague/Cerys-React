import {
  AssetSubTransaction,
  ClientCodeObjectProps,
  ClientMapping,
  ClientTransactionProps,
  ReportingPeriod,
  TransactionProps,
} from "../interfaces/interfaces";
import { convertExcelDate } from "../utils/helper-functions";
import { Session } from "./session";
import { TransactionUpdate } from "./transaction-update";

export class Transaction implements TransactionProps {
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
  representsBalanceOfClientCode: number;
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
  cerysTransactionId: string;
  _id?: string;

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
    this.representsBalanceOfClientCode = transaction.representsBalanceOfClientCode;
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
    this.cerysTransactionId = transaction._id;
  }

  // getTransactionProps() {
  //   return {
  //     cerysCode: this.cerysCode,
  //     value: this.value,
  //     transactionType: this.transactionType,
  //     transactionDate: this.transactionDate,
  //     transactionNumber: this.transactionNumber,
  //     transactionBatchNumber: this.transactionBatchNumber,
  //     iteration: this.iteration,
  //     iterations: this.iterations,
  //     narrative: this.narrative,
  //     user: this.user,
  //     clientNominalCode: this.clientNominalCode,
  //     workbookRef: this.workbookRef,
  //     worksheetRef: this.worksheetRef,
  //     dateCreated: this.dateCreated,
  //     updates: this.updates,
  //     processedAsAsset: this.processedAsAsset,
  //     clientMappingOverridden: this.clientMappingOverridden,
  //     clientMappingOverride: this.clientMappingOverride,
  //     clientTransactionId: this.clientTransactionId,
  //     clientTransactionAttachment: this.clientTransactionAttachment,
  //     cerysTransactionAttachment: this.cerysTransactionAttachment,
  //     _id: this._id,
  //   };
  // }

  getCerysCodeObj(session: Session) {
    return session.chart.find((code) => code.cerysCode === this.cerysCode);
  }

  getCombinedTranAndCerysCodeObj(session: Session) {
    console.log(this);
    const cerysCodeObj = this.getCerysCodeObj(session);
    const obj = { ...this, ...cerysCodeObj };
    console.log(obj);
    return obj;
  }

  getClientMappingObj(session: Session) {
    let clientCodeObj: ClientCodeObjectProps;
    if (this.representsBalanceOfClientCode > 0) {
      const codeObj = session.clientChart.find((code) => code.clientCode === this.representsBalanceOfClientCode);
      clientCodeObj = { ...codeObj, _id: codeObj.clientCodeObjectId };
    }
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
    return session.assignment.clientNL.filter((tran) => tran.code === this.representsBalanceOfClientCode);
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
    return session.clientChart.find((code) => code.clientCode === this.representsBalanceOfClientCode);
  }

  getClientTransAsCerysTrans(session: Session, excludeNullified: boolean) {
    const trans = excludeNullified ? this.getActiveClientTransactions(session) : this.getClientTransactions(session);
    return trans
      .map((tran) => new ClientTransactionConversion(tran, this.revertToDbIdNotation()))
      .map((conversion) => new Transaction(conversion.revertToDbIdNotation()));
  }

  getClientTransAsAssetTrans(session: Session, excludeNullified: boolean) {
    const trans = excludeNullified ? this.getActiveClientTransactions(session) : this.getClientTransactions(session);
    return trans
      .map((tran) => new ClientTransactionConversion(tran, this.revertToDbIdNotation()))
      .map((item) => new AssetTransaction(session, item));
  }

  representsClientTransaction(session: Session) {
    const matchingTransaction = session.assignment.clientNL.find(
      (tran) => tran._id === this.clientTransactionAttachment && tran.value === this.value
    );
    return matchingTransaction ? true : false;
  }

  negatesClientTransaction(session: Session) {
    const matchingTransaction = session.assignment.clientNL.find(
      (tran) => tran._id === this.clientTransactionAttachment && tran.value === this.value * -1
    );
    return matchingTransaction ? true : false;
  }

  isNegatedByTransRepresentingClientTrans(session: Session) {
    const clientTrans = this.getClientTransactions(session);
    if (clientTrans.length === 0) return false;
    for (let i = 0; i < clientTrans.length; i++) {
      const match = session.assignment.transactions.find(
        (tran) => tran.clientTransactionAttachment === clientTrans[i]._id && tran.value === clientTrans[i].value
      );
      if (!match) return false;
    }
    return true;
  }

  revertToDbIdNotation() {
    const reversion: Transaction = { ...this, _id: this.cerysTransactionId };
    return reversion;
  }
}

export class ClientTransactionConversion extends Transaction {
  clientNarrative: string;
  constructor(clientTransaction: ClientTransactionProps, cerysTransaction: TransactionProps) {
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

  constructor(session: Session, transaction: TransactionProps | ClientTransactionConversion) {
    if (!(transaction instanceof ClientTransactionConversion) && transaction.transactionNumber === 40) {
      console.log("TRANSACTION 40!!!!!!!!!!!1111");
      console.log(transaction);
    }
    const props = transaction instanceof ClientTransactionConversion ? transaction.revertToDbIdNotation() : transaction;
    super(props);
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
  // getTransaction(session: Session) {
  //   return session.assignment.transactions.find((tran) => tran._id === this._id);
  // }

  getTranAndCerysCodeObj(session: Session) {
    const transaction = session.assignment.transactions.find(
      (tran) => tran.cerysTransactionId === this.cerysTransactionId
    );
    const cerysCodeObj = transaction.getCerysCodeObj(session);
    return { transaction, cerysCodeObj };
  }
}

// type NewBase = Omit<BaseCerysCodeObject, "_id">;

// export class DetailedTransaction extends Transaction implements NewBase {
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
//   constructor(transaction: Transaction, cerysCodeObj: BaseCerysCodeObject) {
//     super(transaction);
//     this.cerysName = cerysCodeObj.cerysName;
//     this.cerysShortName = cerysCodeObj.cerysShortName;
//     this.cerysExcelName = cerysCodeObj.cerysExcelName;
//     this.cerysCategory = cerysCodeObj.cerysCategory;
//     this.cerysSubCategory = cerysCodeObj.cerysSubCategory;
//     this.isFixedAsset = cerysCodeObj.isFixedAsset;
//     this.assetCategory = cerysCodeObj.assetCategory;
//     this.assetCategoryNo = cerysCodeObj.assetCategoryNo;
//     this.assetSubCategory = cerysCodeObj.assetSubCategory;
//     this.assetSubCatCode = cerysCodeObj.assetSubCatCode;
//     this.assetCodeType = cerysCodeObj.assetCodeType;
//     this.regColNameOne = cerysCodeObj.regColNameOne;
//     this.regColNameTwo = cerysCodeObj.regColNameTwo;
//     this.altCategory = cerysCodeObj.altCategory;
//     this.defaultSign = cerysCodeObj.defaultSign;
//     this.clientAdj = cerysCodeObj.clientAdj;
//     this.closeOffCode = cerysCodeObj.closeOffCode;
//   }
// }

// export class DetailedAssetTransaction extends AssetTransaction implements NewBase {
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
//   constructor(session: Session, transaction: AssetTransaction) {
//     super(session, transaction);
//     const cerysCodeObj = transaction.getCerysCodeObj(session);
//     this.cerysName = cerysCodeObj.cerysName;
//     this.cerysShortName = cerysCodeObj.cerysShortName;
//     this.cerysExcelName = cerysCodeObj.cerysExcelName;
//     this.cerysCategory = cerysCodeObj.cerysCategory;
//     this.cerysSubCategory = cerysCodeObj.cerysSubCategory;
//     this.isFixedAsset = cerysCodeObj.isFixedAsset;
//     this.assetCategory = cerysCodeObj.assetCategory;
//     this.assetCategoryNo = cerysCodeObj.assetCategoryNo;
//     this.assetSubCategory = cerysCodeObj.assetSubCategory;
//     this.assetSubCatCode = cerysCodeObj.assetSubCatCode;
//     this.assetCodeType = cerysCodeObj.assetCodeType;
//     this.regColNameOne = cerysCodeObj.regColNameOne;
//     this.regColNameTwo = cerysCodeObj.regColNameTwo;
//     this.altCategory = cerysCodeObj.altCategory;
//     this.defaultSign = cerysCodeObj.defaultSign;
//     this.clientAdj = cerysCodeObj.clientAdj;
//     this.closeOffCode = cerysCodeObj.closeOffCode;
//   }
// }
