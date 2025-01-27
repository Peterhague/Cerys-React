import { Session } from "../classes/session";
import { TransactionUpdate } from "../classes/transaction-update";
import { Transaction } from "../classes/transaction";
import React from "react";
import { TrialBalanceLine } from "../classes/client-codes";
import { Directorship, NewIndiAssociation, Shareholding } from "../classes/individuals";
import { ShareClass } from "../classes/share-classes";
import { Client } from "../classes/client";
/*global Excel */

export interface BaseCerysCodeObjectProps {
  cerysCode: number;
  cerysName: string;
  cerysShortName: string;
  cerysExcelName: string;
  cerysCategory: string;
  cerysSubCategory: string | null;
  isFixedAsset: boolean;
  assetCategory: string | null;
  assetCategoryNo: number | null;
  assetSubCategory: string | null;
  assetSubCatCode: number | null;
  assetCodeType: string | null;
  regColNameOne: string | null;
  regColNameTwo: string | null;
  altCategory: string | null;
  defaultSign: string | null;
  clientAdj: boolean;
  closeOffCode: number;
  _id: string;
}

export interface CerysCodeObjectProps extends BaseCerysCodeObjectProps {
  sageLine50Code: number;
  sageOneCode: number;
  xeroCode: number;
}

export interface ClientCerysCodeObjectProps extends BaseCerysCodeObjectProps {
  currentClientMapping: ClientMapping;
  previousClientMappings: ClientMapping[];
}

export interface ClientCodeObjectProps {
  cerysCode: number;
  clientCode: number;
  clientCodeName: string;
  statement: string;
  _id: string;
}

export interface AssignmentProps {
  clientId: string;
  clientCode: string;
  clientName: string;
  reportingPeriod: ReportingPeriod;
  assignmentType: string;
  senior: ShortUser;
  manager: ShortUser;
  responsibleIndividual: ShortUser;
  clientSoftwareDefaults: ClientSoftwareDefaultsProps;
  workbookId: string;
  transactions: Transaction[];
  clientNL: ClientTransaction[];
  assignmentStatus: string;
  dateStarted: string;
  dateFinished: string;
  TBInitiated: boolean;
  TBEntered: boolean;
  transactionsPosted: boolean;
  NLEntered: boolean;
  templatesAmended: boolean;
  IFARegisterCreated: boolean;
  TFARegisterCreated: boolean;
  IPRegisterCreated: boolean;
  tb: TrialBalanceLine[];
  clientTB: ClientTBLineProps[];
  activeCategories: string[];
  activeCategoriesDetails: {
    cerysCategory: string;
    value: number;
    cerysCodes: number[];
    _id: string;
  }[];
  activeAssetCodeTypes: string[];
  transactionBatches: number;
  finalised: boolean;
  _id: string;
  profit?: number;
  tbListenerAdded: boolean;
  pLListenerAdded: boolean;
  bSListenerAdded?: boolean;
}

export interface PreliminaryAssignmentProps {
  clientId: string;
  clientCode: string;
  clientName: string;
  assignmentType: string;
  senior: ShortUser;
  manager: ShortUser;
  responsibleIndividual: ShortUser;
  clientSoftware: string;
  transactionsPosted: boolean;
  reportingDate: string;
  periodStart: string;
}

export interface ReportingPeriod {
  periodEnd: string;
  periodStart: string;
  periodType: string;
  noOfDays: number;
  periodNumber: number;
  reportingDate: string;
  reportingDateOrig: Date;
  reportingDateConverted: string;
  reportingDateExcel: number;
  finalTB: TrialBalanceLineProps[];
  bFTB: TrialBalanceLineProps[];
  _id: string;
}

export interface TrialBalanceLineProps {
  cerysCategory: string;
  cerysCode: number;
  closeOffCode: number;
  cerysName: string;
  value: number;
  assetCodeType: string;
  _id: string;
  identifier: string;
}

export interface ShortUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  _customer: string;
  _id: string;
}

export interface TransactionProps {
  cerysCode: number;
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
  processedAsAsset: boolean;
  clientMappingOverridden: boolean;
  clientMappingOverride: ClientMapping;
  _id: string;
}

