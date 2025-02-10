import { NewShareholdingProps, ShareClassProps } from "../interfaces/interfaces";
import { NewIndiAssociation } from "./individuals";

export class IndividualShareAllocation {
  shareClassNumber: number;
  shareClassName: string;
  indiAllocationLive: number;
  indiAllocationSubmitted: number;
  indiAllocationSuspended: number;
  constructor(shareClass: ShareClassProps) {
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

export class ShareClass {
  shareClassNumber: number;
  shareClassName: string;
  numberIssued: number;
  valuePerShare: number;
  allocations: { individualId: string; numberSubscribed: number }[];
  constructor(shareClass: ShareClassProps) {
    this.shareClassNumber = shareClass.shareClassNumber;
    this.shareClassName = shareClass.shareClassName;
    this.numberIssued = shareClass.numberIssued;
    this.valuePerShare = shareClass.valuePerShare;
    this.allocations = shareClass.allocations ? shareClass.allocations : [];
  }

  getAvailabletoAllocate(individual: NewIndiAssociation) {
    let total = 0;
    const allocatedToIndi = individual
      ? individual.potentialShareAllocations.find((i) => i.shareClassNumber === this.shareClassNumber)
          .indiAllocationSubmitted
      : 0;
    this.allocations.forEach((i) => (total += i.numberSubscribed));
    return this.numberIssued - total + allocatedToIndi;
  }

  getOtherAllocations(individual: NewIndiAssociation) {
    let total = 0;
    this.allocations.forEach((i) => {
      if (i.individualId !== individual.individualId || !individual) total += i.numberSubscribed;
    });
    return total;
  }
}
