import * as React from "react";
import { useState } from "react";
import CerysButton from "../CerysButton";
import { cerysCodeToCerysObject } from "../../utils.ts/taskpane/cerys-item-retrieval";
import { fetchOptionsTransBatch } from "../../fetching/generateOptions";
import { postJournalBatch } from "../../fetching/apiEndpoints";
import { postTbToWbook, tbForPosting } from "../../utils.ts/trial-balance/tb-maintenance";
import { wsPLAccount } from "../../workbook views/workbook-templates/financial-statements/p&laccount";
import {
  addBsClickListener,
  addPlClickListener,
  addTbClickListener,
} from "../../utils.ts/worksheet-drilling/cerys-drilling";
import { wsBalanceSheet } from "../../workbook views/workbook-templates/financial-statements/balance-sheet";

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
    //const activeAssignment = session["activeAssignment"];
    const activeJournal = session["activeJournal"];
    const transactions = [];
    activeJournal.journals.forEach((jnl) => {
      const trans = {};
      (trans["cerysCode"] = jnl.code),
        (trans["cerysCategory"] = jnl.category),
        (trans["cerysSubCategory"] = jnl.subCategory),
        (trans["assetCategory"] = jnl.assetCategory),
        (trans["assetCategoryNo"] = jnl.assetCategoryNo),
        (trans["cerysName"] = jnl.name),
        (trans["cerysShortName"] = jnl.shortName),
        (trans["narrative"] = jnl.narrative),
        (trans["cerysId"] = jnl._id),
        (trans["value"] = jnl.journalValue),
        (trans["transactionDate"] = jnl.journalDate),
        (trans["clientNominalCode"] = jnl.clientNominalCode),
        (trans["transactionType"] = activeJournal.journalType),
        (trans["clientTB"] = activeJournal.clientTB),
        (trans["journal"] = activeJournal.journal);
      transactions.push(trans);
    });
    const transDtls = { customerId: session["customer"]["_id"], assignmentId: session["activeAssignment"]["_id"] };
    const options = fetchOptionsTransBatch(transactions, transDtls);
    const objsDb = await fetch(postJournalBatch, options);
    const objs = await objsDb.json();
    console.log(objs);
    session["customer"] = objs.customer;
    session["activeAssignment"] = objs.assignment;
    const tbArray = tbForPosting(session["activeAssignment"]["tb"]);
    await postTbToWbook(tbArray);
    await wsPLAccount(session);
    await wsBalanceSheet(session);
    addTbClickListener(session["activeAssignment"]);
    addPlClickListener(session["activeAssignment"]);
    addBsClickListener(session["activeAssignment"]);
    session["activeJournal"] = { journals: [], netValue: 0, journalType: "journal", journal: true, clientTB: false };
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
