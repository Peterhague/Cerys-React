import * as React from "react";
import { useState } from "react";
import CerysButton from "../CerysButton";
import { cerysCodeToCerysObject } from "../../utils.ts/taskpane/cerys-item-retrieval";
import { processTransBatch } from "../../utils.ts/transactions/transactions";

interface enterJournalProps {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const EnterJournal: React.FC<enterJournalProps> = ({ updateSession, handleView, session }: enterJournalProps) => {
  const [nominalCode, setNominalCode] = useState("");
  const [journalValue, setJournalValue] = useState("");
  const [narrative, setNarrative] = useState("");
  const [journalDate, setJournalDate] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await processTransBatch(session);
    updateSession(session);
    handleView("assignmentDashHome");
  };

  const handleJournal = async (e) => {
    e.preventDefault();
    const cerysObj = await cerysCodeToCerysObject(nominalCode);
    const journalDtls = { ...cerysObj, journalValue: parseInt(journalValue), narrative, journalDate };
    session["activeJournal"].journals.push(journalDtls);
    session["activeJournal"].netValue += journalDtls.journalValue;
    updateSession(session);
    setNominalCode("");
    setJournalValue("");
    setNarrative("");
    setJournalDate("");
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
            name="journalValue"
            type="number"
            id="journalValue"
            className="form-control"
            placeholder="Enter journal value"
            value={journalValue}
            onChange={(e) => setJournalValue(e.target.value)}
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
            name="journalDate"
            type="date"
            id="journalDate"
            className="form-control"
            value={journalDate}
            onChange={(e) => setJournalDate(e.target.value)}
          ></input>
        </div>
        {session["activeJournal"].netValue !== 0 && (
          <p>Your journals are out of balance by {session["activeJournal"].netValue}</p>
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
