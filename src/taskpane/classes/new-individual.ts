import {
  Directorship,
  ExtendedIndividual,
  NewDirectorship,
  NewShareholding,
  Shareholding,
} from "../interfaces/interfaces";
import { IndividualShareAllocation } from "./share-classes";

export class NewIndividual {
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
  newClientDirectorships?: NewDirectorship[];
  newClientShareholdings?: NewShareholding[];
  shareholdings?: NewShareholding[];
  uTR: string;
  isDirector: boolean;
  dateAppointed?: string;
  dateCeased?: string;
  isShareholder: boolean;
  potentialShareAllocations: IndividualShareAllocation[];
  _id?: string;
  constructor(individual: ExtendedIndividual) {
    this.firstName = individual.firstName;
    this.lastName = individual.lastName;
    this.email = individual.email;
    this.phone = individual.phone;
    this.address = individual.address;
    this.isClient = individual.isClient;
    this.isDirector = individual.isDirector;
    this.isShareholder = individual.isShareholder;
    this._clientDirectorships = individual._clientDirectorships;
    this._clientShareholdings = individual._clientShareholdings;
    this.otherDirectorships = individual.otherDirectorships;
    this.otherShareholdings = individual.otherShareholdings;
    this.uTR = individual.uTR;
    this._id = individual._id;
    this.potentialShareAllocations = [];
  }
}
