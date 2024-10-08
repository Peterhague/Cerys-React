export function tbCreator(transactions) {
  const tbCodes = [];
  transactions.forEach((tran) => {
    if (!tbCodes.includes(tran.cerysCode)) {
      tbCodes.push(tran.cerysCode);
    }
  });
  const tb = [];
  populateTransactions(transactions, tbCodes, tb);
  return tb;
}

export function populateTransactions(transactions, tbCodes, tb) {
  tbCodes.forEach((code) => {
    const obj = {};
    obj["cerysCode"] = code;
    obj["value"] = 0;
    transactions.forEach((tran) => {
      if (tran.cerysCode === code) {
        obj["cerysName"] = tran.cerysName;
        obj["value"] += tran.value;
        obj["cerysCategory"] = tran.cerysCategory;
      }
    });
    tb.push(obj);
  });
}

export function setActiveCategories(tb) {
  const categories = [];
  tb.forEach((line) => {
    if (!categories.includes(line.cerysCategory)) {
      categories.push(line.cerysCategory);
    }
  });
  const arrCats = [];
  categories.forEach((cat) => {
    const obj = {};
    obj["cerysCategory"] = cat;
    obj["value"] = 0;
    obj["cerysCodes"] = [];
    tb.forEach((line) => {
      if (line.cerysCategory === cat) {
        obj["value"] += line.value;
        obj["cerysCodes"].push(line.cerysCode);
      }
    });
    arrCats.push(obj);
  });
  return { arrCats, categories };
}
