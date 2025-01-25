import { BaseIndividualProps, ClientCerysCodeObject, ClientCodeObject, Customer } from "../interfaces/interfaces";
import { Assignment } from "./assignment";
import { PreliminaryClient } from "./client";
import { ControlledWorksheet } from "./controlled-worksheet";
import { EditableCell } from "./editable-cell";
import { EditableWorksheet } from "./editable-worksheet";
import { Journal } from "./journal";
import { Transaction } from "./transaction";
import { Worksheet } from "./worksheet";

export class Session {
  assignment: Assignment;
  chart: ClientCerysCodeObject[];
  clientChart: ClientCodeObject[];
  currentView: string = "";
  nextView: string = "";
  nextViewButOne: string = "";
  user: {};
  newUserAccount: {};
  customer: Customer;
  activeJournal: {
    journals: Journal[];
    netValue: number;
    journalType: string;
    journal: boolean;
    clientTB: boolean;
  } = {
    journals: [],
    netValue: 0,
    journalType: "journal",
    journal: true,
    clientTB: false,
  };
  editableSheets: EditableWorksheet[] = [];
  controlledSheets: ControlledWorksheet[] = [];
  IFARegister: { assetCategory: string; assetCategoryNo: number }[];
  IPRegister: { assetCategory: string; assetCategoryNo: number }[];
  TFARegister: { assetCategory: string; assetCategoryNo: number }[];
  handleView: (view: string) => void;
  handleDynamicView: (view: string, options: { handleYes: () => void; handleNo: () => void }) => void;
  setEditButton: (editButtonStatus: string) => void;
  unmappedCodeObjects: {
    clientCode: number;
    clientCodeName: string;
    cerysCode: number;
    cerysShortName: string;
  }[] = [];
  arrowIndex: number = -1;
  activeEditableCell: EditableCell;
  options: {
    IFARCreationSetting: string;
    TFARCreationSetting: string;
    IPRCreationSetting: string;
    autoFillOverride: Boolean;
    updatedTransactions: Transaction[];
    allowEffects: number;
    ignoreWsAddition: number;
    listeningForDoubleClick: boolean;
  } = {
    IFARCreationSetting: "main",
    TFARCreationSetting: "main",
    IPRCreationSetting: "main",
    autoFillOverride: false,
    updatedTransactions: [],
    allowEffects: 0,
    ignoreWsAddition: 0,
    listeningForDoubleClick: false,
  };
  worksheets: Worksheet[] = [];
  newClientPrelim: PreliminaryClient;
  newCorpClientShareholders: BaseIndividualProps[] = [];
  newIndiPrelim: {
    firstName: string;
    lastName: string;
    isClient: Boolean;
    _clientDirectorships: {}[];
    _clientShareholdings: { shareClassId: string; interest: number }[];
  };
  newCustDtlsOne: { email: string; password: string; confirmPassword: string };
  newCustDtlsTwo: {};
  newCorpClientDirectors: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    uTR: string;
  }[];
  IFATransactions: [];
  IPTransactions: { assetCategory: string; assetCategoryNo: number }[];
  TFATransactions: [];
}
