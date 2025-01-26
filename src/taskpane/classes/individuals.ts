import {
  BaseIndividualProps,
  ExtendedIndividual,
  NewDirectorship,
  NewShareholdingProps,
} from "../interfaces/interfaces";
import { Session } from "./session";
import { IndividualShareAllocation, NewShareholding } from "./share-classes";

export class BaseIndividual {
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
  constructor(individual: BaseIndividualProps) {
    this.firstName = individual ? individual.firstName : undefined;
    this.lastName = individual ? individual.lastName : undefined;
    this.email = individual ? individual.email : undefined;
    this.phone = individual ? individual.phone : undefined;
    this.address = individual ? individual.address : undefined;
    this.isClient = individual ? individual.isClient : undefined;
    this.clientCode = individual ? individual.clientCode : undefined;
    this.uTR = individual ? individual.uTR : undefined;
    this._clientDirectorships = individual && individual._clientDirectorships ? individual._clientDirectorships : [];
    this._clientShareholdings = individual && individual._clientShareholdings ? individual._clientShareholdings : [];
    this.otherDirectorships = individual && individual.otherDirectorships ? individual.otherDirectorships : [];
    this.otherShareholdings = individual && individual.otherShareholdings ? individual.otherShareholdings : [];
    this._id = individual ? individual._id : undefined;
  }
}

export class NewIndiAssociation {
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
  newClientDirectorships: NewDirectorship[];
  newClientShareholdings: NewShareholding[];
  shareholdings?: NewShareholdingProps[];
  uTR: string;
  isDirector: boolean;
  dateAppointed?: string;
  dateCeased?: string;
  isShareholder: boolean;
  potentialShareAllocations: IndividualShareAllocation[];
  associationType: "existingIndividuals" | "newIndividuals";
  preliminaryId?: string;
  _id?: string;
  constructor(individual: ExtendedIndividual) {
    console.log(individual);
    this.firstName = individual ? individual.firstName : "";
    this.lastName = individual ? individual.lastName : "";
    this.email = individual ? individual.email : "";
    this.phone = individual ? individual.phone : "";
    this.address = individual ? individual.address : "";
    this.isClient = individual ? individual.isClient : false;
    this.isDirector = individual ? individual.isDirector : false;
    this.isShareholder = individual ? individual.isShareholder : false;
    this._clientDirectorships = individual ? individual._clientDirectorships : [];
    this._clientShareholdings = individual ? individual._clientShareholdings : [];
    this.otherDirectorships = individual ? individual.otherDirectorships : [];
    this.otherShareholdings = individual ? individual.otherShareholdings : [];
    this.newClientDirectorships = [];
    this.newClientShareholdings = [];
    this.uTR = individual ? individual.uTR : "";
    this.potentialShareAllocations = [];
    this.associationType = individual ? "existingIndividuals" : "newIndividuals";
    this.preliminaryId = "";
    this._id = individual && individual._id ? individual._id : Math.floor(Math.random() * 10000000).toString();
  }
}

export class Directorship {
  clientId: string;
  clientName: string;
  clientCode: string;
  dateAppointed: string;
  dateCeased: string;
  constructor(clientId: string, dateAppointed: string, dateCeased: string, session: Session) {
    const client = session.customer.clients.find((i) => i._id === clientId);
    this.clientId = clientId;
    this.clientName = client.clientName;
    this.clientCode = client.clientCode;
    this.dateAppointed = dateAppointed;
    this.dateCeased = dateCeased;
  }
}

export class Shareholding {
  clientId: string;
  clientCode: string;
  clientName: string;
  shareClassId: string;
  shareClassName: string;
  shareClassNumber: number;
  interest: number;
  constructor() {}
}
