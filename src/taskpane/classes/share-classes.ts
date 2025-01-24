import { NewShareholdingProps, ShareClass } from "../interfaces/interfaces";
import { NewIndividual } from "./new-individual";

export class IndividualShareAllocation {
  shareClassNumber: number;
  shareClassName: string;
  indiAllocationLive: number;
  indiAllocationSubmitted: number;
  indiAllocationSuspended: number;
  constructor(shareClass: ShareClass) {
    this.shareClassNumber = shareClass.shareClassNumber;
    this.shareClassName = shareClass.shareClassName;
    this.indiAllocationLive = 0;
    this.indiAllocationSubmitted = 0;
    this.indiAllocationSuspended = 0;
  }
}

export class NewShareholding {
  clientName: string;
  clientCode: string;
  clientId?: string;
  shareClassName: string;
  shareClassNumber: number;
  interest: number;
  constructor(allocation: NewShareholdingProps) {
    this.clientName = allocation.clientName;
    this.clientCode = allocation.clientCode;
    this.clientId = allocation.clientId;
    this.shareClassName = allocation.shareClassName;
    this.shareClassNumber = allocation.shareClassNumber;
    this.interest = allocation.interest;
  }
}

export class PreliminaryShareClass {
  shareClassNumber: number;
  shareClassName: string;
  numberIssued: number;
  //issuedNotAllocated: number;
  allocations: { individualId: string; numberSubscribed: number }[];
  //prelimAllocation: number;
  constructor(shareClass: ShareClass) {
    this.shareClassNumber = shareClass.shareClassNumber;
    this.shareClassName = shareClass.shareClassName;
    this.numberIssued = shareClass.numberIssued;
    //this.issuedNotAllocated = shareClass.numberIssued;
    this.allocations = [];
    //this.prelimAllocation = 0;
  }

  getAvailabletoAllocate(individual: NewIndividual) {
    let total = 0;
    const allocatedToIndi = individual
      ? individual.potentialShareAllocations.find((i) => i.shareClassNumber === this.shareClassNumber)
          .indiAllocationSubmitted
      : 0;
    this.allocations.forEach((i) => (total += i.numberSubscribed));
    return this.numberIssued - total + allocatedToIndi;
  }

  getOtherAllocations(individual: NewIndividual) {
    let total = 0;
    this.allocations.forEach((i) => {
      if (i.individualId !== individual._id || !individual) total += i.numberSubscribed;
    });
    return total;
  }
}
