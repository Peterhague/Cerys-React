import * as React from "react";
import { useState } from "react";
import CerysButton from "../../CerysButton";
interface addCorpClientDtlsProps {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const AddCorpClientDtls: React.FC<addCorpClientDtlsProps> = ({
  updateSession,
  handleView,
  session,
}: addCorpClientDtlsProps) => {
  const [clientCode, setClientCode] = useState("");
  const [clientName, setClientName] = useState("");
  const [reportingPeriod, setReportingPeriod] = useState("");
  const [companyNumber, setCompanyNumber] = useState("");
  const [senior, setSenior] = useState("");
  const [manager, setManager] = useState("");
  const [rI, setRI] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newClientDtls = { clientCode, clientName, reportingPeriod, companyNumber, senior, manager, rI };
    //session["newCorpClientDtls"] = newClientDtls;
    //session["newCorpClientShareClasses"] = [];
    session["newClientPrelim"] = newClientDtls;
    session["newClientPrelim"]["shareClasses"] = [];
    session["newClientPrelim"]["directors"] = [];
    session["newClientPrelim"]["shareholders"] = [];
    session["newClientPrelim"]["newIndividuals"] = [];
    session["newClientPrelim"]["existingIndividuals"] = [];
    updateSession(session);
    console.log(session);
    handleView("addCorpClientShares");
  };

  return (
    <>
      <form onSubmit={handleSubmit} id="addClientForm" action="">
        <h3>Add Client</h3>
        <div>
          <input
            name="clientCode"
            type="text"
            id="clientCode"
            className="form-control"
            placeholder="Enter client code..."
            value={clientCode}
            onChange={(e) => setClientCode(e.target.value)}
          ></input>
        </div>
        <div>
          <input
            name="clientName"
            type="text"
            id="clientName"
            className="form-control"
            placeholder="Enter client name..."
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          ></input>
        </div>
        <div>
          <input
            name="yearEnd"
            type="date"
            id="yearEnd"
            className="form-control"
            placeholder=""
            value={reportingPeriod}
            onChange={(e) => setReportingPeriod(e.target.value)}
          ></input>
        </div>
        <div>
          <input
            name="companyNumber"
            type="text"
            id="companyNumber"
            className="form-control"
            placeholder="Enter company number..."
            value={companyNumber}
            onChange={(e) => setCompanyNumber(e.target.value)}
          ></input>
        </div>
        {session["customer"]["users"].length > 0 && (
          <div>
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
          <button type="submit">Add share classes</button>
        </div>
      </form>
      <CerysButton buttonText={"Return"} handleView={() => handleView("landingPage")} />
    </>
  );
};

export default AddCorpClientDtls;
