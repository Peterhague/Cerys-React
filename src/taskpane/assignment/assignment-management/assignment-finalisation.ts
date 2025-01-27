import { Session } from "../../classes/session";
import { finaliseAssignmentUrl } from "../../fetching/apiEndpoints";
import { fetchOptionsFinaliseAssignment } from "../../fetching/generateOptions";
import { buildClientTBBalSheetOnly } from "../../utils/helper-functions";

export const finaliseAssignment = async (session: Session) => {
  const assignment = session.assignment;
  const finalClientTB = assignment.TBEntered && getFinalClientTB(session);
  console.log(finalClientTB);
  const customerId = session.customer._id;
  const options = fetchOptionsFinaliseAssignment(assignment, customerId, finalClientTB);
  const updatedCustAndAssDb = await fetch(finaliseAssignmentUrl, options);
  const updatedCustAndAss = await updatedCustAndAssDb.json();
  console.log(updatedCustAndAss);
};

export const getFinalClientTB = (session: Session) => {
  const tb = buildClientTBBalSheetOnly(session);
  tb.forEach((i) => {
    i.cerysCode = session.clientChart.find((code) => code.clientCode === i.clientCode).cerysCode;
  });
  return tb;
};
