import * as React from "react";
import { useState } from "react";
import CerysButton from "../../CerysButton";
import { Session } from "../../../classes/session";
import { ADD_INDI_CLIENT_ASSOC_OPTIONS, LANDING_PAGE } from "../../../static-values/views";
import { Directorship } from "../../../classes/individuals";

interface addIndiClientAssocDirProps {
  session: Session;
}

const AddIndiClientAssocDir = ({ session }: addIndiClientAssocDirProps) => {
  const [clientId, setClientId] = useState("");
  const [dateAppointed, setDateAppointed] = useState("");
  const [isCeased, setIsCeased] = useState(false);
  const [dateCeased, setDateCeased] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const directorship = new Directorship(clientId, dateAppointed, dateCeased, session);
    session.newIndiPrelim._clientDirectorships.push(directorship);
    session.handleView(ADD_INDI_CLIENT_ASSOC_OPTIONS);
  };

  return (
    <>
      <form onSubmit={handleSubmit} id="addClientForm" action="">
        <h3>Add New Individual</h3>
        <>
          <div>
            <select
              name="client"
              id="client"
              title="client"
              className="form-control"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            >
              {!clientId && <option>Please select</option>}
              {session.customer.clients.map((client) => (
                <option key={client.clientId} value={client.clientId}>
                  {client.clientName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="dateAppointed">Date appointed</label>
            <input
              name="dateAppointed"
              type="date"
              id="dateAppointed"
              className="form-control"
              value={dateAppointed}
              onChange={(e) => setDateAppointed(e.target.value)}
            ></input>
          </div>
          <div>
            <label htmlFor="isCeased">No longer in office?</label>
            <input
              type="checkbox"
              id="isCeased"
              name="isCeased"
              checked={isCeased}
              onChange={(e) => setIsCeased(e.target.checked)}
            ></input>
          </div>
          {isCeased && (
            <div>
              <input
                name="dateCeased"
                type="date"
                id="dateCeased"
                title="date ceased"
                className="form-control"
                value={dateCeased}
                onChange={(e) => setDateCeased(e.target.value)}
              ></input>
            </div>
          )}

          <div>
            <button type="submit">Submit details</button>
          </div>
        </>
      </form>
      <CerysButton buttonText={"Return"} handleClick={() => session.handleView(LANDING_PAGE)} />
    </>
  );
};

export default AddIndiClientAssocDir;
