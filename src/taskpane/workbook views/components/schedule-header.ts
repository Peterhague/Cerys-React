export function worksheetHeader(session, wsName) {
  const activeAssignment = session["activeAssignment"];
  const headerValues = [];
  headerValues.push(["Client name", activeAssignment.clientName]);
  headerValues.push(["Client code", activeAssignment.clientCode]);
  headerValues.push(["Period end", activeAssignment.reportingDateConverted]);
  headerValues.push(["Prepared by", `${activeAssignment.senior.firstName} ${activeAssignment.senior.lastName}`]);
  headerValues.push(["Reviewed by", `${activeAssignment.manager.firstName} ${activeAssignment.manager.lastName}`]);
  headerValues.push(["", ""]);
  headerValues.push([wsName, ""]);
  return headerValues;
}

export function applyWorkhseetHeader(ws, headerValues) {
  const headerMainRange = ws.getRange("A1:B5");
  const mainValues = [];
  headerValues.forEach((arr, i) => {
    if (i < 5) {
      mainValues.push(arr);
    }
  });
  headerMainRange.values = mainValues;
  const headerRangeA = ws.getRange("A1:A7");
  headerRangeA.format.font.bold = true;
  headerMainRange.format.autofitColumns();
  const sheetNameRange = ws.getRange("A7:A7");
  sheetNameRange.values = headerValues[6][0];
  sheetNameRange.format.font.italic = true;
}
