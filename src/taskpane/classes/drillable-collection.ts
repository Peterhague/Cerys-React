import { Session } from "./session";
import { ControlledInputMap, TransactionMap } from "./transaction-map";

// export class DrillableCollectionBase {
//   colNumbers: number[];
//   func: (session: Session, args2: unknown) => void;
//   constructor(colNumbers: number[], func: (session: Session, args2: unknown) => void) {
//     this.colNumbers = colNumbers;
//     this.func = func;
//   }
// }

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

// export class DrillableCollectionDynamic extends DrillableCollectionBase {
//   collectionAction: (session: Session) => unknown;
//   constructor(
//     collectionAction: (session: Session) => unknown,
//     colNumbers: number[],
//     func: (session: Session, args2: unknown) => void
//   ) {
//     super(colNumbers, func);
//     this.collectionAction = collectionAction;
//   }

//   getCollection(session: Session) {
//     this.collectionAction(session);
//   }

//   drillInto(session: Session) {
//     this.func(session, this.getCollection(session));
//   }
// }