export interface AssetTransactionProps {
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
  activePeriods?: ReportingPeriod["_id"][];
  periods?: {
    reportingPeriodNumber: ReportingPeriod["periodNumber"];
    reportingPeriodId: ReportingPeriod["_id"];
    subTransactions: AssetSubTransaction[];
  }[];
}

export interface AssetSubTransaction {
  assetSubCategory: string;
  assetSubCatCode: number;
  regColNameOne: string;
  regColNameTwo: string;
  value: number;
  regCol?: number;
}

export interface TransactionUpdateProps {
  worksheetName: string;
  worksheetId: string;
  type: string;
  value: string | number;
  mongoDate: string | null;
  reversion: string | number;
  cerysCodeObject: BaseCerysCodeObjectProps | null;
}

export interface DetailedTransaction extends BaseCerysCodeObjectProps, AssetTransactionProps, TransactionProps {}

export interface FATransaction extends Transaction {
  depnRate: string;
  amortRate: string;
}

export interface JournalProps {
  cerysCodeObj: BaseCerysCodeObjectProps;
  transactionId?: string;
  value: number;
  narrative: string;
  transactionType: string;
  clientTB: boolean;
  journal: boolean;
  transactionDate: string | Date;
  transactionDateExcel: number;
  processedAsAsset: boolean;
}

export interface JournalDetailsProps {
  cerysCode: number;
  value: number | string;
  narrative: string;
  transactionDate: Date | string;
  transactionType: string;
  clientTB: boolean;
  journal: boolean;
}

export interface ClientTransaction {
  code: number;
  number: number;
  name: string;
  detail: string;
  date: number;
  value: number;
  cerysCode?: number;
}

export interface ClientTBLineProps {
  clientCode: number;
  clientCodeName: string;
  cerysCode?: number;
  value: number;
  statement: string;
}

export interface ClientMapping {
  clientSoftware: string;
  clientCode: number;
  clientCodeName: string;
}

export interface CustomerProps {
  name: string;
  address: string;
  phone: string;
  email: string;
  username: string;
  password: string;
  licences: number;
  unusedLicences: number;
  users: ShortUser[];
  assignments: string[];
  clients: Client[];
  nonCorpClients: ExtendedIndividual[];
  individuals: ExtendedIndividual[];
  _id: string;
}

export interface CerysCodeClientMapping {
  cerysCode: number;
  currentClientMapping: ClientMapping;
  previousClientMappings: ClientMapping[];
}

export interface BaseIndividualProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  isClient?: boolean;
  clientCode?: string;
  uTR?: string;
  _clientDirectorships?: Directorship[];
  _clientShareholdings?: Shareholding[];
  otherDirectorships?: string[];
  otherShareholdings?: string[];
  _id?: string;
}

export interface ExtendedIndividual extends BaseIndividualProps {
  isDirector: boolean;
  dateAppointed?: string;
  dateCeased?: string;
  isShareholder: boolean;
}

export interface NewDirectorship {
  clientName: string;
  clientCode: string;
  dateAppointed: string;
  dateCeased: string;
}

export interface NewShareholdingProps {
  clientName: string;
  clientCode: string;
  clientId?: string;
  shareClassName: string;
  shareClassNumber: number;
  interest: number;
}

// export interface Shareholding {
//   clientId: string;
//   clientCode: string;
//   clientName: string;
//   shareClassId: string;
//   shareClassName: string;
//   shareClassNumber: number;
//   interest: number;
// }

