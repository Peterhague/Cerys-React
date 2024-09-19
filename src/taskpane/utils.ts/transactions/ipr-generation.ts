import { postTFA } from "../../fetching/apiEndpoints";
import { fetchOptionsIP } from "../../fetching/generateOptions";
import { applyWorkhseetHeader, worksheetHeader } from "../../workbook views/components/schedule-header";
import { colNumToLetter, updateNomCode } from "../helperFunctions";
import { addWorksheet } from "../worksheet";
import { populateAssetRegWs } from "./asset-reg-population";

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
      session["IPTransactions"] = [];
      relevantTrans.forEach((i) => {
        if (i.clientTB) {
          const trans = {};
          session.activeAssignment.clientNL.forEach((tran) => {
            if (tran.code === i.clientNominalCode) {
              trans["cerysCategory"] = i.cerysCategory;
              trans["assetCategoryNo"] = i.assetCategoryNo;
              trans["assetCategory"] = i.assetCategory;
              trans["assetSubCategory"] = i.assetSubCategory;
              trans["assetSubCatCode"] = i.assetSubCatCode;
              trans["regColNameOne"] = i.regColNameOne;
              trans["regColNameTwo"] = i.regColNameTwo;
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
              trans["rowNumber"] = session["IPTransactions"].length + 3;
            }
          });
          session["IPTransactions"].push(trans);
        } else {
          i.rowNumber = session["IPTransactions"].length + 3;
          i.assetNarrative = i.narrative;
          session["IPTransactions"].push(i);
        }
      });
      session["IPTransactions"].forEach((tran) => {
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
      ws.onChanged.add(async (e) => captureIPRSummChange(context, e, session["IPTransactions"], ws));
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

//export async function createIPR(session) {
//  try {
//    await Excel.run(async (context) => {
//      await postIPtoDB(session);
//      createIPRWs(context, session);
//    });
//  } catch (e) {
//    console.error(e);
//  }
//}

export async function createIPR(session) {
  try {
    await Excel.run(async (context) => {
      await postIPtoMem(session);
      postIPtoDB(session);
      createIPRWs(context, session);
    });
  } catch (e) {
    console.error(e);
  }
}

const postIPtoMem = async (session) => {
  const iPAssets = [];
  session["IPTransactions"].forEach((asset) => {
    const iPAss = {
      narrative: asset.narrative,
      assetNarrative: asset.assetNarrative,
      cerysCategory: asset.cerysCategory,
      cost: asset.value,
      transDateUser: asset.transactionDate,
      transDateClt: asset.transactionDateClt,
    };
    iPAssets.push(iPAss);
  });
  updateIPMem(session, iPAssets);
};

const updateIPMem = (session, iPAssets) => {
  session["activeAssignment"].IPR.push(...iPAssets);
  session["activeAssignment"].IPRegisterCreated = true;
  session["customer"]["assignments"].forEach((ass) => {
    if (ass._id === session["activeAssignment"]._id) {
      ass.IPR.push(...iPAssets);
      ass.IPRegistered = true;
    }
  });
};

export async function postIPtoDB(session) {
  const options = fetchOptionsIP(session);
  const updatedCustAndAssDb = await fetch(postTFA, options);
  const updatedCustAndAss = await updatedCustAndAssDb.json();
  console.log(updatedCustAndAss);
}

export async function createIPRWs(context, session) {
  const transToPost = session["IPTransactions"];
  const activeCatsNames = [];
  const IPActiveCats = [];
  transToPost.forEach((i) => {
    if (!activeCatsNames.includes(i.assetCategory)) {
      activeCatsNames.push(i.assetCategory);
      IPActiveCats.push({
        assetCategory: i.assetCategory,
        assetCategoryNo: i.assetCategoryNo,
      });
    }
  });
  IPActiveCats.sort((a, b) => {
    return a.assetCategoryNo - b.assetCategoryNo;
  });
  const wsName = "IP Register";
  const ws = addWorksheet(context, wsName);
  const wsHeaders = worksheetHeader(session, "Investment property register");
  applyWorkhseetHeader(ws, wsHeaders);
  await context.sync();
  populateAssetRegWs(context, IPActiveCats, transToPost, ws, "IP");
}

export async function populateIPRWs(context, IPActiveCats, transToPost, ws) {
  console.log(transToPost);
  const IPActiveSubCats = [];
  const subCatNames = [];
  transToPost.forEach((i) => {
    if (!subCatNames.includes(i.assetSubCategory)) {
      const obj = {
        assetSubCategory: i.assetSubCategory,
        assetSubCatCode: i.assetSubCatCode,
        regColNameOne: i.regColNameOne,
        regColNameTwo: i.regColNameTwo,
      };
      subCatNames.push(i.assetSubCategory);
      IPActiveSubCats.push(obj);
    }
  });
  IPActiveSubCats.sort((a, b) => {
    return a.assetSubCatCode - b.assetSubCatCode;
  });
  const regColIndex = {
    costCFNum: 0,
    costCFLetter: "",
    depnBFNum: 0,
    depnBFLetter: "",
    depnCFNum: 0,
    depnCFLetter: "",
    nBVCFNum: 0,
    nBVCFLetter: "",
    nBVBFNum: 0,
    nBVBFLetter: "",
    costTotalEndLetter: "",
    depnTotalEndLetter: "",
    blankCellOneNum: 0,
    blankCellOneLetter: "",
    blankCellTwoNum: 0,
    blankCellTwoLetter: "",
    colsToTotal: [{ number: 4, letter: "D" }],
  };
  const registerColNamesOne = ["Date", "Description", "Days of"];
  IPActiveSubCats.forEach((sub) => {
    if (sub.assetSubCatCode < 11) {
      registerColNamesOne.push(sub.regColNameOne);
      sub.regCol = registerColNamesOne.length;
    }
  });
  registerColNamesOne.push("Cost", "");
  regColIndex.costCFNum = registerColNamesOne.length - 1;
  IPActiveSubCats.forEach((sub) => {
    if (sub.assetSubCatCode > 10) {
      registerColNamesOne.push(sub.regColNameOne);
      sub.regCol = registerColNamesOne.length;
    }
  });
  registerColNamesOne.push("Depn");
  regColIndex.depnCFNum = registerColNamesOne.length;
  registerColNamesOne.push("", "NBV", "NBV");
  regColIndex.nBVCFNum = registerColNamesOne.length - 1;
  regColIndex.nBVBFNum = registerColNamesOne.length;
  const numberCols = registerColNamesOne.length;
  const numberColsAsLetter = colNumToLetter(numberCols);
  const costCFLetter = colNumToLetter(regColIndex.costCFNum);
  regColIndex.costCFLetter = costCFLetter;
  regColIndex.depnBFNum = regColIndex.costCFNum + 2;
  const depnBFLetter = colNumToLetter(regColIndex.depnBFNum);
  regColIndex.depnBFLetter = depnBFLetter;
  const depnCFLetter = colNumToLetter(regColIndex.depnCFNum);
  regColIndex.depnCFLetter = depnCFLetter;
  const nBVCFLetter = colNumToLetter(regColIndex.nBVCFNum);
  regColIndex.nBVCFLetter = nBVCFLetter;
  const nBVBFLetter = colNumToLetter(regColIndex.nBVBFNum);
  regColIndex.nBVBFLetter = nBVBFLetter;
  const costTotalEndLetter = colNumToLetter(regColIndex.costCFNum - 1);
  regColIndex.costTotalEndLetter = costTotalEndLetter;
  const depnTotalEndLetter = colNumToLetter(regColIndex.depnCFNum - 1);
  regColIndex.depnTotalEndLetter = depnTotalEndLetter;
  regColIndex.blankCellOneNum = regColIndex.costCFNum + 1;
  regColIndex.blankCellOneLetter = colNumToLetter(regColIndex.blankCellOneNum);
  regColIndex.blankCellTwoNum = regColIndex.depnCFNum + 1;
  regColIndex.blankCellTwoLetter = colNumToLetter(regColIndex.blankCellTwoNum);
  for (let i = 5; i < regColIndex.costCFNum + 1; i++) {
    const letter = colNumToLetter(i);
    regColIndex.colsToTotal.push({ number: i, letter });
  }
  for (let i = regColIndex.depnBFNum; i < regColIndex.depnCFNum + 1; i++) {
    const letter = colNumToLetter(i);
    regColIndex.colsToTotal.push({ number: i, letter });
  }
  for (let i = regColIndex.nBVCFNum; i < regColIndex.nBVBFNum + 1; i++) {
    const letter = colNumToLetter(i);
    regColIndex.colsToTotal.push({ number: i, letter });
  }
  const registerColNamesTwo = ["", "", "Year Held"];
  IPActiveSubCats.forEach((sub) => {
    if (sub.assetSubCatCode < 10) {
      sub.regColNameTwo ? registerColNamesTwo.push(sub.regColNameTwo) : registerColNamesTwo.push("");
    }
  });
  registerColNamesTwo.push("C/Fwd", "");
  IPActiveSubCats.forEach((sub) => {
    if (sub.assetSubCatCode > 9) {
      sub.regColNameTwo ? registerColNamesTwo.push(sub.regColNameTwo) : registerColNamesTwo.push("");
    }
  });
  registerColNamesTwo.push("C/Fwd");
  registerColNamesTwo.push("", "C/Fwd", "B/Fwd");
  transToPost.forEach((trans) => {
    IPActiveSubCats.forEach((subCat) => {
      if (trans.assetSubCatCode === subCat.assetSubCatCode) {
        trans.regCol = subCat.regCol;
      }
    });
  });
  const iPRBodyVals = [];
  const underlineA = [];
  const underlineAO = [];
  const formatTotal = [];
  let rowNumber = 10;
  const subTotalRows = [];
  IPActiveCats.forEach((cat) => {
    const catHeader = [];
    catHeader.push(cat.assetCategory);
    for (let i = 0; i < numberCols - 1; i++) {
      catHeader.push("");
    }
    iPRBodyVals.push(catHeader);
    underlineA.push(rowNumber);
    rowNumber++;
    const blankLine = [];
    for (let i = 0; i < numberCols; i++) {
      blankLine.push("");
    }
    iPRBodyVals.push(blankLine);
    rowNumber++;
    iPRBodyVals.push(registerColNamesOne);
    underlineAO.push(rowNumber);
    rowNumber++;
    iPRBodyVals.push(registerColNamesTwo);
    underlineAO.push(rowNumber);
    rowNumber++;
    iPRBodyVals.push(blankLine);
    rowNumber++;
    const totalStartRowNumber = rowNumber;
    console.log(transToPost);
    transToPost.forEach((tran) => {
      if (tran.assetCategory === cat.assetCategory) {
        const assetLine = [];
        if (tran.transactionDateClt) {
          assetLine.push(tran.transactionDateClt);
        } else if (tran.transactionDateUser) {
          assetLine.push(tran.transactionDateUser);
        }
        assetLine.push(tran.assetNarrative);
        assetLine.push(`=IF(B3-A${rowNumber} > 365, 365, B3-A${rowNumber})`);
        for (let i = 0; i < numberCols - 3; i++) {
          assetLine.push(0);
        }
        assetLine.splice(tran.regCol - 1, 1, tran.value / 100);
        assetLine.splice(
          regColIndex.costCFNum - 1,
          1,
          `=sum(D${rowNumber}:${regColIndex.costTotalEndLetter}${rowNumber})`
        );
        assetLine.splice(
          regColIndex.depnCFNum - 1,
          1,
          `=sum(${regColIndex.depnBFLetter}${rowNumber}:${regColIndex.depnTotalEndLetter}${rowNumber})`
        );
        assetLine.splice(
          regColIndex.nBVCFNum - 1,
          1,
          `=${regColIndex.costCFLetter}${rowNumber}-${regColIndex.depnCFLetter}${rowNumber}`
        );
        if (subCatNames.includes("Cost bfwd")) {
          assetLine.splice(regColIndex.nBVBFNum - 1, 1, `=D${rowNumber}-${regColIndex.depnBFLetter}${rowNumber}`);
        }
        assetLine.splice(regColIndex.blankCellOneNum - 1, 1, "");
        assetLine.splice(regColIndex.blankCellTwoNum - 1, 1, "");
        iPRBodyVals.push(assetLine);
        rowNumber++;
      }
    });
    iPRBodyVals.push(blankLine);
    rowNumber++;
    const catTotalsLine = [];
    for (let i = 0; i < numberCols; i++) {
      catTotalsLine.push("");
    }
    regColIndex.colsToTotal.forEach((col) => {
      catTotalsLine.splice(
        col.number - 1,
        1,
        `=sum(${col.letter}${totalStartRowNumber}:${col.letter}${rowNumber - 1})`
      );
    });
    iPRBodyVals.push(catTotalsLine);
    subTotalRows.push(rowNumber);
    formatTotal.push(rowNumber);
    rowNumber++;
    iPRBodyVals.push(blankLine);
    rowNumber++;
  });
  const finalTotal = [];
  const finalTotalRow = rowNumber;
  for (let i = 0; i < numberCols; i++) {
    finalTotal.push("");
  }
  regColIndex.colsToTotal.forEach((col) => {
    let formula = `=${col.letter}${subTotalRows[0]}`;
    for (let i = 1; i < subTotalRows.length; i++) {
      formula = formula.concat(`+${col.letter}${subTotalRows[i]}`);
    }
    finalTotal.splice(col.number - 1, 1, formula);
  });
  iPRBodyVals.push(finalTotal);
  const iPRBodyRange = ws.getRange(`A10:${numberColsAsLetter}${iPRBodyVals.length + 9}`);
  iPRBodyRange.values = iPRBodyVals;
  const rangeA = ws.getRange("A:A");
  rangeA.numberFormat = "dd/mm/yyyy";
  const rangeC = ws.getRange("C:C");
  rangeC.numberFormat = "0";
  const numbersRange = ws.getRange(`D:${numberColsAsLetter}`);
  numbersRange.numberFormat = "#,##0.00;(#,##0.00);-";
  underlineA.forEach((row) => {
    const range = ws.getRange(`A${row}:A${row}`);
    range.format.font.underline = "single";
  });
  underlineAO.forEach((row) => {
    const range = ws.getRange(`A${row}:${numberColsAsLetter}${row}`);
    range.format.font.underline = "single";
  });
  formatTotal.forEach((row) => {
    //const range = ws.getRange(`A${row}:${numberColsAsLetter}${row}`);
    //range.format.font.bold = true;
    const totalRanges = [];
    const totalRangeOne = ws.getRange(`D${row}:${regColIndex.costCFLetter}${row}`);
    totalRanges.push(totalRangeOne);
    const totalRangeTwo = ws.getRange(`${regColIndex.depnBFLetter}${row}:${regColIndex.depnCFLetter}${row}`);
    totalRanges.push(totalRangeTwo);
    const totalRangeThree = ws.getRange(`${regColIndex.nBVCFLetter}${row}:${numberColsAsLetter}${row}`);
    totalRanges.push(totalRangeThree);
    totalRanges.forEach((range) => {
      const edgeTop = range.format.borders.getItem("EdgeTop");
      edgeTop.style = "Continuous";
      const edgeBottom = range.format.borders.getItem("EdgeBottom");
      edgeBottom.style = "Continuous";
    });
  });
  const finalTotalRange = ws.getRange(`A${finalTotalRow}:${numberColsAsLetter}${finalTotalRow}`);
  finalTotalRange.format.font.bold = true;
  const totalRanges = [];
  const totalRangeOne = ws.getRange(`D${finalTotalRow}:${regColIndex.costCFLetter}${finalTotalRow}`);
  totalRanges.push(totalRangeOne);
  const totalRangeTwo = ws.getRange(
    `${regColIndex.depnBFLetter}${finalTotalRow}:${regColIndex.depnCFLetter}${finalTotalRow}`
  );
  totalRanges.push(totalRangeTwo);
  const totalRangeThree = ws.getRange(
    `${regColIndex.nBVCFLetter}${finalTotalRow}:${numberColsAsLetter}${finalTotalRow}`
  );
  totalRanges.push(totalRangeThree);
  totalRanges.forEach((range) => {
    const edgeTop = range.format.borders.getItem("EdgeTop");
    edgeTop.style = "Continuous";
    const edgeBottom = range.format.borders.getItem("EdgeBottom");
    edgeBottom.style = "Double";
  });
  const colsRange = ws.getRange(`B:${numberColsAsLetter}`);
  colsRange.format.autofitColumns();
  await context.sync();
}
