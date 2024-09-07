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
  const [view, setView] = useState("main");

  const handleCreateRequest = () => {
    if (nLEntered) {
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
      {view === "confirm" && <CerysButton buttonText={"SUBMIT DETAILS"} handleView={() => createTFAR(session)} />}

      <CerysButton buttonText={"CONTINUE POSTING JOURNALS"} handleView={() => handleView("userLogin")} />
      <CerysButton buttonText={"ASSIGNMENT HOME"} handleView={() => handleView("customerSignUp")} />
    </>
  );
};

export default PromptTFARCreation;
