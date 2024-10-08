import * as React from "react";
import CerysButton from "../../CerysButton";
import { checkAssetRegStatus, processTransBatch } from "../../../utils.ts/transactions/transactions";

interface handleTransUpdatesProps {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const HandleTransUpdates: React.FC<handleTransUpdatesProps> = ({ handleView, session }: handleTransUpdatesProps) => {
  const handleReview = () => {
    console.log(session["activeJournal"]);
    handleView("reviewTransUpdates");
  };

  const handleDiscard = () => {
    session["activeJournal"] = { journals: [], netValue: 0, journalType: "journal", journal: true, clientTB: false };
    handleView(session["nextView"]);
  };

  const handleSubmit = async () => {
    await processTransBatch(session);
    checkAssetRegStatus(session, handleView);
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
