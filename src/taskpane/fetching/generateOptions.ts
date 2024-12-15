// takes a variable and returns it embedded in a valid fetch options
// object as the req.body.code value. Designed for looking up Cerys nominal codes.
export function fetchOptionsNC(nominalCode) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code: nominalCode,
    }),
  };
}

export function fetchOptionsTransBatch(session, journals, transDtls) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      journals,
      customerId: transDtls.customerId,
      assignmentId: transDtls.assignmentId,
      transactionType: session.activeJournal.journalType,
      chart: session.chart,
      clientSoftware: session.activeAssignment.clientSoftware,
    }),
  };
}

export function fetchOptionsTransBatchUpdate(session) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      updatedTransactions: session.updatedTransactions,
      customerId: session.customer._id,
      assignmentId: session.activeAssignment._id,
      clientSoftware: session.activeAssignment.clientSoftware,
      clientChart: session.clientChart,
    }),
  };
}

export function fetchOptionsGetAssignmentId(workbookMeta) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      workbookMeta: workbookMeta,
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
export function fetchOptionsAddUser(newUser) {
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

export function fetchOptionsAddClient(client, customer) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client,
      customerId: customer,
    }),
  };
}

export function fetchOptionsUpdateClientChart(newCodes, session) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      newCodes,
      customerId: session.customer._id,
      clientId: session.activeAssignment.clientId,
    }),
  };
}

export function fetchOptionsUpdateClientPrelim(update, customer) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      directors: update._clientDirectorships,
      shareholders: update._clientShareholdings,
      customerId: customer,
      clientId: update.clientId,
    }),
  };
}

export function fetchOptionsUpdateClientAmort(amortPols, customer, client) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amortBasisCompSware: amortPols.amortBasisCompSware,
      amortBasisDevCosts: amortPols.amortBasisDevCosts,
      amortBasisGwill: amortPols.amortBasisGwill,
      amortBasisPatsLics: amortPols.amortBasisPatsLics,
      amortRateCompSware: amortPols.amortRateCompSware,
      amortRateDevCosts: amortPols.amortRateDevCosts,
      amortRateGwill: amortPols.amortRateGwill,
      amortRatePatsLics: amortPols.amortRatePatsLics,
      customerId: customer,
      clientId: client,
    }),
  };
}

export function fetchOptionsUpdateClientDepn(depnPols, customer, client) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      depnBasisCompEquip: depnPols.depnBasisCompEquip,
      depnBasisFHProp: depnPols.depnBasisFHProp,
      depnBasisFixFit: depnPols.depnBasisFixFit,
      depnBasisLongLH: depnPols.depnBasisLongLH,
      depnBasisMV: depnPols.depnBasisMV,
      depnBasisOfficeEquip: depnPols.depnBasisOfficeEquip,
      depnBasisPlant: depnPols.depnBasisPlant,
      depnBasisShortLH: depnPols.depnBasisShortLH,
      depnRateCompEquip: depnPols.depnRateCompEquip,
      depnRateFHProp: depnPols.depnRateFHProp,
      depnRateFixFit: depnPols.depnRateFixFit,
      depnRateLongLH: depnPols.depnRateLongLH,
      depnRateMV: depnPols.depnRateMV,
      depnRateOfficeEquip: depnPols.depnRateOfficeEquip,
      depnRatePlant: depnPols.depnRatePlant,
      depnRateShortLH: depnPols.depnRateShortLH,
      customerId: customer,
      clientId: client,
    }),
  };
}

export function fetchOptionsUpdateClientForId(person, customerId, clientId) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      person,
      customerId,
      clientId,
    }),
  };
}

export function fetchOptionsClientAddPerson(fetcher) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customerId: fetcher.customerId,
      clientId: fetcher.clientId,
      directors: fetcher.directors,
      shareholders: fetcher.shareholders,
    }),
  };
}

// called by login fn (authentication.js) to get user from DB based on the email and password
// supplied to the user login form.
export function fetchOptionsGetUser(dataObject) {
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

export function fetchOptionsGetPerson(personId) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personId,
    }),
  };
}

export function fetchOptionsGetCustomer(customer) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: customer.email,
      password: customer.password,
      id: customer.id,
    }),
  };
}

export function fetchOptionsGetCustomerUsers(customer) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customerId: customer,
    }),
  };
}

export function fetchOptionsGetCustomerClients(customer) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customerId: customer,
    }),
  };
}

export function fetchOptionsNewAssignment(prelimAssignment, customerId) {
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

export function fetchOptionsIterateAssignment(actAss, customerId) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      actAss,
      customerId,
    }),
  };
}

export function fetchOptionsNewPerson(person) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      phone: person.phone,
      address: person.address,
      isClient: person.isClient,
      _clientDirectorships: person.clientDirectorships,
      _clientShareholdings: person.clientShareholdings,
      uTR: person.uTR,
    }),
  };
}

export function fetchOptionsNewIndi(indi, customerId) {
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

export function fetchOptionsUpdateAssignment(customerId, workbookId, target) {
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

export function fetchOptionsFinaliseAssignment(activeAssignment, customerId) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      activeAssignment,
      workbookId: activeAssignment._id,
      customerId,
      clientId: activeAssignment.clientId,
    }),
  };
}

export function fetchOptionsTBModify(cerysObject) {
  return {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code: cerysObject.cerysCode,
      value: cerysObject.value,
    }),
  };
}

export function fetchOptionsPostClientNL(clientNL, workbookId, customerId) {
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

export function fetchOptionsIFA(session) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      assets: session.IFATransactions,
      customerId: session.customer._id,
      workbookId: session.activeAssignment._id,
      clientId: session.activeAssignment.clientId,
    }),
  };
}

export function fetchOptionsTFA(session) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      assets: session.TFATransactions,
      customerId: session.customer._id,
      workbookId: session.activeAssignment._id,
      clientId: session.activeAssignment.clientId,
    }),
  };
}

export function fetchOptionsIP(session) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      assets: session.IPTransactions,
      customerId: session.customer._id,
      workbookId: session.activeAssignment._id,
    }),
  };
}

export function fetchOptionsIFARStatusUpdate(workbookId) {
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

export function fetchOptionsTFARStatusUpdate(workbookId) {
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

export function fetchOptionsIPRStatusUpdate(workbookId) {
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

export function fetchOptionsUpdateCerysCodeMapping(session, nominalCode, nominalCodeName, cerysCode) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customerId: session.customer._id,
      clientId: session.activeAssignment.clientId,
      clientSoftware: session.activeAssignment.clientSoftware,
      clientCode: nominalCode,
      clientCodeName: nominalCodeName,
      cerysCode,
    }),
  };
}
