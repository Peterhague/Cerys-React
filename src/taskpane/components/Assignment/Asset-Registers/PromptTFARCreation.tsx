import * as React from "react";
import { useState } from "react";
import CerysButton from "../../CerysButton";
import { enterNL } from "../../../client-data-processing/nominal-ledger";
import { createTFAR } from "../../../utils.ts/transactions/tfar-generation";
import { checkAssetRegStatus, processTransBatch } from "../../../utils.ts/transactions/transactions";
import { getWorksheet } from "../../../utils.ts/worksheet";
import { createRelTrans } from "../../../utils.ts/transactions/asset-reg-generation";
import { setNextViewButOne } from "../../../utils.ts/helperFunctions";

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
  const nLEntered = session["activeAssignment"]["NLEntered"];
  const tBEntered = session["activeAssignment"]["TBEntered"];
  const [view, setView] = useState(session["options"].TFARCreationSetting);
  const journal = session["activeJournal"]["journal"];

  setNextViewButOne(session);

  const handleCreateRequest = () => {
    if (nLEntered || !tBEntered) {
      //createRelTransTFA(session, setView);
      createRelTrans(session, "TFA");
      setView("confirm");
      session["options"].TFARCreationSetting = "confirm";
    } else {
      setView("NLPrompt");
    }
  };

  const handleNLImport = async () => {
    await enterNL(session, updateSession);
    //createRelTransTFA(session, setView);
    createRelTrans(session, "TFA");
    setView("confirm");
    session["options"].TFARCreationSetting = "confirm";
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
    checkAssetRegStatus(session, handleView);
  };

  const simulateChange = async () => {
    try {
      await Excel.run(async (context) => {
        console.log("running");
        const ws = getWorksheet(context, "TFA Transactions");
        const range = ws.getRange("D3:D3");
        range.values = [["5202"]];
        await context.sync();
      });
    } catch (e) {
      console.error(e);
    }
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

      {view === "confirmBFAreAddns" && (
        <>
          <p>These transactions were posted as b/fwd balances but from their dates would appear to be additions.</p>
          <p>Would you like to repost them as additions?</p>
          <CerysButton buttonText={"REPOST AS ADDITIONS"} handleView={() => simulateChange()} />
          <CerysButton buttonText={"NO THANKS"} handleView={() => handleNLImport()} />
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
