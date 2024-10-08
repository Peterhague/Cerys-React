import * as React from "react";
import { useState } from "react";
import CerysButton from "../CerysButton";
import { cerysCodeToCerysObject } from "../../utils.ts/taskpane/cerys-item-retrieval";
import { checkAssetRegStatus, processTransBatch } from "../../utils.ts/transactions/transactions";

interface enterJournalProps {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const EnterJournal: React.FC<enterJournalProps> = ({ updateSession, handleView, session }: enterJournalProps) => {
  const [nominalCode, setNominalCode] = useState("");
  const [value, setValue] = useState("");
  const [narrative, setNarrative] = useState("");
  const [transactionDate, setTransactionDate] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    session["nextView"] = "assignmentDashHome";
    await processTransBatch(session);
    checkAssetRegStatus(session, handleView);
    updateSession(session);
  };

  const handleJournal = async (e) => {
    e.preventDefault();
    const cerysObj = await cerysCodeToCerysObject(nominalCode);
    const journalDtls = { ...cerysObj, value: parseInt(value) * 100, narrative, transactionDate };
    session["activeJournal"].journals.push(journalDtls);
    session["activeJournal"].netValue += journalDtls.value;
    updateSession(session);
    setNominalCode("");
    setValue("");
    setNarrative("");
    setTransactionDate("");
  };

  return (
    <>
      <form onSubmit={handleSubmit} id="journalForm" action="">
        <h3>Enter journal</h3>
        <div>
          <input
            name="nominalCode"
            type="text"
            id="nominalCode"
            className="form-control"
            placeholder="Enter nominal code"
            value={nominalCode}
            onChange={(e) => setNominalCode(e.target.value)}
          ></input>
        </div>
        <div>
          <input
            name="value"
            type="number"
            id="value"
            className="form-control"
            placeholder="Enter journal value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          ></input>
        </div>
        <div>
          <input
            name="narrative"
            type="text"
            id="narrative"
            className="form-control"
            placeholder="Enter journal narrative"
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
          ></input>
        </div>
        <div>
          <input
            name="transactionDate"
            type="date"
            id="transactionDate"
            className="form-control"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
          ></input>
        </div>
        {session["activeJournal"].netValue !== 0 && (
          <p>Your journals are out of balance by {session["activeJournal"].netValue / 100}</p>
        )}
        <div>
          <button onClick={handleJournal}>Next</button>
        </div>
        {session["activeJournal"].netValue === 0 && session["activeJournal"].journals.length > 0 && (
          <div>
            <button type="submit">Post</button>
          </div>
        )}
      </form>
      <CerysButton buttonText={"Return"} handleView={() => handleView("landingPage")} />
    </>
  );
};

export default EnterJournal;
