import * as React from "react";
import CerysButton from "../../CerysButton";
import { reverseTransactionUpdates } from "../../../utils/worksheet-editing/ws-range-editing";
import { submitTransactionUpdates } from "../../../utils/transactions/transactions";
import { Session } from "../../../classes/session";
import { ASSIGNMENT_DASH_HOME, REVIEW_TRANS_UPDATES } from "../../../static-values/views";

interface handleTransUpdatesProps {
  session: Session;
}

const HandleTransUpdates = ({ session }: handleTransUpdatesProps) => {
  const handleReview = () => {
    session.handleOverlayView(REVIEW_TRANS_UPDATES);
  };

  const handleDiscard = async () => {
    await reverseTransactionUpdates(session);
    //callNextView(session);
    session.handleOverlayView("");
  };

  const handleSubmit = async () => {
    await submitTransactionUpdates(session);
  };

  return (
    <>
      <CerysButton buttonText={"REVIEW TRANSACTION CHANGES"} handleClick={() => handleReview()} />
      <CerysButton buttonText={"SUBMIT CHANGES NOW"} handleClick={() => handleSubmit()} />
      <CerysButton buttonText={"DISCARD TRANSACTION CHANGES"} handleClick={() => handleDiscard()} />

      <CerysButton buttonText={"ASSIGNMENT HOME"} handleClick={() => session.handleView(ASSIGNMENT_DASH_HOME)} />
    </>
  );
};

export default HandleTransUpdates;
