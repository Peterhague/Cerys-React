import { addWorksheets, deleteWorksheet } from "../utils.ts/worksheet";
import { worksheetHeader } from "../workbook views/components/schedule-header";

export async function addPrimarySheets(session) {
  try {
    await Excel.run(async (context) => {
      console.log("working here");
      addWorksheets(context, ["DATA", "Client TB", "Client NL", "Client ADR", "Client ACR", "Trial Balance"]);
      //deleteWorksheet(context, "Sheet1");
      const arrForDATA = convertDataForWbook(session);
      await writeToDATA(context, arrForDATA);
      initialiseTrialBalanceSheet(session, context);
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
}

function convertDataForWbook(session) {
  const activeAssignment = session["activeAssignment"];
  let newArray = [];
  newArray.push(["Client code", activeAssignment.clientCode]);
  newArray.push(["Client name", activeAssignment.clientName]);
  newArray.push(["Period end", activeAssignment.reportingDateConverted]);
  newArray.push(["Assignment type", activeAssignment.assignmentType]);
  newArray.push(["Client software", activeAssignment.clientSoftware]);
  newArray.push(["Prepared by", `${activeAssignment.senior.firstName} ${activeAssignment.senior.lastName}`]);
  newArray.push(["Reviewed by", `${activeAssignment.manager.firstName} ${activeAssignment.manager.lastName}`]);
  newArray.push(["Responsible individual", `${activeAssignment.rI.firstName} ${activeAssignment.rI.lastName}`]);
  return newArray;
}

async function writeToDATA(context, dataSpread) {
  const ws = context.workbook.worksheets.getItem("DATA");
  const range = ws.getRange("A1:B8");
  range.values = dataSpread;
  range.format.autofitColumns();
}

export async function initialiseTrialBalanceSheet(session, context) {
  const ws = context.workbook.worksheets.getItem("Trial Balance");
  //ws.onSingleClicked.add(async (e) => showNominalDetail(e));
  const range = ws.getRange("A9:C10");
  const headers = [
    ["Nominal", "Nominal", "Debit/"],
    ["Code", "Name", "(Credit)"],
  ];
  range.values = headers;
  const headerValues = worksheetHeader(session, "Trial Balance");
  const headerRange = ws.getRange("A1:B7");
  headerRange.values = headerValues;
  const headerRangeA = ws.getRange("A1:A7");
  headerRangeA.format.font.bold = true;
  const sheetNameRange = ws.getRange("A7:A7");
  sheetNameRange.format.font.italic = true;
  headerRange.format.autofitColumns();
}
