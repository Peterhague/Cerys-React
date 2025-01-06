import { Journal } from "../classes/journal";
import { Session } from "../classes/session";
import { JournalDetailsProps } from "../interfaces/interfaces";
import { processTransBatch } from "../utils.ts/transactions/transactions";
import { addWorksheets } from "../utils.ts/worksheet";
/*global Excel */

export async function addPrimarySheets(session: Session) {
  try {
    await Excel.run(async (context) => {
      const worksheetNames = ["DATA", "Client TB", "Client NL", "Client ADR", "Client ACR"];
      await addWorksheets(context, session, worksheetNames);
      const arrForDATA = convertDataForWbook(session);
      await writeToDATA(context, arrForDATA);
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
}

function convertDataForWbook(session: Session) {
  const assignment = session.assignment;
  let newArray = [];
  newArray.push(["Client code", assignment.clientCode]);
  newArray.push(["Client name", assignment.clientName]);
  newArray.push(["Period end", assignment.reportingPeriod.reportingDateConverted]);
  newArray.push(["Assignment type", assignment.assignmentType]);
  newArray.push(["Client software", assignment.clientSoftware]);
  newArray.push(["Prepared by", `${assignment.senior.firstName} ${assignment.senior.lastName}`]);
  newArray.push(["Reviewed by", `${assignment.manager.firstName} ${assignment.manager.lastName}`]);
  newArray.push([
    "Responsible individual",
    `${assignment.responsibleIndividual.firstName} ${assignment.responsibleIndividual.lastName}`,
  ]);
  return newArray;
}

async function writeToDATA(context, dataSpread: string[][]) {
  const ws = context.workbook.worksheets.getItem("DATA");
  const range = ws.getRange("A1:B8");
  range.values = dataSpread;
  range.format.autofitColumns();
}

export const postOpBalJnls = async (session: Session) => {
  try {
    await Excel.run(async (context) => {
      const transactionDate = session.assignment.reportingPeriod.periodStart.split("T")[0];
      session.activeJournal.journalType = "opening balance";
      session.activeJournal.journal = false;
      session.assignment.reportingPeriod.bFTB.forEach((line) => {
        const journalDetails: JournalDetailsProps = {
          cerysCode: line.cerysCode,
          journal: false,
          clientTB: false,
          narrative: "automatic opening balance",
          transactionType: "opening balance",
          value: line.value,
          transactionDate,
        };
        session.activeJournal.journals.push(new Journal(session, journalDetails));
      });
      await processTransBatch(context, session);
      await context.sync();
      session.handleView("assignmentDashHome");
    });
  } catch (e) {
    console.error(e);
  }
};
