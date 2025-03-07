import { Session } from "./session";
import { ControlledInputMap, TransactionMap } from "./transaction-map";

export class DrillableCollection {
  colNumbers: number[];
  func: (session: Session, args2: unknown) => void;
  collectionInstructions: {
    getter: (...params: unknown[]) => unknown;
    getterParams: unknown[];
    getterParamsMapTarget: string;
  };
  constructor(
    collectionInstructions: {
      getter: (...params: unknown[]) => unknown;
      getterParams: unknown[];
      getterParamsMapTarget: string;
    },
    colNumbers: number[],
    func: (session: Session, args2: unknown) => void
  ) {
    this.colNumbers = colNumbers;
    this.func = func;
    this.collectionInstructions = collectionInstructions;
  }

  drillInto(session: Session, map: ControlledInputMap | TransactionMap) {
    const params = [...this.collectionInstructions.getterParams];
    if (this.collectionInstructions.getterParamsMapTarget) {
      if (this.collectionInstructions.getterParamsMapTarget === "itself") {
        params.push(map.controlledInput);
      } else {
        params.push(map.controlledInput[this.collectionInstructions.getterParamsMapTarget]);
      }
    }
    const collection = this.collectionInstructions.getter(...params);
    this.func(session, collection);
  }
}
