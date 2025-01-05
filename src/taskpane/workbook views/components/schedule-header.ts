import { Session } from "../../classes/session";

export function worksheetHeader(session: Session, wsName) {
  const assignment = session.assignment;
  const headerValues = [];
  headerValues.push(["Client name", assignment.clientName]);
  headerValues.push(["Client code", assignment.clientCode]);
  headerValues.push(["Period end", assignment.reportingPeriod.reportingDateConverted]);
  headerValues.push(["Prepared by", `${assignment.senior.firstName} ${assignment.senior.lastName}`]);
  headerValues.push(["Reviewed by", `${assignment.manager.firstName} ${assignment.manager.lastName}`]);
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
  const dateRange = ws.getRange("B3:B3");
  dateRange.numberFormat = "dd/mm/yyyy";
}
