import * as React from "react";
import { useState } from "react";
import CerysButton from "../../CerysButton";
import { Session } from "../../../classes/session";

interface addCorpClientSharesProps {
  handleView: (view) => void;
  session: Session;
}

const AddCorpClientShares = ({ handleView, session }: addCorpClientSharesProps) => {
  const [shareClassName, setShareClassName] = useState("");
  const [numberIssued, setNumberIssued] = useState(0);
  const [nomValue, setNomValue] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newClientShares = {
      shareClassName,
      numberIssued,
      nomValue,
      shareClassNumber: session.newClientPrelim.shareClasses.length + 1,
      issuedNotAllocated: numberIssued,
      prelimAllocation: 0,
    };
    session.newClientPrelim.shareClasses.push(newClientShares);
    handleView("addCorpClientOptions");
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
            value={numberIssued !== 0 && numberIssued}
            onChange={(e) =>
              parseInt(e.target.value) ? setNumberIssued(parseInt(e.target.value)) : setNumberIssued(0)
            }
          ></input>
        </div>
        <div>
          <input
            name="nomValue"
            type="number"
            id="nomValue"
            className="form-control"
            placeholder="Value per share"
            value={nomValue !== 0 && nomValue}
            onChange={(e) => (parseInt(e.target.value) ? setNomValue(parseInt(e.target.value)) : setNomValue(0))}
          ></input>
        </div>

        <div>
          <button type="submit">Submit class</button>
        </div>
      </form>
      <CerysButton buttonText={"Return"} handleClick={() => handleView("landingPage")} />
    </>
  );
};

export default AddCorpClientShares;
