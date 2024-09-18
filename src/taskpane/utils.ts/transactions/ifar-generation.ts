import { postIFA } from "../../fetching/apiEndpoints";
import { fetchOptionsIFA } from "../../fetching/generateOptions";
import { applyWorkhseetHeader, worksheetHeader } from "../../workbook views/components/schedule-header";
import { updateNomCode, colNumToLetter } from "../helperFunctions";
import { addWorksheet } from "../worksheet";

export function createRelTransIFA(session) {
  const relevantTrans = [];
  session.activeAssignment.transactions.forEach((tran) => {
    if (tran.cerysCategory === "Intangible assets") {
      relevantTrans.push(tran);
    }
  });
  createIFATransSumm(session, relevantTrans);
}

export async function createIFATransSumm(session, relevantTrans) {
  try {
    await Excel.run(async (context) => {
      const ws = addWorksheet(context, "IFA Transactions");
      let activeClient;
      session.customer.clients.forEach((client) => {
        if (client._id === session.activeAssignment.clientId) {
          activeClient = client;
        }
      });
      const bodyContent = [];
      session["IFATransactions"] = [];
      relevantTrans.forEach((i) => {
        if (i.clientTB) {
          const trans = {};
          session.activeAssignment.clientNL.forEach((tran) => {
            if (tran.code === i.clientNominalCode) {
              trans["cerysCategory"] = i.cerysCategory;
              trans["assetCategory"] = i.assetCategory;
              trans["assetCategoryNo"] = i.assetCategoryNo;
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
              trans["transactionDateClt"] = tran.date;
              trans["clientNominalCode"] = tran.code;
              trans["clientNominalName"] = tran.name;
              trans["assetNarrative"] = tran.detail;
              trans["value"] = tran.value;
              trans["rowNumber"] = session["IFATransactions"].length + 3;
            }
          });
          session["IFATransactions"].push(trans);
        } else {
          i.rowNumber = session["IFATransactions"].length + 3;
          i.assetNarrative = i.narrative;
          session["IFATransactions"].push(i);
        }
      });
      session["IFATransactions"].forEach((tran) => {
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
        if (tran.cerysName[0] === "G") {
          transVals.push(activeClient.amortBasisGwill);
          transVals.push(activeClient.amortRateGwill);
        } else if (tran.cerysName[0] === "P") {
          transVals.push(activeClient.amortBasisPatsLics);
          transVals.push(activeClient.amortRatePatsLics);
        } else if (tran.cerysName[0] === "D") {
          transVals.push(activeClient.amortBasisDevCosts);
          transVals.push(activeClient.amortRateDevCosts);
        } else if (tran.cerysName[0] === "C") {
          transVals.push(activeClient.amortBasisCompSware);
          transVals.push(activeClient.amortRateCompSware);
        }
        bodyContent.push(transVals);
      });
      let bodyRange;
      const headerRange = ws.getRange("A1:K2");
      headerRange.values = [
        ["CERYS", "CERYS", "POSTING", "CERYS", "CERYS", "CLIENT", "CLIENT", "CLIENT", "DEBIT/", "AMORT", "AMORT"],
        ["DATE", "NARRATIVE", "SOURCE", "CODE", "NOMINAL", "NC", "NOMINAL", "NARRATIVE", "(CREDIT)", "BASIS", "RATE"],
      ];
      bodyRange = ws.getRange(`A3:K${bodyContent.length + 2}`);
      headerRange.format.font.bold = true;
      bodyRange.values = bodyContent;
      const rangeA = ws.getRange("A:A");
      rangeA.numberFormat = "dd/mm/yyyy";
      const rangeI = ws.getRange("I:I");
      rangeI.numberFormat = "#,##0.00;(#,##0.00);-";
      const rangeAK = ws.getRange("A:K");
      rangeAK.format.autofitColumns();
      const rangeD = ws.getRange(`D3:D${bodyContent.length + 2}`);
      const rangeJK = ws.getRange(`J3:K${bodyContent.length + 2}`);
      rangeD.format.fill.color = "yellow";
      rangeJK.format.fill.color = "yellow";
      ws.onChanged.add(async (e) => captureIFARSummChange(context, e, session["IFATransactions"], ws));
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
}

export async function captureIFARSummChange(context, e, transToPost, ws) {
  const eRowNumber = parseInt(e.address.substr(1));
  const callingCell = ws.getRange(`${e.address}:${e.address}`);
  callingCell.format.fill.color = "lightGreen";
  await context.sync();
  if (e.address[0] === "D") {
    transToPost = updateNomCode(e, transToPost, eRowNumber);
  } else if (e.address[0] === "J") {
    transToPost = updateAmortBasis(e, transToPost, eRowNumber);
  } else if (e.address[0] === "K") {
    transToPost = updateAmortRate(e, transToPost, eRowNumber);
  }
}

export function updateAmortBasis(e, transToPost, eRowNumber) {
  const updatedTransToPost = [];
  transToPost.forEach((i) => {
    if (i.rowNumber === eRowNumber) {
      i.amortBasis = e.details.valueAfter;
      updatedTransToPost.push(i);
    } else {
      updatedTransToPost.push(i);
    }
  });
  return updatedTransToPost;
}

export function updateAmortRate(e, transToPost, eRowNumber) {
  const updatedTransToPost = [];
  transToPost.forEach((i) => {
    if (i.rowNumber === eRowNumber) {
      i.amortRate = e.details.valueAfter;
      updatedTransToPost.push(i);
    } else {
      updatedTransToPost.push(i);
    }
  });
  return updatedTransToPost;
}

export async function createIFAR(session) {
  try {
    await Excel.run(async (context) => {
      await postIFAtoMem(session);
      postIFAtoDB(session);
      createIFARWs(context, session);
    });
  } catch (e) {
    console.error(e);
  }
}

const postIFAtoMem = async (session) => {
  const intAssets = [];
  session["IFATransactions"].forEach((asset) => {
    const intAss = {
      narrative: asset.narrative,
      assetNarrative: asset.assetNarrative,
      cerysCategory: asset.cerysCategory,
      cost: asset.value,
      transDateUser: asset.transactionDate,
      transDateClt: asset.transactionDateClt,
    };
    intAssets.push(intAss);
  });
  updateIFAMem(session, intAssets);
};

const updateIFAMem = (session, intAssets) => {
  session["activeAssignment"].IFAR.push(...intAssets);
  session["activeAssignment"].IFARegisterCreated = true;
  session["customer"]["assignments"].forEach((ass) => {
    if (ass._id === session["activeAssignment"]._id) {
      ass.IFAR.push(...intAssets);
      ass.IFARegistered = true;
    }
  });
};

export async function postIFAtoDB(session) {
  const options = fetchOptionsIFA(session);
  const updatedCustAndAssDb = await fetch(postIFA, options);
  const updatedCustAndAss = await updatedCustAndAssDb.json();
  console.log(updatedCustAndAss);
}

export async function createIFARWs(context, session) {
  const transToPost = session["IFATransactions"];
  const activeCatsNames = [];
  const IFAActiveCats = [];
  transToPost.forEach((i) => {
    if (!activeCatsNames.includes(i.assetCategory)) {
      activeCatsNames.push(i.assetCategory);
      IFAActiveCats.push({
        assetCategory: i.assetCategory,
        assetCategoryNo: i.assetCategoryNo,
      });
    }
  });
  IFAActiveCats.sort((a, b) => {
    return a.assetCategoryNo - b.assetCategoryNo;
  });
  const wsName = "IFA Register";
  const ws = addWorksheet(context, wsName);
  const wsHeaders = worksheetHeader(session, "Intangible fixed assets register");
  applyWorkhseetHeader(ws, wsHeaders);
  await context.sync();
  populateIFARWs(context, IFAActiveCats, transToPost, ws);
}

export async function populateIFARWs(context, IFAActiveCats, transToPost, ws) {
  console.log(IFAActiveCats);
  console.log(transToPost);
  const IFAActiveSubCats = [];
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
      IFAActiveSubCats.push(obj);
    }
  });
  IFAActiveSubCats.sort((a, b) => {
    return a.assetSubCatCode - b.assetSubCatCode;
  });
  console.log(IFAActiveSubCats);
  const regColIndex = {
    costCFNum: 0,
    costCFLetter: "",
    amortBFNum: 0,
    amortBFLetter: "",
    amortCFNum: 0,
    amortCFLetter: "",
    nBVCFNum: 0,
    nBVCFLetter: "",
    nBVBFNum: 0,
    nBVBFLetter: "",
    costTotalEndLetter: "",
    amortTotalEndLetter: "",
    blankCellOneNum: 0,
    blankCellOneLetter: "",
    blankCellTwoNum: 0,
    blankCellTwoLetter: "",
    colsToTotal: [{ number: 4, letter: "D" }],
  };
  const registerColNamesOne = ["Date", "Description", "Days of"];
  IFAActiveSubCats.forEach((sub) => {
    if (sub.assetSubCatCode < 10) {
      registerColNamesOne.push(sub.regColNameOne);
      sub.regCol = registerColNamesOne.length;
    }
  });
  registerColNamesOne.push("Cost", "");
  regColIndex.costCFNum = registerColNamesOne.length - 1;
  IFAActiveSubCats.forEach((sub) => {
    if (sub.assetSubCatCode > 9) {
      registerColNamesOne.push(sub.regColNameOne);
      sub.regCol = registerColNamesOne.length;
    }
  });
  console.log(IFAActiveSubCats);
  registerColNamesOne.push("Amort");
  regColIndex.amortCFNum = registerColNamesOne.length;
  registerColNamesOne.push("", "NBV", "NBV");
  regColIndex.nBVCFNum = registerColNamesOne.length - 1;
  regColIndex.nBVBFNum = registerColNamesOne.length;
  const numberCols = registerColNamesOne.length;
  const numberColsAsLetter = colNumToLetter(numberCols);
  const costCFLetter = colNumToLetter(regColIndex.costCFNum);
  regColIndex.costCFLetter = costCFLetter;
  regColIndex.amortBFNum = regColIndex.costCFNum + 2;
  const amortBFLetter = colNumToLetter(regColIndex.amortBFNum);
  regColIndex.amortBFLetter = amortBFLetter;
  const amortCFLetter = colNumToLetter(regColIndex.amortCFNum);
  regColIndex.amortCFLetter = amortCFLetter;
  const nBVCFLetter = colNumToLetter(regColIndex.nBVCFNum);
  regColIndex.nBVCFLetter = nBVCFLetter;
  const nBVBFLetter = colNumToLetter(regColIndex.nBVBFNum);
  regColIndex.nBVBFLetter = nBVBFLetter;
  const costTotalEndLetter = colNumToLetter(regColIndex.costCFNum - 1);
  regColIndex.costTotalEndLetter = costTotalEndLetter;
  const amortTotalEndLetter = colNumToLetter(regColIndex.amortCFNum - 1);
  regColIndex.amortTotalEndLetter = amortTotalEndLetter;
  regColIndex.blankCellOneNum = regColIndex.costCFNum + 1;
  regColIndex.blankCellOneLetter = colNumToLetter(regColIndex.blankCellOneNum);
  regColIndex.blankCellTwoNum = regColIndex.amortCFNum + 1;
  regColIndex.blankCellTwoLetter = colNumToLetter(regColIndex.blankCellTwoNum);
  console.log(regColIndex);
  for (let i = 5; i < regColIndex.costCFNum + 1; i++) {
    const letter = colNumToLetter(i);
    regColIndex.colsToTotal.push({ number: i, letter });
  }
  for (let i = regColIndex.amortBFNum; i < regColIndex.amortCFNum + 1; i++) {
    const letter = colNumToLetter(i);
    regColIndex.colsToTotal.push({ number: i, letter });
  }
  for (let i = regColIndex.nBVCFNum; i < regColIndex.nBVBFNum + 1; i++) {
    const letter = colNumToLetter(i);
    regColIndex.colsToTotal.push({ number: i, letter });
  }
  const registerColNamesTwo = ["", "", "Year Held"];
  IFAActiveSubCats.forEach((sub) => {
    if (sub.assetSubCatCode < 10) {
      sub.regColNameTwo ? registerColNamesTwo.push(sub.regColNameTwo) : registerColNamesTwo.push("");
    }
  });
  registerColNamesTwo.push("C/Fwd", "");
  IFAActiveSubCats.forEach((sub) => {
    if (sub.assetSubCatCode > 9) {
      sub.regColNameTwo ? registerColNamesTwo.push(sub.regColNameTwo) : registerColNamesTwo.push("");
    }
  });
  registerColNamesTwo.push("C/Fwd");
  registerColNamesTwo.push("", "C/Fwd", "B/Fwd");
  transToPost.forEach((trans) => {
    IFAActiveSubCats.forEach((subCat) => {
      if (trans.assetSubCatCode === subCat.assetSubCatCode) {
        trans.regCol = subCat.regCol;
      }
    });
  });
  console.log(transToPost);
  console.log(IFAActiveSubCats);
  console.log(registerColNamesOne);
  console.log(registerColNamesTwo);
  const iFARBodyVals = [];
  const underlineA = [];
  const underlineAO = [];
  const formatTotal = [];
  let rowNumber = 10;
  const subTotalRows = [];
  IFAActiveCats.forEach((cat) => {
    let additionsTotal = 0;
    const catHeader = [];
    catHeader.push(cat.assetCategory);
    for (let i = 0; i < numberCols - 1; i++) {
      catHeader.push("");
    }
    iFARBodyVals.push(catHeader);
    underlineA.push(rowNumber);
    rowNumber++;
    const blankLine = [];
    for (let i = 0; i < numberCols; i++) {
      blankLine.push("");
    }
    iFARBodyVals.push(blankLine);
    rowNumber++;
    iFARBodyVals.push(registerColNamesOne);
    underlineAO.push(rowNumber);
    rowNumber++;
    iFARBodyVals.push(registerColNamesTwo);
    underlineAO.push(rowNumber);
    rowNumber++;
    iFARBodyVals.push(blankLine);
    rowNumber++;
    const totalStartRowNumber = rowNumber;
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
          regColIndex.amortCFNum - 1,
          1,
          `=sum(${regColIndex.amortBFLetter}${rowNumber}:${regColIndex.amortTotalEndLetter}${rowNumber})`
        );
        assetLine.splice(
          regColIndex.nBVCFNum - 1,
          1,
          `=${regColIndex.costCFLetter}${rowNumber}-${regColIndex.amortCFLetter}${rowNumber}`
        );
        if (subCatNames.includes("Cost bfwd")) {
          assetLine.splice(regColIndex.nBVBFNum - 1, 1, `=D${rowNumber}-${regColIndex.amortBFLetter}${rowNumber}`);
        }
        assetLine.splice(regColIndex.blankCellOneNum - 1, 1, "");
        assetLine.splice(regColIndex.blankCellTwoNum - 1, 1, "");
        iFARBodyVals.push(assetLine);
        rowNumber++;
        additionsTotal += tran.value / 100;
      }
    });
    iFARBodyVals.push(blankLine);
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
    iFARBodyVals.push(catTotalsLine);
    subTotalRows.push(rowNumber);
    formatTotal.push(rowNumber);
    rowNumber++;
    iFARBodyVals.push(blankLine);
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
  iFARBodyVals.push(finalTotal);
  console.log(iFARBodyVals);
  const iFARBodyRange = ws.getRange(`A10:${numberColsAsLetter}${iFARBodyVals.length + 9}`);
  iFARBodyRange.values = iFARBodyVals;
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
    const range = ws.getRange(`A${row}:${numberColsAsLetter}${row}`);
    //range.format.font.bold = true;
    const totalRanges = [];
    const totalRangeOne = ws.getRange(`D${row}:${regColIndex.costCFLetter}${row}`);
    totalRanges.push(totalRangeOne);
    const totalRangeTwo = ws.getRange(`${regColIndex.amortBFLetter}${row}:${regColIndex.amortCFLetter}${row}`);
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
    `${regColIndex.amortBFLetter}${finalTotalRow}:${regColIndex.amortCFLetter}${finalTotalRow}`
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
