import * as React from "react";
import { useState } from "react";
import CerysButton from "../../CerysButton";
import { createIFAR, createRelTransIFA } from "../../../utils.ts/transactions/ifar-generation";
import { enterNL } from "../../../client-data-processing/nominal-ledger";

interface promptIFARCreationprops {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const PromptIFARCreation: React.FC<promptIFARCreationprops> = ({
  handleView,
  session,
  updateSession,
}: promptIFARCreationprops) => {
  const nLEntered = session["activeAssignment"]["NLEntered"];
  const [view, setView] = useState("main");

  const handleCreateRequest = () => {
    if (nLEntered) {
      createRelTransIFA(session);
      setView("confirm");
    } else {
      setView("NLPrompt");
    }
  };

  const handleNLImport = async () => {
    await enterNL(session, updateSession);
    createRelTransIFA(session);
    setView("confirm");
  };

  return (
    <>
      {view === "main" && (
        <>
          <p>Your data suggests this client owns intangible fixed assets.</p>
          <p>You have not set up a relevant asset register.</p>
          <p>Would you like to create one automatically?</p>
          <CerysButton buttonText={"CREATE IFA REGISTER"} handleView={() => handleCreateRequest()} />
        </>
      )}

      {view === "NLPrompt" && (
        <>
          <p>You have not yet imported a nominal ledger to support the current period's client data.</p>
          <p>This is required for auto-generation of an Intangible Fixed Assets Register.</p>
          <CerysButton buttonText={"IMPORT NOMINAL LEDGER NOW"} handleView={() => handleNLImport()} />
        </>
      )}
      {view === "confirm" && <CerysButton buttonText={"SUBMIT DETAILS"} handleView={() => createIFAR(session)} />}

      <CerysButton buttonText={"CONTINUE POSTING JOURNALS"} handleView={() => handleView("userLogin")} />
      <CerysButton buttonText={"ASSIGNMENT HOME"} handleView={() => handleView("customerSignUp")} />
    </>
  );
};

export default PromptIFARCreation;
