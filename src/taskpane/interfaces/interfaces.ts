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
  clientAdj: Boolean;
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
  responsibleIndividual: ShortUser;
  clientSoftware: string;
  workbookId: string;
  transactions: Transaction[];
  clientNL: ClientTransaction[];
  assignmentStatus: string;
  dateStarted: string;
  dateFinished: string;
  TBInitiated: Boolean;
  TBEntered: Boolean;
  transactionsPosted: Boolean;
  NLEntered: Boolean;
  templatesAmended: Boolean;
  IFARegisterCreated: Boolean;
  TFARegisterCreated: Boolean;
  IPRegisterCreated: Boolean;
  tb: TrialBalanceLine[];
  activeCategories: string[];
  activeCategoriesDetails: {
    cerysCategory: string;
    value: number;
    cerysCodes: number[];
  }[];
  activeAssetCodeTypes: string[];
  transactionBatches: number;
  finalised: Boolean;
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
}

export interface Transaction {
  cerysCode: number;
  closeOffCode: number;
  cerysCategory: string;
  cerysSubCategory: string;
  assetSubCatCode: number;
  assetSubCategory: string;
  assetCategory: string;
  assetCategoryNo: number;
  assetCodeType: string;
  assetNarrative: string;
  cerysName: string;
  cerysShortName: string;
  cerysExcelName: string;
  clientAdj: Boolean;
  value: number;
  transactionType: string;
  defaultSign: string;
  regColNameOne: string;
  regColNameTwo: string;
  transactionDate: string;
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
  clientTB: Boolean;
  clientNominalCode: number;
  clientNominalName: string;
  clientAdjustment: Boolean;
  journal: Boolean;
  reviewJournal: Boolean;
  finalJournal: Boolean;
  workbookRef: string;
  worksheetRef: string;
  dateCreated: string;
  defaultClientMapping: ClientMapping;
  activeClientMapping: ClientMapping;
  updates: {
    worksheetName: string;
    worksheetId: string;
    type: string;
    value: string | number;
    mongoDate: string | null;
  }[];
}

export interface ClientTransaction {
  code: number;
  number: number;
  name: string;
  detail: string;
  date: number;
  value: number;
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
  nonCorpClients: NonCorpClient[];
  individuals: BaseIndividual[];
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
    isClient: Boolean;
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
    type: Boolean;
  };
  TFARegisterCreated: {
    type: Boolean;
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
  isClient: Boolean;
  clientCode: string;
  _clientDirectorships: Directorship[];
  _clientShareholdings: Shareholding[];
  otherDirectorships: string[];
  otherShareholdings: string[];
}

export interface NonCorpClient extends BaseIndividual {
  uTR: string;
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
