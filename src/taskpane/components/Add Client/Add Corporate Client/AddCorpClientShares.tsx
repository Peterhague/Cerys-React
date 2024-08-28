import * as React from "react";
import { useState } from "react";
import CerysButton from "../../CerysButton";
import { fetchOptionsAddClientPrelim } from "../../../fetching/generateOptions";
import { addClientPrelimUrl } from "../../../fetching/apiEndpoints";
interface addCorpClientSharesProps {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const AddCorpClientShares: React.FC<addCorpClientSharesProps> = ({
  updateSession,
  handleView,
  session,
}: addCorpClientSharesProps) => {
  const [shareClassName, setShareClassName] = useState("");
  const [numberIssued, setNumberIssued] = useState("");
  const [nomValue, setNomValue] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newClientShares = { shareClassName, numberIssued, nomValue };
    newClientShares["issuedNotAllocated"] = newClientShares["numberIssued"];
    session["newCorpClientShareClasses"].push(newClientShares);
    const newClientPrelim = {};
    newClientPrelim["details"] = session["newCorpClientDtls"];
    newClientPrelim["shareClasses"] = session["newCorpClientShareClasses"];
    const newClientPrelimDb = await processNewClientPrelim(newClientPrelim);
    session["newClientPrelim"] = newClientPrelimDb;
    delete session["newCorpClientDtls"];
    delete session["newCorpClientShareClasses"];
    updateSession(session);
    console.log(session);
    handleView("addCorpClientOptions");
  };

  const processNewClientPrelim = async (newClientPrelim) => {
    const options = fetchOptionsAddClientPrelim(newClientPrelim, session["customer"]["_id"]);
    console.log(options);
    const newClientPrelimFromDb = await fetch(addClientPrelimUrl, options);
    const newClient = await newClientPrelimFromDb.json();
    console.log(newClient);
    return newClient;
  };

  return (
    <>
      <form onSubmit={handleSubmit} id="addClientForm" action="">
        <h3>Add Share Classes</h3>
        <div>
          <input
            name="shareClassName"
            type="text"
            id="shareClassName"
            className="form-control"
            placeholder="Share class name"
            value={shareClassName}
            onChange={(e) => setShareClassName(e.target.value)}
          ></input>
        </div>
        <div>
          <input
            name="numberIssued"
            type="number"
            id="numberIssued"
            className="form-control"
            placeholder="Number of shares issued"
            value={numberIssued}
            onChange={(e) => setNumberIssued(e.target.value)}
          ></input>
        </div>
        <div>
          <input
            name="nomValue"
            type="number"
            id="nomValue"
            className="form-control"
            placeholder="Value per share"
            value={nomValue}
            onChange={(e) => setNomValue(e.target.value)}
          ></input>
        </div>

        <div>
          <button type="submit">Submit class</button>
        </div>
      </form>
      <CerysButton buttonText={"Return"} handleView={() => handleView("landingPage")} />
    </>
  );
};

export default AddCorpClientShares;
