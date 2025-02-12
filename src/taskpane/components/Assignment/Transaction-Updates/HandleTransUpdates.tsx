import * as React from "react";
import CerysButton from "../../CerysButton";
import { callNextView } from "../../../utils/helper-functions";
import { reverseTransactionUpdates } from "../../../utils/worksheet-editing/ws-range-editing";
import { submitTransactionUpdates } from "../../../utils/transactions/transactions";
import { Session } from "../../../classes/session";
import { ASSIGNMENT_DASH_HOME, REVIEW_TRANS_UPDATES } from "../../../static-values/views";

interface handleTransUpdatesProps {
  handleView: (view: string) => void;
  session: Session;
}

const HandleTransUpdates = ({ handleView, session }: handleTransUpdatesProps) => {
  const handleReview = () => {
    handleView(REVIEW_TRANS_UPDATES);
  };

  const handleDiscard = async () => {
    await reverseTransactionUpdates(session);
    callNextView(session);
  };

  const handleSubmit = async () => {
    await submitTransactionUpdates(session);
  };

  return (
    <>
      <CerysButton buttonText={"REVIEW TRANSACTION CHANGES"} handleClick={() => handleReview()} />
      <CerysButton buttonText={"SUBMIT CHANGES NOW"} handleClick={() => handleSubmit()} />
      <CerysButton buttonText={"DISCARD TRANSACTION CHANGES"} handleClick={() => handleDiscard()} />

      <CerysButton buttonText={"ASSIGNMENT HOME"} handleClick={() => handleView(ASSIGNMENT_DASH_HOME)} />
    </>
  );
};

export default HandleTransUpdates;
