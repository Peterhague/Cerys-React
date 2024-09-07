import { updateNomCode } from "../helperFunctions";
import { addWorksheet } from "../worksheet";

export function createRelTransIP(session) {
  const relevantTrans = [];
  session.activeAssignment.transactions.forEach((tran) => {
    if (tran.cerysCategory === "Investment property") {
      relevantTrans.push(tran);
    }
  });
  createIPTransSumm(session, relevantTrans);
}

export async function createIPTransSumm(session, relevantTrans) {
  try {
    await Excel.run(async (context) => {
      const ws = addWorksheet(context, "IP Transactions");
      //let activeClient;
      // this should run when session.activeAssignment is defined
      //session.customer.clients.forEach((client) => {
      //  if (client._id === session.activeAssignment.clientId) {
      //    activeClient = client;
      //  }
      //});
      const bodyContent = [];
      let transToPost = [];
      relevantTrans.forEach((i) => {
        if (i.clientTB) {
          const trans = {};
          session.activeAssignment.clientNL.forEach((tran) => {
            if (tran.code === i.clientNominalCode) {
              trans["cerysCategory"] = i.cerysCategory;
              //trans.assetCategory = i.assetCategory;
              //trans.assetCategoryNo = i.assetCategoryNo;
              trans["cerysName"] = i.cerysName;
              trans["cerysCode"] = i.cerysCode;
              trans["cerysShortName"] = i.cerysShortName;
              trans["clientAdjustment"] = i.clientAdjustment;
              trans["clientTB"] = i.clientTB;
              trans["clientNominalCode"] = i.clientNominalCode;
              trans["narrative"] = i.narrative;
              trans["transactionType"] = i.transactionType;
              trans["value"] = i.value;
              trans["transactionDateClt"] = tran.date;
              trans["clientNominalCode"] = tran.code;
              trans["clientNominalName"] = tran.name;
              trans["assetNarrative"] = tran.detail;
              trans["value"] = tran.value;
              trans["rowNumber"] = transToPost.length + 3;
            }
          });
          transToPost.push(trans);
        } else {
          i.rowNumber = transToPost.length + 3;
          i.assetNarrative = i.narrative;
          transToPost.push(i);
        }
      });
      transToPost.forEach((tran) => {
        const transVals = [];
        if (tran.transactionDate) {
          const dateString = tran.transactionDate.split("T")[0];
          const dateStringSplit = dateString.split("-");
          const dateConverted = `${dateStringSplit[2]}/${dateStringSplit[1]}/${dateStringSplit[0]}`;
          transVals.push(dateConverted);
          tran.transactionDateUser = dateConverted;
        } else if (tran.transactionDateClt) {
          transVals.push(tran.transactionDateClt);
        } else {
          transVals.push("Not provided");
        }
        transVals.push(tran.narrative);
        if (tran.journal) {
          transVals.push("Journal");
        } else if (tran.finalJournal) {
          transVals.push("Final journal");
        } else if (tran.reviewJournal) {
          transVals.push("Review journal");
        } else if (tran.clientTB) {
          transVals.push("Client TB");
        } else if (tran.clientAdjustment) {
          transVals.push("Client adjustment");
        }
        transVals.push(tran.cerysCode);
        transVals.push(tran.cerysShortName);
        if (tran.clientNominalCode >= 0) {
          transVals.push(tran.clientNominalCode);
        } else {
          transVals.push("NA");
        }
        if (tran.clientNominalName) {
          transVals.push(tran.clientNominalName);
        } else {
          transVals.push("NA");
        }
        if (tran.assetNarrative) {
          transVals.push(tran.assetNarrative);
        } else {
          transVals.push("NA");
        }
        transVals.push(tran.value / 100);
        // if (tran.cerysName[0] === "G") {
        //     transVals.push(activeClient.amortBasisGwill);
        //     transVals.push(activeClient.amortRateGwill);
        // } else if (tran.cerysName[0] === "P") {
        //     transVals.push(activeClient.amortBasisPatsLics);
        //     transVals.push(activeClient.amortRatePatsLics);
        // } else if (tran.cerysName[0] === "D") {
        //     transVals.push(activeClient.amortBasisDevCosts);
        //     transVals.push(activeClient.amortRateDevCosts);
        // } else if (tran.cerysName[0] === "C") {
        //     transVals.push(activeClient.amortBasisCompSware);
        //     transVals.push(activeClient.amortRateCompSware);
        // }
        bodyContent.push(transVals);
      });
      let bodyRange;
      const headerRange = ws.getRange("A1:I2");
      headerRange.values = [
        ["CERYS", "CERYS", "POSTING", "CERYS", "CERYS", "CLIENT", "CLIENT", "CLIENT", "DEBIT/"],
        ["DATE", "NARRATIVE", "SOURCE", "CODE", "NOMINAL", "NC", "NOMINAL", "NARRATIVE", "(CREDIT)"],
      ];
      bodyRange = ws.getRange(`A3:I${bodyContent.length + 2}`);
      headerRange.format.font.bold = true;
      bodyRange.values = bodyContent;
      const rangeA = ws.getRange("A:A");
      rangeA.numberFormat = "dd/mm/yyyy";
      const rangeI = ws.getRange("I:I");
      rangeI.numberFormat = "#,##0.00;(#,##0.00);-";
      const rangeAI = ws.getRange("A:I");
      rangeAI.format.autofitColumns();
      const rangeD = ws.getRange(`D3:D${bodyContent.length + 2}`);
      rangeD.format.fill.color = "yellow";
      // CHANGE CODE BELOW:
      ws.onChanged.add(async (e) => captureIPRSummChange(context, e, transToPost, ws));
      await context.sync();
      //const submitBtn = buttonGenerator(
      //  "submitIPRTrans",
      //  ["noclass"],
      //  "CREATE IP REGISTER",
      //  createIPR,
      //  context,
      //  session,
      //  transToPost
      //);
      //div.appendChild(submitBtn);
    });
  } catch (e) {
    console.error(e);
  }
}

export async function captureIPRSummChange(context, e, transToPost, ws) {
  const eRowNumber = parseInt(e.address.substr(1));
  const callingCell = ws.getRange(`${e.address}:${e.address}`);
  callingCell.format.fill.color = "lightGreen";
  await context.sync();
  if (e.address[0] === "D") {
    transToPost = updateNomCode(e, transToPost, eRowNumber);
  }
}

//export function updateDepnBasis(e, transToPost, eRowNumber) {
//  const updatedTransToPost = [];
//  transToPost.forEach((i) => {
//    if (i.rowNumber === eRowNumber) {
//      i.depnBasis = e.details.valueAfter;
//      updatedTransToPost.push(i);
//    } else {
//      updatedTransToPost.push(i);
//    }
//  });
//  return updatedTransToPost;
//}

//export function updateDepnRate(e, transToPost, eRowNumber) {
//  const updatedTransToPost = [];
//  transToPost.forEach((i) => {
//    if (i.rowNumber === eRowNumber) {
//      i.depnRate = e.details.valueAfter;
//      updatedTransToPost.push(i);
//    } else {
//      updatedTransToPost.push(i);
//    }
//  });
//  return updatedTransToPost;
//}
