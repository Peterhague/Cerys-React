import { BaseIndividualProps, ClientTBLineProps } from "../interfaces/interfaces";
import { AssetRegister } from "./asset-register";
import { Assignment } from "./assignment";
import { ClientCerysCodeObject } from "./cerys-codes";
import { Client } from "./client";
import { ClientCodeObject } from "./client-codes";
import { ControlledWorksheet } from "./controlled-worksheet";
import { Customer } from "./customer";
import { EditableCell } from "./editable-cell";
import { EditableWorksheet } from "./editable-worksheet";
import { InTray, InTrayRouting, InTrayItem, InTrayAndItem } from "./in-trays/global";
import { BaseIndividual } from "./individuals";
import { Journal } from "./journal";
import { Transaction } from "./transaction";
import { ViewOptions } from "./view-options";
import { Worksheet } from "./worksheet";

export class Session {
  assignment: Assignment;
  chart: ClientCerysCodeObject[];
  clientChart: ClientCodeObject[];
  clientBFwdTB: ClientTBLineProps[];
  currentView: string = "";
  nextView: string = "";
  nextViewButOne: string = "";
  user: {};
  newUserAccount: {};
  customer: Customer;
  // activeJournal: {
  //   journals: Journal[];
  //   netValue: number;
  //   journalType: string;
  //   journal: boolean;
  //   clientTB: boolean;
  // } = {
  //   journals: [],
  //   netValue: 0,
  //   journalType: "journal",
  //   journal: true,
  //   clientTB: false,
  // };
  editableSheets: EditableWorksheet[] = [];
  controlledSheets: ControlledWorksheet[] = [];
  IFARegister: AssetRegister;
  IPRegister: AssetRegister;
  TFARegister: AssetRegister;
  handleView: (view: string) => void;
  handleDynamicView: (view: string, options: ViewOptions | InTray | InTrayItem | InTrayAndItem | InTrayRouting) => void;
  setEditButton: (editButtonStatus: string) => void;
  unmappedCodeObjects: ClientCodeObject[] = [];
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
  newClientPrelim: Client;
  newCorpClientShareholders: BaseIndividualProps[] = [];
  newIndiPrelim: BaseIndividual;
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
