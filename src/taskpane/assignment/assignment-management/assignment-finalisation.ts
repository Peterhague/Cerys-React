import { Session } from "../../classes/session";
import { finaliseAssignmentUrl } from "../../fetching/apiEndpoints";
import { fetchOptionsFinaliseAssignment } from "../../fetching/generateOptions";
import { ClientTBLineProps } from "../../interfaces/interfaces";
import { buildClientTBBalSheetOnly } from "../../utils/helper-functions";

export const finaliseAssignment = async (session: Session) => {
  const assignment = session.assignment;
  console.log("here");
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
  const mappedTB: ClientTBLineProps[] = tb.map((line) => {
    const clientCodeObj = line.getClientCodeObject(session);
    console.log(clientCodeObj);
    const obj: ClientTBLineProps = {
      clientCode: line.clientNominalCode,
      clientCodeName: clientCodeObj.clientCodeName,
      statement: clientCodeObj.statement,
      value: line.value,
      cerysCode: line.cerysCodeObj.cerysCode,
    };
    return obj;
  });
  console.log(mappedTB);
  return mappedTB;
};
