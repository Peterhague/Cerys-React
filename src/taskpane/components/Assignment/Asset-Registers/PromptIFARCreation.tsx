import * as React from "react";
import { useState } from "react";
import CerysButton from "../../CerysButton";
import { createIFAR } from "../../../utils.ts/transactions/ifar-generation";
import { enterNL } from "../../../client-data-processing/nominal-ledger";
import { checkAssetRegStatus, processTransBatch } from "../../../utils.ts/transactions/transactions";
import { setNextViewButOne } from "../../../utils.ts/helperFunctions";
import { createRelTrans } from "../../../utils.ts/transactions/asset-reg-generation";

interface promptIFARCreationProps {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const PromptIFARCreation: React.FC<promptIFARCreationProps> = ({
  handleView,
  session,
  updateSession,
}: promptIFARCreationProps) => {
  const nLEntered = session["activeAssignment"]["NLEntered"];
  const tBEntered = session["activeAssignment"]["TBEntered"];
  const [view, setView] = useState(session["options"].IFARCreationSetting);
  const journal = session["activeJournal"]["journal"];

  setNextViewButOne(session);

  const handleCreateRequest = () => {
    if (nLEntered || !tBEntered) {
      //createRelTransIFA(session);
      createRelTrans(session, "IFA");
      setView("confirm");
      session["options"].IFARCreationSetting = "confirm";
    } else {
      setView("NLPrompt");
    }
  };

  const handleNLImport = async () => {
    await enterNL(session, updateSession);
    //createRelTransIFA(session);
    createRelTrans(session, "IFA");
    setView("confirm");
    session["options"].IFARCreationSetting = "confirm";
  };

  const handleAbort = (view) => {
    session["options"].IFARCreationSetting = "main";
    session["activeJournal"].journals = [];
    handleView(view);
  };

  const handleSubmit = async () => {
    session["options"].IFARCreationSetting = "main";
    await createIFAR(session);
    session["IFATransactions"] = [];
    session["activeJournal"].clientTB = false;
    session["activeJournal"].journal = false;
    session["activeJournal"].journalType = "auto-journal";
    await processTransBatch(session);
    checkAssetRegStatus(session, handleView);
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
      {view === "confirm" && <CerysButton buttonText={"SUBMIT DETAILS"} handleView={() => handleSubmit()} />}
      {journal && (
        <CerysButton buttonText={"CONTINUE POSTING JOURNALS"} handleView={() => handleAbort("enterJournal")} />
      )}

      <CerysButton buttonText={"ASSIGNMENT HOME"} handleView={() => handleAbort("assignmentDashHome")} />
    </>
  );
};

export default PromptIFARCreation;
