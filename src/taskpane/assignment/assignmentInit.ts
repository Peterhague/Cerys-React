import { getExcelContext } from "../utils.ts/helperFunctions";
import { processTransBatch } from "../utils.ts/transactions/transactions";
import { addWorksheets } from "../utils.ts/worksheet";

export async function addPrimarySheets(session) {
    const context = await getExcelContext();
      addWorksheets(context, ["DATA", "Client TB", "Client NL", "Client ADR", "Client ACR"]);
      const arrForDATA = convertDataForWbook(session);
      await writeToDATA(context, arrForDATA);
      await context.sync();
}

function convertDataForWbook(session) {
  const activeAssignment = session["activeAssignment"];
  let newArray = [];
  newArray.push(["Client code", activeAssignment.clientCode]);
  newArray.push(["Client name", activeAssignment.clientName]);
  newArray.push(["Period end", activeAssignment.reportingPeriod.reportingDateConverted]);
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

export const postOpBalJnls = async (session) => {
  const transactionDate = session.activeAssignment.reportingPeriod.periodStart.split("T")[0];
  const chart = session.chart;
  session.activeJournal.journalType = "opening balance";
  session.activeJournal.journal = false;
  session.activeAssignment.reportingPeriod.bFTB.forEach((line) => {
    for (let i = 0; i < chart.length; i++) {
      if (line.cerysCode === chart[i].cerysCode) {
        const jnl = {
          ...chart[i],
          journal: false,
          narrative: "automatic opening balance",
          transactionType: "opening balance",
          value: line.value,
          transactionDate,
        };
        session.activeJournal.journals.push(jnl);
        break;
      }
    }
  });
  await processTransBatch(session);
  session.handleView("assignmentDashHome");
};
