import { ClientCerysCodeObject } from "../interfaces/interfaces";

export class ClientTrialBalanceLine {
  cerysCodeObj: ClientCerysCodeObject;
  clientNominalCode: number;
  value: number;
  narrative: string;
  constructor(cerysCodeObj: ClientCerysCodeObject, clientNominalCode: number, value: number, narrative: string) {
    this.cerysCodeObj = cerysCodeObj;
    this.clientNominalCode = clientNominalCode;
    this.value = value;
    this.narrative = narrative;
  }
}
