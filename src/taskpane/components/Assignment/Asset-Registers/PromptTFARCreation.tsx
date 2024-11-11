import * as React from "react";
import { useState } from "react";
import { enterNL } from "../../../client-data-processing/nominal-ledger";
import { updateAssignmentFigures } from "../../../utils.ts/helperFunctions";
import { identifyLikelyAdditions, previewRelTrans } from "../../../utils.ts/transactions/asset-reg-generation";
import { createTFAR } from "../../../utils.ts/transactions/tfar-generation";
import {
  checkNewTransForAssets,
  processTransBatch,
  processUpdateBatch,
} from "../../../utils.ts/transactions/transactions";
import CerysButton from "../../CerysButton";

interface promptTFARCreationProps {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const PromptTFARCreation: React.FC<promptTFARCreationProps> = ({
  handleView,
  session,
  updateSession,
}: promptTFARCreationProps) => {
  //const [nLEntered, setNLEntered] = useState(session["activeAssignment"]["NLEntered"]);
  let nLEntered = session["activeAssignment"]["NLEntered"];
  const tBEntered = session["activeAssignment"]["TBEntered"];
  const [view, setView] = useState(session["options"].TFARCreationSetting);
  const journal = session["activeJournal"]["journal"];
  const registerType = "TFA";
  const registerCreated = session["activeAssignment"].TFARegisterCreated;
  console.log(nLEntered);
  console.log(view);

  const handleCreateRequest = () => {
    if (nLEntered || !tBEntered) {
      identifyLikelyAdditions(session, registerType, setView);
    } else {
      setView("NLPrompt");
    }
  };

  const handleNLImport = async () => {
    console.log("NL import triggered");
    await enterNL(session, updateSession);
    //setNLEntered(session["activeAssignment"]["NLEntered"]);
    nLEntered = session["activeAssignment"]["NLEntered"];
    handleCreateRequest();
  };

  const handleAbort = (view) => {
    session["options"].TFARCreationSetting = "main";
    session["activeJournal"].journals = [];
    handleView(view);
  };

  const handleSubmit = async () => {
    session["options"].TFARCreationSetting = "main";
    await createTFAR(session);
    session["TFATransactions"] = [];
    session["activeJournal"].clientTB = false;
    session["activeJournal"].journal = false;
    session["activeJournal"].journalType = "auto-journal";
    await processTransBatch(session);
    checkNewTransForAssets(session, session["newFATransactions"]);
  };

  const handleReanalysis = async () => {
    await processUpdateBatch(session);
    await updateAssignmentFigures(session);
    previewRelTrans(session, registerType, setView);
  };

  return (
    <>
      {view === "main" && !registerCreated && (
        <>
          <p>Your data suggests this client owns tangible fixed assets.</p>
          <p>You have not set up a relevant asset register.</p>
          <p>Would you like to create one automatically?</p>
          <CerysButton buttonText={"CREATE TFA REGISTER"} handleView={() => handleCreateRequest()} />
        </>
      )}
      {view === "main" && registerCreated && (
        <>
          <p>Update your Tangible Fixed Assets Register for new transactions?</p>
          <CerysButton buttonText={"UPDATE TFA REGISTER"} handleView={() => handleCreateRequest()} />
        </>
      )}

      {view === "NLPrompt" && (
        <>
          <p>You have not yet imported a nominal ledger to support the current period's client data.</p>
          <p>This is required for auto-generation of a Tangible Fixed Assets Register.</p>
          <CerysButton buttonText={"IMPORT NOMINAL LEDGER NOW"} handleView={() => handleNLImport()} />
        </>
      )}

      {view === "confirmBFAreAddns" && (
        <>
          <p>These transactions were posted as b/fwd balances but from their dates would appear to be additions.</p>
          <p>Would you like to repost them as additions?</p>
          <CerysButton buttonText={"REPOST AS ADDITIONS"} handleView={() => handleReanalysis()} />
          <CerysButton buttonText={"NO THANKS"} handleView={() => previewRelTrans(session, registerType, setView)} />
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
