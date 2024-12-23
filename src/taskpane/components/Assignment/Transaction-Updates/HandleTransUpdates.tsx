import * as React from "react";
import CerysButton from "../../CerysButton";
import { callNextView } from "../../../utils.ts/helperFunctions";
import { reverseTransactionUpdates } from "../../../utils.ts/worksheet-editing/ws-range-editing";
import { submitTransactionUpdates } from "../../../utils.ts/transactions/transactions";

interface handleTransUpdatesProps {
  handleView: (view) => void;
  session: {};
}

const HandleTransUpdates = ({ handleView, session }: handleTransUpdatesProps) => {
  const handleReview = () => {
    handleView("reviewTransUpdates");
  };

  const handleDiscard = async () => {
    try {
      await Excel.run(async (context) => {
        await reverseTransactionUpdates(context, session);
        callNextView(session);
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async () => {
    await submitTransactionUpdates(session);
  };

  return (
    <>
      <CerysButton buttonText={"REVIEW TRANSACTION CHANGES"} handleClick={() => handleReview()} />
      <CerysButton buttonText={"SUBMIT CHANGES NOW"} handleClick={() => handleSubmit()} />
      <CerysButton buttonText={"DISCARD TRANSACTION CHANGES"} handleClick={() => handleDiscard()} />

      <CerysButton buttonText={"ASSIGNMENT HOME"} handleClick={() => handleView("assignmentDashHome")} />
    </>
  );
};

export default HandleTransUpdates;
