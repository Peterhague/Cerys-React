import { STANDARD_NUMBER_FORMAT } from "../../static-values/worksheet-formats";
import { colNumToLetter } from "../excel-col-conversion";

export function populateAssetRegWs(activeCats, transToPost, ws, regType) {
  const { activeSubCats, subCatNames } = populateActiveSubCats(transToPost);
  const { regColIndex, registerColNames } = buildRegColNames(activeSubCats, regType);
  const { numberCols, numberColsAsLetter } = populateRegisterColsIndex(regColIndex, registerColNames.namesOne);
  transToPost.forEach((trans) => {
    activeSubCats.forEach((subCat) => {
      if (trans.assetSubCatCode === subCat.assetSubCatCode) {
        trans.regCol = subCat.regCol;
      }
    });
  });
  transToPost.forEach((trans) => {
    trans.subTransactions.forEach((sub) => {
      activeSubCats.forEach((subCat) => {
        if (sub.assetSubCatCode === subCat.assetSubCatCode) {
          sub.regCol = subCat.regCol;
        }
      });
    });
  });
  const { regBodyVals, rowNumber, subTotalRows, underlineA, underlineAO, formatTotal } = buildRegPerCategory(
    activeCats,
    numberCols,
    registerColNames,
    transToPost,
    regColIndex,
    subCatNames
  );
  const { finalTotal, finalTotalRow } = buildFinalTotalRow(rowNumber, numberCols, regColIndex, subTotalRows);
  regBodyVals.push(finalTotal);
  const regBodyRange = ws.getRange(`A10:${numberColsAsLetter}${regBodyVals.length + 9}`);
  regBodyRange.values = regBodyVals;
  formatRegister(ws, underlineA, underlineAO, formatTotal, finalTotalRow, numberColsAsLetter, regColIndex);
}

