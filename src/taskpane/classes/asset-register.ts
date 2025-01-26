import { AssetDb, AssetRegisterDb, AssetSubTransaction } from "../interfaces/interfaces";
import { Session } from "./session";

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
