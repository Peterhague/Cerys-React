import * as React from "react";
import { useState } from "react";
import CerysButton from "../CerysButton";
import { fetchOptionsNewAssignment } from "../../fetching/generateOptions";
import { assignmentUrl } from "../../fetching/apiEndpoints";
import { addPrimarySheets } from "../../assignment/assignmentInit";
import { populateUser } from "../../utils.ts/helperFunctions";
interface newAssignmentDtlsProps {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const NewAssignmentDtls: React.FC<newAssignmentDtlsProps> = ({
  updateSession,
  handleView,
  session,
}: newAssignmentDtlsProps) => {
  const [clientId, setClientId] = useState("");
  const [assType, setAssType] = useState("");
  const [senior, setSenior] = useState("");
  const [manager, setManager] = useState("");
  const [rI, setRI] = useState("");
  const [software, setSoftware] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(clientId);
    let clientObj;
    session["customer"]["clients"].forEach((client) => {
      if (client._id === clientId) {
        clientObj = client;
      }
    });
    console.log(clientObj);
    const prelimAssignment = { clientObj, assType, senior, manager, rI, software };
    console.log(prelimAssignment);
    //session["prelimAssignment"] = prelimAssignment;
    const activeAssignment = await processNewAssignment(prelimAssignment);
    populateStaffObjs(activeAssignment);
    session["activeAssignment"] = activeAssignment;
    updateSession(session);
    console.log(session);
    addPrimarySheets(session);
    handleView("assignmentDashHome");
  };

  const processNewAssignment = async (prelimAssignment) => {
    const customerId = session["customer"]["_id"];
    const options = fetchOptionsNewAssignment(prelimAssignment, customerId);
    const objDb = await fetch(assignmentUrl, options);
    const obj = await objDb.json();
    console.log(obj);
    return obj;
  };

  const populateStaffObjs = (activeAssignment) => {
    const seniorObj = populateUser(session, activeAssignment._senior);
    activeAssignment.senior = seniorObj;
    const managerObj = populateUser(session, activeAssignment._manager);
    activeAssignment.manager = managerObj;
    const rIObj = populateUser(session, activeAssignment._responsibleIndividual);
    activeAssignment.rI = rIObj;
  };

  return (
    <>
      <form onSubmit={handleSubmit} id="addClientForm" action="">
        <h3>Enter Assignment Data</h3>
        <div>
          <label htmlFor="clientId">Select client</label>
          <select
            name="clientId"
            id="clientId"
            className="form-control"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          >
            {!clientId && <option>Please select</option>}
            {session["customer"]["clients"].map((client) => (
              <option key={client._id} value={client._id}>
                {client.clientCode + " " + client.clientName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="assType">Job type</label>
          <select
            name="assType"
            id="assType"
            className="form-control"
            value={assType}
            onChange={(e) => setAssType(e.target.value)}
          >
            {!assType && <option>Please select</option>}
            <option value="Annual accounts">Annual accounts</option>
            <option value="Management accounts">Management accounts</option>
          </select>
        </div>
        {session["customer"]["users"].length > 0 && (
          <div>
            <label htmlFor="senior">Senior</label>
            <select
              name="senior"
              id="senior"
              className="form-control"
              value={senior}
              onChange={(e) => setSenior(e.target.value)}
            >
              {!senior && <option>Please select</option>}
              {session["customer"]["users"].map((user) => (
                <option key={user._id} value={user._id}>
                  {user.firstName + " " + user.lastName}
                </option>
              ))}
            </select>
          </div>
        )}
        {session["customer"]["users"].length > 0 && (
          <div>
            <label htmlFor="manager">Manager</label>
            <select
              name="manager"
              id="manager"
              className="form-control"
              value={manager}
              onChange={(e) => setManager(e.target.value)}
            >
              {!manager && <option>Please select</option>}
              {session["customer"]["users"].map((user) => (
                <option key={user._id} value={user._id}>
                  {user.firstName + " " + user.lastName}
                </option>
              ))}
            </select>
          </div>
        )}
        {session["customer"]["users"].length > 0 && (
          <div>
            <label htmlFor="RI">Partner</label>
            <select name="RI" id="RI" className="form-control" value={rI} onChange={(e) => setRI(e.target.value)}>
              {!rI && <option>Please select</option>}
              {session["customer"]["users"].map((user) => (
                <option key={user._id} value={user._id}>
                  {user.firstName + " " + user.lastName}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label htmlFor="software">Client software</label>
          <select
            name="software"
            id="software"
            className="form-control"
            value={software}
            onChange={(e) => setSoftware(e.target.value)}
          >
            {!software && <option>Please select</option>}
            <option value="Sage Line 50">Sage Line 50</option>
            <option value="Xero">Xero</option>
            <option value="Quickbooks">Quickbooks</option>
            <option value="Kashflow">Kashflow</option>
            <option value="FreeAgent">FreeAgent</option>
          </select>
        </div>

        <div>
          <button type="submit">Add share classes</button>
        </div>
      </form>
      <CerysButton buttonText={"Return"} handleView={() => handleView("landingPage")} />
    </>
  );
};

export default NewAssignmentDtls;
