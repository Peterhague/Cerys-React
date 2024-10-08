import * as React from "react";
import { useState } from "react";
import CerysButton from "../../CerysButton";
import { enterNL } from "../../../client-data-processing/nominal-ledger";
import { createIPR, createRelTransIP } from "../../../utils.ts/transactions/ipr-generation";

interface promptIPRCreationProps {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const PromptIPRCreation: React.FC<promptIPRCreationProps> = ({
  handleView,
  session,
  updateSession,
}: promptIPRCreationProps) => {
  const nLEntered = session["activeAssignment"]["NLEntered"];
  const tBEntered = session["activeAssignment"]["TBEntered"];
  const [view, setView] = useState("main");
  const journal = session["activeJournal"]["journal"];

  const handleCreateRequest = () => {
    if (nLEntered || !tBEntered) {
      createRelTransIP(session);
      setView("confirm");
    } else {
      setView("NLPrompt");
    }
  };

  const handleNLImport = async () => {
    await enterNL(session, updateSession);
    createRelTransIP(session);
    setView("confirm");
  };

  const handleAbort = (view) => {
    session["activeJournal"] = { journals: [], netValue: 0, journalType: "journal", journal: true, clientTB: false };
    handleView(view);
  };

  const handleSubmit = () => {
    session["activeJournal"] = { journals: [], netValue: 0, journalType: "journal", journal: true, clientTB: false };
    createIPR(session);
  };

  return (
    <>
      {view === "main" && (
        <>
          <p>Your data suggests this client owns investment property.</p>
          <p>You have not set up a relevant asset register.</p>
          <p>Would you like to create one automatically?</p>
          <CerysButton buttonText={"CREATE IP REGISTER"} handleView={() => handleCreateRequest()} />
        </>
      )}

      {view === "NLPrompt" && (
        <>
          <p>You have not yet imported a nominal ledger to support the current period's client data.</p>
          <p>This is required for auto-generation of an Investment Property Register.</p>
          <CerysButton buttonText={"IMPORT NOMINAL LEDGER NOW"} handleView={() => handleNLImport()} />
        </>
      )}
      {view === "confirm" && <CerysButton buttonText={"SUBMIT DETAILS"} handleView={() => handleSubmit()} />}
      {journal && (
        <CerysButton buttonText={"CONTINUE POSTING JOURNALS"} handleView={() => handleAbort("enterJournal")} />
      )}

      <CerysButton buttonText={"ASSIGNMENT HOME"} handleView={() => handleAbort("assignmentDashHome")} />
    </>
  );
};

export default PromptIPRCreation;
