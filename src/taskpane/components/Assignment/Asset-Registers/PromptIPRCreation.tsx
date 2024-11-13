import * as React from "react";
import { useState } from "react";
import CerysButton from "../../CerysButton";
import { enterNL } from "../../../client-data-processing/nominal-ledger";
import { createIPR } from "../../../utils.ts/transactions/ipr-generation";
import { identifyLikelyAdditions, previewRelTrans } from "../../../utils.ts/transactions/asset-reg-generation";
import {
  checkNewTransForAssets,
  processTransBatch,
  processUpdateBatch,
} from "../../../utils.ts/transactions/transactions";
import { updateAssignmentFigures } from "../../../utils.ts/helperFunctions";

interface promptIPRCreationProps {
  handleView: (view) => void;
  session: {};
}

const PromptIPRCreation: React.FC<promptIPRCreationProps> = ({ handleView, session }: promptIPRCreationProps) => {
  const nLEntered = session["activeAssignment"]["NLEntered"];
  const tBEntered = session["activeAssignment"]["TBEntered"];
  const [view, setView] = useState(session["options"].IPRCreationSetting);
  const journal = session["activeJournal"]["journal"];
  const registerType = "IP";
  const registerCreated = session["activeAssignment"].IPRegisterCreated;

  const handleCreateRequest = () => {
    if (nLEntered || !tBEntered) {
      identifyLikelyAdditions(session, registerType, setView);
    } else {
      setView("NLPrompt");
    }
  };

  const handleNLImport = async () => {
    await enterNL(session);
    handleCreateRequest();
  };

  const handleAbort = (view) => {
    session["options"].IPRCreationSetting = "main";
    session["activeJournal"].journals = [];
    handleView(view);
  };

  const handleSubmit = async () => {
    session["options"].IPRCreationSetting = "main";
    await createIPR(session);
    session["IPTransactions"] = [];
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
          <p>Your data suggests this client owns investment property.</p>
          <p>You have not set up a relevant asset register.</p>
          <p>Would you like to create one automatically?</p>
          <CerysButton buttonText={"CREATE IP REGISTER"} handleView={() => handleCreateRequest()} />
        </>
      )}
      {view === "main" && registerCreated && (
        <>
          <p>Update your Investment Property Register for new transactions?</p>
          <CerysButton buttonText={"UPDATE IP REGISTER"} handleView={() => handleCreateRequest()} />
        </>
      )}

      {view === "NLPrompt" && (
        <>
          <p>You have not yet imported a nominal ledger to support the current period's client data.</p>
          <p>This is required for auto-generation of an Investment Property Register.</p>
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

export default PromptIPRCreation;