const columnsIndex = {
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

const populateActiveSubCats = (transToPost) => {
  const activeSubCats = [];
  const subCatNames = [];
  transToPost.forEach((i) => {
    i.subTransactions.forEach((sub) => {
      if (!subCatNames.includes(sub.assetSubCategory)) {
        const obj = {
          assetSubCategory: sub.assetSubCategory,
          assetSubCatCode: sub.assetSubCatCode,
          regColNameOne: sub.regColNameOne,
          regColNameTwo: sub.regColNameTwo,
        };
        subCatNames.push(sub.assetSubCategory);
        activeSubCats.push(obj);
      }
    });
  });
  activeSubCats.sort((a, b) => {
    return a.assetSubCatCode - b.assetSubCatCode;
  });
  return { activeSubCats, subCatNames };
};

const buildRegColNames = (activeSubCats, regType) => {
  const regColIndex = columnsIndex;
  const registerColNames = { namesOne: ["Date", "Description", "Days of"], namesTwo: ["", "", "Year Held"] };
  const { namesOne, namesTwo } = registerColNames;
  const firstDepnCol = regType === "IP" ? 11 : 10;
  const lastCostCol = regType === "IP" ? 10 : 9;
  activeSubCats.forEach((sub) => {
    if (sub.assetSubCatCode < firstDepnCol) {
      namesOne.push(sub.regColNameOne);
      sub.regColNameTwo ? namesTwo.push(sub.regColNameTwo) : namesTwo.push("");
      sub.regCol = namesOne.length;
    }
  });
  namesOne.push("Cost", "");
  namesTwo.push("C/Fwd", "");
  regColIndex.costCFNum = namesOne.length - 1;
  activeSubCats.forEach((sub) => {
    if (sub.assetSubCatCode > lastCostCol) {
      namesOne.push(sub.regColNameOne);
      sub.regColNameTwo ? namesTwo.push(sub.regColNameTwo) : namesTwo.push("");
      sub.regCol = namesOne.length;
    }
  });
  regType === "IFA" ? namesOne.push("Amort") : namesOne.push("Depn");
  regColIndex.depnCFNum = namesOne.length;
  namesOne.push("", "NBV", "NBV");
  namesTwo.push("C/Fwd", "", "C/Fwd", "B/Fwd");
  return { regColIndex, registerColNames };
};

const populateRegisterColsIndex = (regColIndex, registerColNamesOne) => {
  regColIndex.nBVCFNum = registerColNamesOne.length - 1;
  regColIndex.nBVBFNum = registerColNamesOne.length;
  const numberCols = registerColNamesOne.length;
  const numberColsAsLetter = colNumToLetter(numberCols);
  regColIndex.costCFLetter = colNumToLetter(regColIndex.costCFNum);
  regColIndex.depnBFNum = regColIndex.costCFNum + 2;
  regColIndex.depnBFLetter = colNumToLetter(regColIndex.depnBFNum);
  regColIndex.depnCFLetter = colNumToLetter(regColIndex.depnCFNum);
  regColIndex.nBVCFLetter = colNumToLetter(regColIndex.nBVCFNum);
  regColIndex.nBVBFLetter = colNumToLetter(regColIndex.nBVBFNum);
  regColIndex.costTotalEndLetter = colNumToLetter(regColIndex.costCFNum - 1);
  regColIndex.depnTotalEndLetter = colNumToLetter(regColIndex.depnCFNum - 1);
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

  return { numberCols, numberColsAsLetter };
};

const buildRegPerCategory = (activeCats, numberCols, registerColNames, transToPost, regColIndex, subCatNames) => {
  const formatTotal = [];
  const subTotalRows = [];
  let rowNumber = 10;
  const regBodyVals = [];
  const underlineA = [];
  const underlineAO = [];
  const { namesOne, namesTwo } = registerColNames;
  activeCats.forEach((cat) => {
    const catHeader = [];
    catHeader.push(cat.assetCategory);
    for (let i = 0; i < numberCols - 1; i++) {
      catHeader.push("");
    }
    regBodyVals.push(catHeader);
    underlineA.push(rowNumber);
    rowNumber++;
    const blankLine = [];
    for (let i = 0; i < numberCols; i++) {
      blankLine.push("");
    }
    regBodyVals.push(blankLine);
    rowNumber++;
    regBodyVals.push(namesOne);
    underlineAO.push(rowNumber);
    rowNumber++;
    regBodyVals.push(namesTwo);
    underlineAO.push(rowNumber);
    rowNumber++;
    regBodyVals.push(blankLine);
    rowNumber++;
    const totalStartRowNumber = rowNumber;
    transToPost.forEach((tran) => {
      if (tran.assetCategory === cat.assetCategory) {
        const assetLine = [];
        assetLine.push(tran.transactionDateExcel);
        assetLine.push(tran.assetNarrative);
        assetLine.push(`=IF(B3-A${rowNumber} > 365, 365, B3-A${rowNumber})`);
        for (let i = 0; i < numberCols - 3; i++) {
          assetLine.push(0);
        }
        //assetLine.splice(tran.regCol - 1, 1, tran.value / 100);
        tran.subTransactions.forEach((subTran) => {
          assetLine.splice(subTran.regCol - 1, 1, subTran.value / 100);
        });
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
        regBodyVals.push(assetLine);
        rowNumber++;
      }
    });
    regBodyVals.push(blankLine);
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
    regBodyVals.push(catTotalsLine);
    subTotalRows.push(rowNumber);
    formatTotal.push(rowNumber);
    rowNumber++;
    regBodyVals.push(blankLine);
    rowNumber++;
  });
  return { regBodyVals, rowNumber, subTotalRows, underlineA, underlineAO, formatTotal };
};

const buildFinalTotalRow = (rowNumber, numberCols, regColIndex, subTotalRows) => {
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
  return { finalTotal, finalTotalRow };
};

const formatRegister = (ws, underlineA, underlineAO, formatTotal, finalTotalRow, numberColsAsLetter, regColIndex) => {
  const rangeA = ws.getRange("A:A");
  rangeA.numberFormat = "dd/mm/yyyy";
  const rangeC = ws.getRange("C:C");
  rangeC.numberFormat = "0";
  const numbersRange = ws.getRange(`D:${numberColsAsLetter}`);
  numbersRange.numberFormat = STANDARD_NUMBER_FORMAT;
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
};
