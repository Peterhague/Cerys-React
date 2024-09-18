import * as React from "react";
import { useState } from "react";
import CerysButton from "../../CerysButton";
import { enterNL } from "../../../client-data-processing/nominal-ledger";
import { createRelTransTFA, createTFAR } from "../../../utils.ts/transactions/tfar-generation";

interface promptTFARCreationprops {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const PromptTFARCreation: React.FC<promptTFARCreationprops> = ({
  handleView,
  session,
  updateSession,
}: promptTFARCreationprops) => {
  const nLEntered = session["activeAssignment"]["NLEntered"];
  const tBEntered = session["activeAssignment"]["TBEntered"];
  const [view, setView] = useState("main");
  const journal = session["activeJournal"]["journal"];

  const handleCreateRequest = () => {
    if (nLEntered || !tBEntered) {
      createRelTransTFA(session);
      setView("confirm");
    } else {
      setView("NLPrompt");
    }
  };

  const handleNLImport = async () => {
    await enterNL(session, updateSession);
    createRelTransTFA(session);
    setView("confirm");
  };

  const handleAbort = (view) => {
    session["activeJournal"] = { journals: [], netValue: 0, journalType: "journal", journal: true, clientTB: false };
    handleView(view);
  };

  const handleSubmit = () => {
    session["activeJournal"] = { journals: [], netValue: 0, journalType: "journal", journal: true, clientTB: false };
    createTFAR(session);
  };

  return (
    <>
      {view === "main" && (
        <>
          <p>Your data suggests this client owns tangible fixed assets.</p>
          <p>You have not set up a relevant asset register.</p>
          <p>Would you like to create one automatically?</p>
          <CerysButton buttonText={"CREATE TFA REGISTER"} handleView={() => handleCreateRequest()} />
        </>
      )}

      {view === "NLPrompt" && (
        <>
          <p>You have not yet imported a nominal ledger to support the current period's client data.</p>
          <p>This is required for auto-generation of a Tangible Fixed Assets Register.</p>
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

export default PromptTFARCreation;
