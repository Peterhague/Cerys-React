import { updateAssignmentUrl } from "../fetching/apiEndpoints";
import { fetchOptionsUpdateAssignment } from "../fetching/generateOptions";

export function populateUser(session, userId) {
  console.log(session);
  console.log(userId);
  let userObj;
  session["customer"]["users"].forEach((user) => {
    if (user._id === userId) userObj = user;
  });
  return userObj;
}

export async function updateAssignmentDb(session, target) {
  const workbookId = session.activeAssignment._id;
  const customerId = session.customer._id;
  const options = fetchOptionsUpdateAssignment(customerId, workbookId, target);
  const updatedCustAndAssDb = await fetch(updateAssignmentUrl, options);
  const updatedCustAndAss = await updatedCustAndAssDb.json();
  return updatedCustAndAss;
  //promptRegistersCreation(session);
}
