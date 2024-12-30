import {
  Assignment,
  CerysCodeObject,
  ClientCodeObject,
  Customer,
  NewPreliminaryClient,
  Transaction,
} from "../interfaces/interfaces";
import { EditableCell } from "./editable-cell";
import { EditableWorksheet } from "./editable-worksheet";
import { Worksheet } from "./worksheet";

export class Session {
  activeAssignment: Assignment;
  chart: CerysCodeObject[];
  clientChart: ClientCodeObject[];
  currentView: string = "";
  nextView: string = "";
  nextViewButOne: string = "";
  user: {};
  newUserAccount: {};
  customer: Customer;
  activeJournal: {
    journals: Transaction[];
    netValue: number;
    journalType: string;
    journal: Boolean;
    clientTB: Boolean;
  } = {
    journals: [],
    netValue: 0,
    journalType: "journal",
    journal: true,
    clientTB: false,
  };
  newFATransactions: [] = [];
  editableSheets: EditableWorksheet[] = [];
  IFARegister: [] = [];
  TFARegister: [] = [];
  handleView: (view: string) => void;
  handleDynamicView: () => void;
  setEditButton: (editButtonStatus: string) => void;
  unmappedCodeObjects: [] = [];
  arrowIndex: number = -1;
  activeEditableCell: EditableCell;
  options: {
    IFARCreationSetting: string;
    TFARCreationSetting: string;
    IPRCreationSetting: string;
    autoFillOverride: Boolean;
    updatedTransactions: [];
    allowEffects: number;
    ignoreWsAddition: number;
  } = {
    IFARCreationSetting: "main",
    TFARCreationSetting: "main",
    IPRCreationSetting: "main",
    autoFillOverride: false,
    updatedTransactions: [],
    allowEffects: 0,
    ignoreWsAddition: 0,
  };
  worksheets: Worksheet[] = [];
  newClientPrelim: NewPreliminaryClient;
  newIndiPrelim: { isClient: Boolean; _clientDirectorships: {}[] };
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
  IPTransactions: [];
  TFATransactions: [];
}
