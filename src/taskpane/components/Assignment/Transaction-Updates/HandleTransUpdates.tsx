import * as React from "react";
import CerysButton from "../../CerysButton";
import { reverseTransactionUpdates, submitTransactionUpdates } from "../../../utils.ts/worksheet-editing";

interface handleTransUpdatesProps {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const HandleTransUpdates: React.FC<handleTransUpdatesProps> = ({ handleView, session }: handleTransUpdatesProps) => {
  const handleReview = () => {
    handleView("reviewTransUpdates");
  };

  const handleDiscard = async () => {
    await reverseTransactionUpdates(session);
    session["updatedTransactions"] = [];
    //handleView(session["nextView"]);
  };

  const handleSubmit = async () => {
    await submitTransactionUpdates(session);
  };

  return (
    <>
      <CerysButton buttonText={"REVIEW TRANSACTION CHANGES"} handleView={() => handleReview()} />
      <CerysButton buttonText={"SUBMIT CHANGES NOW"} handleView={() => handleSubmit()} />
      <CerysButton buttonText={"DISCARD TRANSACTION CHANGES"} handleView={() => handleDiscard()} />

      <CerysButton buttonText={"ASSIGNMENT HOME"} handleView={() => handleView("assignmentDashHome")} />
    </>
  );
};

export default HandleTransUpdates;
