import * as React from "react";
import { useState } from "react";
import { useRef } from "react";
import CerysButton from "../CerysButton";
import { cerysCodeToCerysObject } from "../../utils.ts/taskpane/cerys-item-retrieval";
import { checkNewTransForAssets, processTransBatch } from "../../utils.ts/transactions/transactions";
import NomCodeInput from "../Utils/NomCodeInput";

interface enterJournalProps {
  handleView: (view) => void;
  session: {};
}

const EnterJournal: React.FC<enterJournalProps> = ({ handleView, session }: enterJournalProps) => {
  const [nominalCode, setNominalCode] = useState("");
  const [nominalCodeName, setNominalCodeName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDisplay, setSearchDisplay] = useState("");
  const [value, setValue] = useState("");
  const [narrative, setNarrative] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newTransactions = await processTransBatch(session);
    checkNewTransForAssets(session, newTransactions);
  };

  const handleJournal = async (e) => {
    e.preventDefault();
    const cerysObj = await cerysCodeToCerysObject(nominalCode);
    const journalDtls = { ...cerysObj, value: parseInt(value) * 100, narrative, transactionDate };
    session["activeJournal"].journals.push(journalDtls);
    session["activeJournal"].netValue += journalDtls.value;
    setNominalCode("");
    setNominalCodeName("");
    setSearchTerm("");
    setSearchDisplay("");
    setValue("");
    setNarrative("");
    setTransactionDate("");
    inputRef.current.focus();
  };

  return (
    <>
      <form onSubmit={handleSubmit} id="journalForm" action="">
        <h3>Enter journal</h3>
        <NomCodeInput
          ref={inputRef}
          session={session}
          nominalCode={nominalCode}
          setNominalCode={setNominalCode}
          nominalCodeName={nominalCodeName}
          setNominalCodeName={setNominalCodeName}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchDisplay={searchDisplay}
          setSearchDisplay={setSearchDisplay}
        />
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
      <CerysButton buttonText={"Return"} handleClick={() => handleView("landingPage")} />
    </>
  );
};

export default EnterJournal;
