import * as React from "react";
import { useState } from "react";
import { enterNL } from "../../../client-data-processing/nominal-ledger";
import { getUpdatedTransactions, updateAssignmentFigures } from "../../../utils.ts/helperFunctions";
import {
  convertNewFATrans,
  finaliseAssetObjects,
  identifyLikelyAdditions,
  previewRelTrans,
} from "../../../utils.ts/transactions/asset-reg-generation";
import { createTFAR } from "../../../utils.ts/transactions/tfar-generation";
import {
  checkFATranUpdatesForAssets,
  checkNewTransForAssets,
  processTransBatch,
  processUpdateBatch,
} from "../../../utils.ts/transactions/transactions";
import CerysButton from "../../CerysButton";
import { Session } from "../../../classes/session";
/* global Excel */

interface promptTFARCreationProps {
  handleView: (view) => void;
  session: Session;
}

const PromptTFARCreation = ({ handleView, session }: promptTFARCreationProps) => {
  let nLEntered = session.activeAssignment.NLEntered;
  const tBEntered = session.activeAssignment.TBEntered;
  const [view, setView] = useState(session.options.TFARCreationSetting);
  const journal = session.activeJournal.journal;
  const registerType = "TFA";
  const registerCreated = session.activeAssignment.TFARegisterCreated;

  const handleCreateRequest = () => {
    if (nLEntered || !tBEntered) {
      identifyLikelyAdditions(session, registerType, setView);
    } else {
      setView("NLPrompt");
    }
  };

  const handleNLImport = async () => {
    await enterNL(session);
    convertNewFATrans(session);
    nLEntered = session.activeAssignment.NLEntered;
    handleCreateRequest();
  };

  const handleAbort = (view) => {
    session.options.TFARCreationSetting = "main";
    session.activeJournal.journals = [];
    handleView(view);
  };

  const handleSubmit = async () => {
    try {
      await Excel.run(async (context) => {
        session["options"].TFARCreationSetting = "main";
        finaliseAssetObjects(session, registerType);
        await createTFAR(context, session);
        session.TFATransactions = [];
        session.activeJournal.clientTB = false;
        session.activeJournal.journal = false;
        session.activeJournal.journalType = "auto-journal";
        await processTransBatch(context, session);
        checkNewTransForAssets(session, session["newFATransactions"]);
        await context.sync();
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleReanalysis = async () => {
    try {
      await Excel.run(async (context) => {
        if (getUpdatedTransactions(session).length > 0) {
          const updatedTransactions = await processUpdateBatch(session);
          updateAssignmentFigures(context, session);
          checkFATranUpdatesForAssets(session, updatedTransactions);
        }
        if (session.activeJournal.journals.length > 0) {
          const newTransactions = await processTransBatch(context, session);
          checkFATranUpdatesForAssets(session, newTransactions);
        }
        previewRelTrans(session, registerType, setView);
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {view === "main" && !registerCreated && (
        <>
          <p>Your data suggests this client owns tangible fixed assets.</p>
          <p>You have not set up a relevant asset register.</p>
          <p>Would you like to create one automatically?</p>
          <CerysButton buttonText={"CREATE TFA REGISTER"} handleClick={() => handleCreateRequest()} />
        </>
      )}
      {view === "main" && registerCreated && (
        <>
          <p>Update your Tangible Fixed Assets Register for new transactions?</p>
          <CerysButton buttonText={"UPDATE TFA REGISTER"} handleClick={() => handleCreateRequest()} />
        </>
      )}

      {view === "NLPrompt" && (
        <>
          <p>You have not yet imported a nominal ledger to support the current period's client data.</p>
          <p>This is required for auto-generation of a Tangible Fixed Assets Register.</p>
          <CerysButton buttonText={"IMPORT NOMINAL LEDGER NOW"} handleClick={() => handleNLImport()} />
        </>
      )}

      {view === "confirmBFAreAddns" && (
        <>
          <p>These transactions were posted as b/fwd balances but from their dates would appear to be additions.</p>
          <p>Would you like to repost them as additions?</p>
          <CerysButton buttonText={"REPOST AS ADDITIONS"} handleClick={() => handleReanalysis()} />
          <CerysButton buttonText={"NO THANKS"} handleClick={() => previewRelTrans(session, registerType, setView)} />
        </>
      )}
      {view === "confirm" && <CerysButton buttonText={"SUBMIT DETAILS"} handleClick={() => handleSubmit()} />}
      {journal && (
        <CerysButton buttonText={"CONTINUE POSTING JOURNALS"} handleClick={() => handleAbort("enterJournal")} />
      )}

      <CerysButton buttonText={"ASSIGNMENT HOME"} handleClick={() => handleAbort("assignmentDashHome")} />
    </>
  );
};

export default PromptTFARCreation;
