import * as React from "react";
import { useState } from "react";
import { enterNL } from "../../../client-data-processing/nominal-ledger";
import { getUpdatedTransactions, updateAssignmentFigures } from "../../../utils/helper-functions";
import {
  convertNewFATrans,
  identifyLikelyAdditions,
  previewRelTrans,
} from "../../../utils/transactions/asset-reg-generation";
import {
  checkFATranUpdatesForAssets,
  checkNewTransForAssets,
  processUpdateBatch,
} from "../../../utils/transactions/transactions";
import CerysButton from "../../CerysButton";
import { Session } from "../../../classes/session";
import { ViewOptions } from "../../../classes/view-options";
/* global Excel */

interface PromptAssetRegisterCreationProps {
  handleView: (view: string) => void;
  session: Session;
  options: ViewOptions;
}

const PromptAssetRegisterCreation = ({ handleView, session, options }: PromptAssetRegisterCreationProps) => {
  const { registerType } = options;
  const { initials, longCap, longLower, createRegister } = registerType;
  let nLEntered = session.assignment.NLEntered;
  const tBEntered = session.assignment.TBEntered;
  const [view, setView] = useState(session.options[`${initials}RCreationSetting`]);
  //const journal = session.activeJournal.journal;
  // trouble
  const registerCreated = session.assignment[`${initials}RegisterCreated`];

  const handleCreateRequest = () => {
    if (nLEntered || !tBEntered) {
      identifyLikelyAdditions(session, initials, setView);
    } else {
      setView("NLPrompt");
    }
  };

  const handleNLImport = async () => {
    await enterNL(session);
    convertNewFATrans(session);
    nLEntered = session.assignment.NLEntered;
    handleCreateRequest();
  };

  const handleAbort = (view: string) => {
    session.options[`${initials}RCreationSetting`] = "main";
    //session.activeJournal.journals = [];
    handleView(view);
  };

  const handleSubmit = async () => {
    try {
      await Excel.run(async (context) => {
        session.options[`${initials}RCreationSetting`] = "main";
        const relevantTrans = session.assignment.getUnprocessedFATransByType(session, initials);
        await createRegister(session, relevantTrans);
        session[`${initials}Transactions`] = [];
        // session.activeJournal.clientTB = false;
        // session.activeJournal.journal = false;
        // session.activeJournal.journalType = "auto-journal";
        // trouble
        //await processTransBatch(context, session, activeJournal);
        checkNewTransForAssets(session);
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
          await processUpdateBatch(session);
          updateAssignmentFigures(context, session);
          checkFATranUpdatesForAssets(session);
        }
        // if (session.activeJournal.journals.length > 0) {
        //   //await processTransBatch(context, session, activeJournal);
        //   checkFATranUpdatesForAssets(session);
        // }
        previewRelTrans(session, initials);
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {view === "main" && !registerCreated && (
        <>
          <p>Your data suggests this client owns {longLower}.</p>
          <p>You have not set up a relevant asset register.</p>
          <p>Would you like to create one automatically?</p>
          <CerysButton buttonText={`CREATE ${initials} REGISTER`} handleClick={() => handleCreateRequest()} />
        </>
      )}
      {view === "main" && registerCreated && (
        <>
          <p>Update your {longCap} Register for new transactions?</p>
          <CerysButton buttonText={`UPDATE ${initials} REGISTER`} handleClick={() => handleCreateRequest()} />
        </>
      )}

      {view === "NLPrompt" && (
        <>
          <p>You have not yet imported a nominal ledger to support the current period's client data.</p>
          <p>This is required for auto-generation of a {longCap} Register.</p>
          <CerysButton buttonText={"IMPORT NOMINAL LEDGER NOW"} handleClick={() => handleNLImport()} />
        </>
      )}

      {view === "confirmBFAreAddns" && (
        <>
          <p>These transactions were posted as b/fwd balances but from their dates would appear to be additions.</p>
          <p>Would you like to repost them as additions?</p>
          <CerysButton buttonText={"REPOST AS ADDITIONS"} handleClick={() => handleReanalysis()} />
          <CerysButton buttonText={"NO THANKS"} handleClick={() => previewRelTrans(session, initials)} />
        </>
      )}
      {view === "confirm" && <CerysButton buttonText={"SUBMIT DETAILS"} handleClick={() => handleSubmit()} />}
      {true && <CerysButton buttonText={"CONTINUE POSTING JOURNALS"} handleClick={() => handleAbort("enterJournal")} />}

      <CerysButton buttonText={"ASSIGNMENT HOME"} handleClick={() => handleAbort("assignmentDashHome")} />
    </>
  );
};

export default PromptAssetRegisterCreation;
