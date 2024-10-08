import { fetchOptionsNC } from "../../fetching/generateOptions";
import { cerysCodeUrl, cerysObjectUrl } from "../../fetching/apiEndpoints";

// takes a Sage code and returns the corresponding Cerys nominal code object
export async function sageCodeToCerysObject(sageCode) {
  const codeOptions = fetchOptionsNC(sageCode);
  const codeReturned = await fetch(cerysCodeUrl, codeOptions);
  const cerysCode = await codeReturned.json();
  const objOptions = fetchOptionsNC(cerysCode);
  const objReturned = await fetch(cerysObjectUrl, objOptions);
  const cerysObject = await objReturned.json();
  return cerysObject;
}

// takes a Sage code and returns the corresponding Cerys nominal code
export async function sageCodeToCerysCode(sageCode) {
  const codeOptions = fetchOptionsNC(sageCode);
  const response = await fetch(cerysCodeUrl, codeOptions);
  const cerysCode = await response.json();
  return cerysCode;
}

// takes an array of Sage codes and returns an array of Cerys objects
export async function manySageCodeToCerysObject(sageCodes) {
  const arrayOfCerysObjs = [];
  for (let i = 0; i < sageCodes.length; i++) {
    await sageCodeToCerysObject(sageCodes[i]).then((res) => arrayOfCerysObjs.push(res));
  }
  return arrayOfCerysObjs;
}

// takes an array of Sage codes and returns an array of Cerys codes
export async function manySageCodeToCerysCode(sageCodes) {
  const arrayOfCerysCodes = [];
  for (let i = 0; i < sageCodes.length; i++) {
    await sageCodeToCerysCode(sageCodes[i]).then((res) => arrayOfCerysCodes.push(res));
  }
  return arrayOfCerysCodes;
}

// takes a Xero code and returns the corresponding Cerys nominal code object
export async function xeroCodeToCerysObject(xeroCode) {
  const codeOptions = fetchOptionsNC(xeroCode);
  const codeReturned = await fetch(cerysCodeUrl, codeOptions);
  const cerysCode = await codeReturned.json();
  const objOptions = fetchOptionsNC(cerysCode);
  const objReturned = await fetch(cerysObjectUrl, objOptions);
  const cerysObject = await objReturned.json();
  return cerysObject;
}

// takes a Xero code and returns the corresponding Cerys nominal code
export async function xeroCodeToCerysCode(xeroCode) {
  const codeOptions = fetchOptionsNC(xeroCode);
  const response = await fetch(cerysCodeUrl, codeOptions);
  const cerysCode = await response.json();
  return cerysCode;
}

// takes an array of Xero codes and returns an array of Cerys objects
export async function manyXeroCodeToCerysObject(xeroCodes) {
  const arrayOfCerysObjs = [];
  for (let i = 0; i < xeroCodes.length; i++) {
    await xeroCodeToCerysObject(xeroCodes[i]).then((res) => arrayOfCerysObjs.push(res));
  }
  return arrayOfCerysObjs;
}

// takes an array of Xero codes and returns an array of Cerys codes
export async function manyXeroCodeToCerysCode(xeroCodes) {
  const arrayOfCerysCodes = [];
  for (let i = 0; i < xeroCodes.length; i++) {
    await xeroCodeToCerysCode(xeroCodes[i]).then((res) => arrayOfCerysCodes.push(res));
  }
  return arrayOfCerysCodes;
}

// takes a Cerys code and returns a Cerys object
export async function cerysCodeToCerysObject(cerysCode) {
  const objOptions = fetchOptionsNC(cerysCode);
  const objReturned = await fetch(cerysObjectUrl, objOptions);
  const cerysObject = await objReturned.json();
  return cerysObject;
}

// takes a Cerys code and the Cerys NL object and returns an array with all the
// nominal activity.
export async function getCerysNomDetail(context, code, session) {
  const selection = [];
  session.activeAssignment.transactions.forEach((transaction) => {
    if (transaction.cerysCode === code) {
      selection.push(transaction);
    }
  });
  await context.sync();
  return selection;
}

//export async function getCerysNomDetailPL(category, activeAssignment) {
//  const detail = await Excel.run(async (context) => {
//    let cat = category;
//    if (category === "Turnover") {
//      cat = "Sales";
//    } else if (category === "Taxation on profit") {
//      cat = "Taxation";
//    } else if (category === "Interest receivable and other income") {
//      cat = "Interest receivable";
//    } else if (category === "Interest payable and similar expenses") {
//      cat = "Interest payable";
//    }
//    let selection;
//    activeAssignment.activeCategoriesDetails.forEach((obj) => {
//      if (obj.category === cat) {
//        selection = obj.codes;
//      }
//    });
//    let selectionArray = [];
//    selection.forEach((code) => {
//      let arr = [];
//      activeAssignment.transactions.forEach((transaction) => {
//        if (transaction.cerysCode === code) {
//          arr.push(transaction);
//        }
//      });
//      selectionArray.push(arr);
//    });

//    await context.sync();
//    return selectionArray;
//  });
//  return detail;
//}

export function getCerysNomDetailPL(category, activeAssignment) {
  let cat = category;
  if (category === "Turnover") {
    cat = "Sales";
  } else if (category === "Taxation on profit") {
    cat = "Taxation";
  } else if (category === "Interest receivable and other income") {
    cat = "Interest receivable";
  } else if (category === "Interest payable and similar expenses") {
    cat = "Interest payable";
  }
  let selection;
  activeAssignment.activeCategoriesDetails.forEach((obj) => {
    if (obj.cerysCategory === cat || obj.cerysCategory === category) {
      selection = obj.cerysCodes;
    }
  });
  let selectionArray = [];
  selection.forEach((code) => {
    let arr = [];
    activeAssignment.transactions.forEach((transaction) => {
      if (transaction.cerysCode === code) {
        arr.push(transaction);
      }
    });
    selectionArray.push(arr);
  });
  return selectionArray;
}

export async function getCerysNomDetailBS(context, category, activeAssignment) {
  let cat = category;
  if (category === "Cash at bank and in hand") {
    cat = "Cash";
  } else if (category === "Creditors due in < 1 year") {
    cat = "Creditors < 1 year";
  } else if (category === "Creditors due in > 1 year") {
    cat = "Creditors > 1 year";
  }
  let selection;
  activeAssignment.activeCategoriesDetails.forEach((obj) => {
      if (obj.cerysCategory === cat || obj.cerysCategory === category) {
      selection = obj.cerysCodes;
    }
  });
  let selectionArray = [];
  selection.forEach((code) => {
    let arr = [];
    activeAssignment.transactions.forEach((transaction) => {
      if (transaction.cerysCode === code) {
        arr.push(transaction);
      }
    });
    selectionArray.push(arr);
  });

  await context.sync();
  return selectionArray;
}
