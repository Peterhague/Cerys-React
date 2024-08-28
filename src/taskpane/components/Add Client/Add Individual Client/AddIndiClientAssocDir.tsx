import * as React from "react";
import { useState } from "react";
import CerysButton from "../../CerysButton";
interface addIndiClientAssocDirprops {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const AddIndiClientAssocDir: React.FC<addIndiClientAssocDirprops> = ({
  updateSession,
  handleView,
  session,
}: addIndiClientAssocDirprops) => {
  const [client, setClient] = useState("");
  const [dateAppointed, setDateAppointed] = useState("");
  const [isCeased, setIsCeased] = useState(false);
  const [dateCeased, setDateCeased] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const directorship = {
      client,
      dateAppointed,
      dateCeased,
    };
    updateSession(session);
    console.log(directorship);
    //const route = session["customer"]["clients"].length > 0 ? "addIndiClientAssocOptions" : "customerDashHome";
    //handleView(route);
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
              className="form-control"
              value={client}
              onChange={(e) => setClient(e.target.value)}
            >
              {!client && <option>Please select</option>}
              {session["customer"]["clients"].map((client) => (
                <option key={client._id} value={client._id}>
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
      <CerysButton buttonText={"Return"} handleView={() => handleView("landingPage")} />
    </>
  );
};

export default AddIndiClientAssocDir;
