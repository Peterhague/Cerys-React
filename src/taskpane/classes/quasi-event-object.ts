import { QuasiEventObjectProps } from "../interfaces/interfaces";

export class QuasiEventObject implements QuasiEventObjectProps {
  address: string;
  details: {
    valueBefore: string | number;
    valueAfter: string | number;
  };
  changeType: string;
  triggerSource: string;
  constructor(event: QuasiEventObjectProps) {
    this.address = event.address;
    this.details = event.details;
    this.changeType = event.changeType;
    this.triggerSource = event.triggerSource;
  }
}
