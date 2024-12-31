import { TransactionUpdate } from "../classes/transaction-update";
/*global Excel */

export interface BaseCerysCodeObject {
  cerysCode: number;
  cerysName: string;
  cerysShortName: string;
  cerysExcelName: string;
  cerysCategory: string;
  cerysSubCategory: string | null;
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

export interface CerysCodeObject extends BaseCerysCodeObject {
  sageLine50Code: number;
  sageOneCode: number;
  xeroCode: number;
}

export interface ClientCerysCodeObject extends BaseCerysCodeObject {
  currentClientMapping: ClientMapping;
  previousClientMapping: ClientMapping[];
}

export interface ClientCodeObject {
  cerysCode: number;
  clientCode: number;
  clientCodeName: string;
  _id: string;
}

export interface Assignment {
  clientId: string;
  clientCode: string;
  clientName: string;
  reportingPeriod: ReportingPeriod;
  assignmentType: string;
  _junior: string;
  senior: ShortUser;
  manager: ShortUser;
  responsibleIndividual: ShortUser;
  clientSoftware: string;
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
  activeCategories: string[];
  activeCategoriesDetails: {
    cerysCategory: string;
    value: number;
    cerysCodes: number[];
  }[];
  activeAssetCodeTypes: string[];
  transactionBatches: number;
  finalised: boolean;
  _id: string;
  profit?: number;
  tbListenerAdded: boolean;
  pLListenerAdded: boolean;
  bSListenerAdded?: boolean;
  tCA: number;
  tCL: number;
  nonCA: number;
  nonCL: number;
  provisions: number;
  shareCapital: number;
  sharePremium: number;
  profLossRes: number;
  capRedRes: number;
  otherRes: number;
  fVRes: number;
  otherRes2: number;
  otherRes3: number;
  otherRes4: number;
  otherRes5: number;
  minorityInt: number;
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
  finalTB: TrialBalanceLine[];
  bFTB: TrialBalanceLine[];
  _id: string;
}

export interface TrialBalanceLine {
  cerysCategory: string;
  cerysCode: number;
  closeOffCode: number;
  cerysName: string;
  value: number;
  assetCodeType: string;
}

export interface ShortUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  _customer: string;
  _id: string;
}

export interface Transaction extends BaseCerysCodeObject {
  value: number;
  transactionType: string;
  transactionDate: Date | string;
  transactionDateExcel: number;
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
  _id: string;
}

export interface NewFATransaction extends Transaction {
  processedAsAsset: boolean;
}

export interface FATransaction extends Transaction {
  depnRate: string;
  amortRate: string;
}

export interface Journal {
  cerysCodeObj: BaseCerysCodeObject;
  transactionId?: string;
  value: number;
  transactionType: string;
  clientTB: boolean;
  journal: boolean;
  transactionDate: string | Date;
  transactionDateExcel: number;
  narrative: string;
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

export interface ClientMapping {
  clientSoftware: string;
  clientCode: string;
  clientCodeName: string;
}

export interface Customer {
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

export interface Client {
  clientCode: string;
  clientName: string;
  accRefDate: string;
  incorpDate: string;
  currentReportingPeriod: ReportingPeriod;
  previousReportingPeriods: ReportingPeriod[];
  companyNumber: string;
  _senior: string;
  _manager: string;
  _responsibleIndividual: string;
  clientSoftware: string;
  amortBasisGwill: string;
  amortBasisDevCosts: string;
  amortBasisCompSware: string;
  amortBasisPatsLics: string;
  amortRateGwill: string;
  amortRateDevCosts: string;
  amortRateCompSware: string;
  amortRatePatsLics: string;
  depnBasisCompEquip: string;
  depnBasisFholdProp: string;
  depnBasisFixFittings: string;
  depnBasisLongLhold: string;
  depnBasisImprovements: string;
  depnBasisMotorVehicles: string;
  depnBasisOfficeEquip: string;
  depnBasisPlantMachinery: string;
  depnBasisShortLhold: string;
  depnRateCompEquip: string;
  depnRateFholdProp: string;
  depnRateFixFittings: string;
  depnRateLongLhold: string;
  depnRateImprovements: string;
  depnRateMotorVehicles: string;
  depnRateOfficeEquip: string;
  depnRatePlantMachinery: string;
  depnRateShortLhold: string;
  depnBasisIPOwned: string;
  depnRateIPOwned: string;
  depnBasisIPLeased: string;
  depnRateIPLeased: string;
  shareClasses: {
    shareClassName: string;
    numberIssued: number;
    nomValue: number;
    reference: string;
    shareClassNumber: number;
    issuedNotAllocated: number;
  }[];
  directors: {
    firstName: string;
    lastName: string;
    email: string;
    isClient: boolean;
    dateAppointed: string;
    dateCeased: string;
    personId: string;
  }[];
  shareholders: [
    {
      firstName: string;
      lastName: string;
      personId: string;
      email: string;
      shareholdings: {
        numberSubscribed: number;
        shareClassId: string;
        shareClassName: string;
        shareClassNumber: number;
      }[];
    },
  ];
  IFARegisterCreated: {
    type: boolean;
  };
  TFARegisterCreated: {
    type: boolean;
  };
  clientChart: {
    clientCode: number;
    clientCodeName: string;
    cerysCode: number;
  }[];
  cerysChart: [ClientCerysCodeObject];
  _id: string;
}

export interface BaseIndividual {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  isClient?: boolean;
  clientCode?: string;
  _clientDirectorships?: Directorship[];
  _clientShareholdings?: Shareholding[];
  otherDirectorships?: string[];
  otherShareholdings?: string[];
  _id?: string;
}

export interface ExtendedIndividual extends BaseIndividual {
  uTR: string;
  isDirector: boolean;
  dateAppointed?: string;
  dateCeased?: string;
  isShareholder: boolean;
}

export interface Directorship {
  clientId: string;
  clientName: string;
  clientCode: string;
  dateAppointed: string;
  dateCeased: string;
}

export interface Shareholding {
  clientId: string;
  clientCode: string;
  clientName: string;
  shareClassId: string;
  shareClassName: string;
  shareClassNumber: number;
  interest: number;
}

export interface NewPreliminaryClient {
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
  directors: {}[];
  shareholders: {}[];
  newIndividuals: BaseIndividual[];
  existingIndividuals: BaseIndividual[];
}

export interface ShareClass {
  shareClassNumber: number;
  shareClassName: string;
  numberIssued: number;
  issuedNotAllocated: number;
  prelimAllocation: number;
}

export interface AddressObject {
  firstCol: number;
  lastCol: number;
  firstRow: number;
  lastRow: number;
}

export interface QuasiEventObject {
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
  firstColLetter: string;
  firstColNumber: number;
  lastColLetter: string;
  lastColNumber: number;
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
