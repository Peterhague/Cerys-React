import { CustomerProps, ExtendedIndividual, ShortUser } from "../interfaces/interfaces";
import { Client } from "./client";

export class Customer implements CustomerProps {
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
  customerId: string;
  _id?: string;
  constructor(customer: CustomerProps) {
    console.log(customer);
    this.name = customer.name;
    this.address = customer.address;
    this.phone = customer.phone;
    this.email = customer.email;
    this.username = customer.username;
    this.password = customer.password;
    this.licences = customer.licences;
    this.unusedLicences = customer.unusedLicences;
    this.users = customer.users;
    this.assignments = customer.assignments;
    this.clients = customer.clients.map((i) => new Client(i));
    this.nonCorpClients = customer.nonCorpClients;
    this.individuals = customer.individuals;
    this.customerId = customer._id;
  }

  revertToDbIdNotation() {
    const reversion: Customer = { ...this, _id: this.customerId };
    return reversion;
  }
}
