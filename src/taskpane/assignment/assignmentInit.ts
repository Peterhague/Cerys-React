import { addWorksheets } from "../utils.ts/worksheet";

export async function addPrimarySheets(session) {
  try {
    await Excel.run(async (context) => {
      addWorksheets(context, ["DATA", "Client TB", "Client NL", "Client ADR", "Client ACR"]);
      const arrForDATA = convertDataForWbook(session);
      await writeToDATA(context, arrForDATA);
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
  newArray.push([
    "Responsible individual",
    `${activeAssignment.responsibleIndividual.firstName} ${activeAssignment.responsibleIndividual.lastName}`,
  ]);
  return newArray;
}

async function writeToDATA(context, dataSpread) {
  const ws = context.workbook.worksheets.getItem("DATA");
  const range = ws.getRange("A1:B8");
  range.values = dataSpread;
  range.format.autofitColumns();
}
