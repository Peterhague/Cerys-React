import { finaliseAssignmentUrl } from "../fetching/apiEndpoints";
import { fetchOptionsFinaliseAssignment } from "../fetching/generateOptions";

export const finaliseAssignment = async (session) => {
  const activeAssignment = session.activeAssignment;
  const customerId = session.customer._id;
  const options = fetchOptionsFinaliseAssignment(activeAssignment, customerId);
  const updatedCustAndAssDb = await fetch(finaliseAssignmentUrl, options);
  const updatedCustAndAss = await updatedCustAndAssDb.json();
  console.log(updatedCustAndAss);
};