export interface ClientProps {
  clientCode: string;
  clientName: string;
  companyNumber: string;
  incorpDate: string;
  accRefMonth: string;
  accRefDate: string;
  nominatedDay: number;
  _senior: string;
  _manager: string;
  _responsibleIndividual: string;
  clientSoftware: string;
  _id?: string;
  shareClasses: ShareClass[];
  directors: NewIndiAssociation[];
  shareholders: NewIndiAssociation[];
  newIndividuals: NewIndiAssociation[];
  existingIndividuals: NewIndiAssociation[];
  amortBasisGwill?: string;
  amortRateGwill?: string;
  amortBasisPatsLics?: string;
  amortRatePatsLics?: string;
  amortBasisDevCosts?: string;
  amortRateDevCosts?: string;
  amortBasisCompSware?: string;
  amortRateCompSware?: string;
  depnBasisFholdProp?: string;
  depnRateFholdProp?: string;
  depnBasisShortLhold?: string;
  depnRateShortLhold?: string;
  depnBasisLongLhold?: string;
  depnRateLongLhold?: string;
  depnBasisImprovements?: string;
  depnRateImprovements?: string;
  depnBasisPlantMachinery?: string;
  depnRatePlantMachinery?: string;
  depnBasisFixFittings?: string;
  depnRateFixFittings?: string;
  depnBasisMotorVehicles?: string;
  depnRateMotorVehicles?: string;
  depnBasisCompEquip?: string;
  depnRateCompEquip?: string;
  depnBasisOfficeEquip?: string;
  depnRateOfficeEquip?: string;
  depnBasisIPOwned?: string;
  depnRateIPOwned?: string;
  depnBasisIPLeased?: string;
  depnRateIPLeased?: string;
}

export interface ShareClassProps {
  shareClassNumber: number;
  shareClassName: string;
  numberIssued: number;
  valuePerShare: number;
  allocations?: { individualId: string; numberSubscribed: number }[];
}

export interface AddressObject {
  firstCol: number | null;
  lastCol: number | null;
  firstRow: number | null;
  lastRow: number | null;
}

export interface QuasiEventObjectProps {
  address: string;
  details: {
    valueBefore: string | number;
    valueAfter: string | number;
  };
  changeType: string;
  triggerSource: string;
}

export interface TranUpdatePrimaryValidation {
  changeRejected: boolean;
  isValid: boolean;
  isNotNegation: boolean;
  updated: boolean;
}

export interface TranUpdateFinalValidation {
  isNegation: boolean;
  isInvalid: boolean;
  isError: boolean;
}

export interface AutoFillObject {
  isAutoFill: boolean;
  firstCol: number;
  firstColLetter: string;
  lastCol: number;
  lastColLetter: string;
  firstRow: number;
  lastRow: number;
  autoFillCols: boolean;
  autoFillRows: boolean;
  repRange: string;
}

export interface ProxyWorksheet {
  name: string;
  ws: Excel.Worksheet;
}

export interface WorksheetDefaults {
  name: string;
  addListeners: [(context: Excel.RequestContext, session: Session) => void];
}

export interface ViewOptions {
  handleYes: () => void;
  handleNo: () => void;
  message: React.ReactNode;
  yesButtonText: string;
  noButtonText: string;
  registerType: RegisterType;
  nominalCode: string | number;
  nominalCodeName: string;
  wsName: string;
  cerysCode: number;
}

export interface RegisterType {
  initials: string;
  longLower: string;
  longCap: string;
  createRegister: (
    context: Excel.RequestContext,
    session: Session,
    relevantTrans: DetailedTransaction[]
  ) => Promise<void>;
}

export interface ClientSoftwareDefaultsProps {
  softwareName: string;
  PLReservesNominalCode: number;
}

export interface FSCategoryPL {
  statementName: string;
  statementNameTwo: string | null;
  categoryName: string;
  categoryShortName?: string;
  sum: boolean;
  total: boolean;
  mappable: boolean;
}

export interface FSCategoryBS extends FSCategoryPL {
  subTotalCol: boolean;
  subTotal: boolean;
  calculated: boolean;
  spaceBefore: boolean;
  spaceAfter: boolean;
}

export interface DrillableCollectionProps {
  collection: Transaction[];
  filter: () => Transaction[] | null;
  colNumbers: number[];
}

export interface MapTrackingProps {
  original: number;
  current: number;
}

export interface MappingObjectProps {
  columns: MapTrackingProps[];
  rows: MapTrackingProps[];
}

export interface AssetRegisterDb {
  customerId: string;
  clientId: string;
  assets: AssetDb[];
}

export interface AssetDb {
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
  activePeriods: string;
  periods: {
    reportingPeriodNumber: number;
    reportingPeriodId: string;
    subTransactions: AssetSubTransaction[];
  }[];
  _id: string;
}
