import { ClientCerysCodeObjectProps } from "../interfaces/interfaces";

export class ClientTrialBalanceLine {
  cerysCodeObj: ClientCerysCodeObjectProps;
  clientNominalCode: number;
  value: number;
  narrative: string;
  constructor(cerysCodeObj: ClientCerysCodeObjectProps, clientNominalCode: number, value: number, narrative: string) {
    this.cerysCodeObj = cerysCodeObj;
    this.clientNominalCode = clientNominalCode;
    this.value = value;
    this.narrative = narrative;
  }
}
