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
