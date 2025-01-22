import { ShareClass } from "../interfaces/interfaces";

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
