import { NewShareholdingProps, ShareClass } from "../interfaces/interfaces";

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
