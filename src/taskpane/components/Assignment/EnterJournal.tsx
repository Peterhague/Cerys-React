import * as React from "react";
import { useState } from "react";
import { useRef } from "react";
import CerysButton from "../CerysButton";
import { checkNewTransForAssets, processTransBatch } from "../../utils/transactions/transactions";
import NomCodeInput from "../Utils/NomCodeInput";
import { Session } from "../../classes/session";
import { ClientCerysCodeObject } from "../../interfaces/interfaces";
import { Journal } from "../../classes/journal";
import { LANDING_PAGE } from "../../static-values/views";
/*global Excel */

interface enterJournalProps {
  handleView: (view) => void;
  session: Session;
  chart: ClientCerysCodeObject[];
}

const EnterJournal = ({ handleView, session, chart }: enterJournalProps) => {
  const [nominalCode, setNominalCode] = useState("");
  const [nominalCodeName, setNominalCodeName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDisplay, setSearchDisplay] = useState("");
  const [value, setValue] = useState("");
  const [narrative, setNarrative] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e) => {
    try {
      await Excel.run(async (context) => {
        e.preventDefault();
        await processTransBatch(context, session);
        checkNewTransForAssets(session);
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleJournal = async (e) => {
    e.preventDefault();
    const cerysObj = session.chart.find((code) => code.cerysCode === parseInt(nominalCode));
    console.log(cerysObj);
    console.log(value);
    const journalDtls = {
      cerysCode: parseInt(nominalCode),
      value,
      narrative,
      transactionDate,
      transactionType: "journal",
      clientTB: false,
      journal: true,
    };
    console.log(journalDtls.value);
    console.log(parseFloat(journalDtls.value));
    session.activeJournal.journals.push(new Journal(session, journalDtls));
    session.activeJournal.netValue += parseFloat(journalDtls.value) * 100;
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
          chart={chart}
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
        {session.activeJournal.netValue !== 0 && (
          <p>Your journals are out of balance by {session.activeJournal.netValue / 100}</p>
        )}
        <div>
          <button onClick={handleJournal}>Next</button>
        </div>
        {session.activeJournal.netValue === 0 && session.activeJournal.journals.length > 0 && (
          <div>
            <button type="submit">Post</button>
          </div>
        )}
      </form>
      <CerysButton buttonText={"Return"} handleClick={() => handleView(LANDING_PAGE)} />
    </>
  );
};

export default EnterJournal;
