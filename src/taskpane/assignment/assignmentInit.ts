import { ActiveJournal, Journal } from "../classes/journal";
import { Session } from "../classes/session";
import { JournalDetailsProps } from "../interfaces/interfaces";
import { ASSIGNMENT_DASH_HOME } from "../static-values/views";
import { processTransBatch } from "../utils/transactions/transactions";
import { addWorksheets } from "../utils/worksheet";
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
  newArray.push(["Client software", assignment.clientSoftwareDefaults.softwareName]);
  newArray.push(["Prepared by", `${assignment.senior.firstName} ${assignment.senior.lastName}`]);
  newArray.push(["Reviewed by", `${assignment.manager.firstName} ${assignment.manager.lastName}`]);
  newArray.push([
    "Responsible individual",
    `${assignment.responsibleIndividual.firstName} ${assignment.responsibleIndividual.lastName}`,
  ]);
  return newArray;
}

async function writeToDATA(context: Excel.RequestContext, dataSpread: string[][]) {
  const ws = context.workbook.worksheets.getItem("DATA");
  const range = ws.getRange("A1:B8");
  range.values = dataSpread;
  range.format.autofitColumns();
}

export const postOpBalJnls = async (session: Session) => {
  try {
    await Excel.run(async (context) => {
      const transactionDate = session.assignment.reportingPeriod.periodStart.split("T")[0];
      const journals: Journal[] = [];
      session.assignment.reportingPeriod.bFTB.forEach((line) => {
        const journalDetails: JournalDetailsProps = {
          cerysCode: line.cerysCode,
          narrative: "automatic opening balance",
          transactionType: "opening balance",
          value: line.value,
          transactionDate,
        };
        journals.push(new Journal(session, journalDetails));
      });
      const activeJournal = new ActiveJournal({ type: "opening balance", journals });
      await processTransBatch(context, session, activeJournal);
      await context.sync();
      session.handleView(ASSIGNMENT_DASH_HOME);
    });
  } catch (e) {
    console.error(e);
  }
};
