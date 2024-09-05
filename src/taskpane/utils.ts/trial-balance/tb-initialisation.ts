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
    obj["code"] = code;
    obj["value"] = 0;
    transactions.forEach((tran) => {
      if (tran.cerysCode === code) {
        obj["name"] = tran.cerysName;
        obj["value"] += tran.value;
        obj["category"] = tran.cerysCategory;
      }
    });
    tb.push(obj);
  });
}

export function setActiveCategories(tb) {
  const categories = [];
  tb.forEach((line) => {
    if (!categories.includes(line.category)) {
      categories.push(line.category);
    }
  });
  const arrCats = [];
  categories.forEach((cat) => {
    const obj = {};
    obj["category"] = cat;
    obj["value"] = 0;
    obj["codes"] = [];
    tb.forEach((line) => {
      if (line.category === cat) {
        obj["value"] += line.value;
        obj["codes"].push(line.code);
      }
    });
    arrCats.push(obj);
  });
  return { arrCats, categories };
}
