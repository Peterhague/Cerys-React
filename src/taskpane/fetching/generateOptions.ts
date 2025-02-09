// takes a variable and returns it embedded in a valid fetch options

import { Assignment, PreliminaryAssignment } from "../classes/assignment";
import { Client } from "../classes/client";
import { ClientCodeObject } from "../classes/client-codes";
import { BaseIndividual } from "../classes/individuals";
import { ActiveJournal } from "../classes/journal";
import { Session } from "../classes/session";
import { AssetTransaction, Transaction } from "../classes/transaction";
import { ClientCerysCodeObjectProps, ClientTBLineProps, ClientTransaction } from "../interfaces/interfaces";
import { getUpdatedTransactions } from "../utils/helper-functions";

export function fetchOptionsTransBatch(
  session: Session,
  activeJournal: ActiveJournal,
  transDtls: { customerId: string; assignmentId: string }
) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      journals: activeJournal.journalsForDb,
      customerId: transDtls.customerId,
      assignmentId: transDtls.assignmentId,
      transactionType: activeJournal.type,
      chart: session.chart,
      clientSoftware: session.assignment.clientSoftwareDefaults.softwareName,
    }),
  };
}

export function fetchOptionsPostClientTB(session: Session, clientTB: ClientTBLineProps[]) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      assignmentId: session.assignment._id,
      clientTB,
    }),
  };
}

export function fetchOptionsTransBatchUpdate(session: Session) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      updatedTransactions: getUpdatedTransactions(session),
      customerId: session.customer._id,
      assignmentId: session.assignment._id,
      clientSoftware: session.assignment.clientSoftwareDefaults.softwareName,
      clientChart: session.clientChart,
      chart: session.chart,
    }),
  };
}

// called by the choosePlan fn in sign-up.js as one of the final steps in the customer registration
// process. Returns an "options" object to be passed to a fetch fn to register the new customer in
// mongoDB.
export function fetchOptionsSignUp(customerObject) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: customerObject.orgName,
      address: customerObject.orgAddress,
      phone: customerObject.orgPhone,
      email: customerObject.email,
      password: customerObject.password,
      licences: customerObject.licences,
    }),
  };
}

// called by registerUser fn in user-registration.js. Returns two objects; a post to be passed to the
// fetch which registers a user with MongoDB, and a put to update the connected customer document.
export function fetchOptionsAddUser(newUser: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isAdmin: boolean;
  customerId: string;
}) {
  return {
    post: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        password: newUser.password,
        customerId: newUser.customerId,
      }),
    },
    put: {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        password: newUser.password,
        customerId: newUser.customerId,
      }),
    },
  };
}

export function fetchOptionsAddClient(client: Client, customerId: string) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client,
      customerId,
    }),
  };
}

export function fetchOptionsUpdateClientChart(newCodes: ClientCodeObject[], session: Session) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      newCodes,
      customerId: session.customer._id,
      clientId: session.assignment.clientId,
    }),
  };
}

// called by login fn (authentication.js) to get user from DB based on the email and password
// supplied to the user login form.
export function fetchOptionsGetUser(dataObject: { email: string; password: string }) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: dataObject.email,
      password: dataObject.password,
    }),
  };
}

export function fetchOptionsGetCustomer(customer: { email: string; password: string }) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: customer.email,
      password: customer.password,
    }),
  };
}

export function fetchOptionsNewAssignment(prelimAssignment: PreliminaryAssignment, customerId: string) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prelimAssignment,
      customerId,
    }),
  };
}

export function fetchOptionsNewIndi(indi: BaseIndividual, customerId: string) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      firstName: indi.firstName,
      lastName: indi.lastName,
      email: indi.email,
      phone: indi.phone,
      address: indi.address,
      isClient: indi.isClient,
      clientCode: indi.clientCode,
      _clientDirectorships: indi._clientDirectorships,
      _clientShareholdings: indi._clientShareholdings,
      uTR: indi.uTR,
      customerId,
    }),
  };
}

export function fetchOptionsUpdateAssignment(customerId: string, workbookId: string, target: string) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      target: target,
      workbookId: workbookId,
      customerId: customerId,
    }),
  };
}

export function fetchOptionsFinaliseAssignment(
  assignment: Assignment,
  customerId: string,
  finalClientTB: ClientTBLineProps[]
) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      assignment,
      workbookId: assignment._id,
      customerId,
      clientId: assignment.clientId,
      finalClientTB,
    }),
  };
}

export function fetchOptionsPostClientNL(clientNL: ClientTransaction[], workbookId: string, customerId: string) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clientNL,
      workbookId,
      customerId,
    }),
  };
}

export function fetchOptionsIFA(session: Session, relevantTrans: AssetTransaction[]) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      assets: relevantTrans.map((tran) => tran.getCombinedTranAndCerysCodeObj(session)),
      customerId: session.customer._id,
      workbookId: session.assignment._id,
      clientId: session.assignment.clientId,
    }),
  };
}

export function fetchOptionsTFA(session: Session, relevantTrans: AssetTransaction[]) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      assets: relevantTrans.map((tran) => tran.getCombinedTranAndCerysCodeObj(session)),
      customerId: session.customer._id,
      workbookId: session.assignment._id,
      clientId: session.assignment.clientId,
    }),
  };
}

export function fetchOptionsIP(session: Session, relevantTrans: AssetTransaction[]) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      assets: relevantTrans.map((tran) => tran.getCombinedTranAndCerysCodeObj(session)),
      customerId: session.customer._id,
      workbookId: session.assignment._id,
      clientId: session.assignment.clientId,
    }),
  };
}

export function fetchOptionsIFARStatusUpdate(workbookId: string) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      workbookId,
    }),
  };
}

export function fetchOptionsTFARStatusUpdate(workbookId: string) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      workbookId,
    }),
  };
}

export function fetchOptionsIPRStatusUpdate(workbookId: string) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      workbookId,
    }),
  };
}

export function fetchOptionsUpdateCerysCodeMapping(
  session: Session,
  nominalCode: string | number,
  nominalCodeName: string,
  cerysCodeObj: ClientCerysCodeObjectProps
) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customerId: session.customer._id,
      clientId: session.assignment.clientId,
      clientSoftware: session.assignment.clientSoftwareDefaults.softwareName,
      clientCode: nominalCode,
      clientCodeName: nominalCodeName,
      cerysCodeObj,
      workbookId: session.assignment._id,
    }),
  };
}

export const fetchOptionsReverseCustomMapping = (session: Session, transactions: Transaction[]) => {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      assignmentId: session.assignment._id,
      transactions,
    }),
  };
};
