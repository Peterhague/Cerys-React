import * as React from "react";
import CerysButton from "../../CerysButton";
import { finaliseAssignment } from "../../../assignment/assignment-management/assignment-finalisation";
import { bFPrevPeriodMessage } from "../../../utils.ts/messages";
import { oBARelevantTransView } from "../../../assignment/assignment-management/opening-balance-adjustments";
import { trialBalanceUrl } from "../../../fetching/apiEndpoints";

interface manageAssignmentDashHomeProps {
  handleView: (view) => void;
  session: {};
}

const ManageAssignmentDashHome = ({ session, handleView }: manageAssignmentDashHomeProps) => {
  const transactions = session["activeAssignment"].transactions;

  const test = () => {
    const options = {
      handleYes: () => console.log("yes"),
      handleNo: () => console.log("no"),
      message: bFPrevPeriodMessage,
    };
    session["handleDynamicView"]("userConfirmPrompt", options);
  };

  const tbreq = async () => {
    await fetch(trialBalanceUrl);
  };
  return (
    <>
      <CerysButton buttonText={"FINALISE"} handleClick={() => finaliseAssignment(session)} />
      <CerysButton
        buttonText={"Opening Balance Adjustments"}
        handleClick={() => oBARelevantTransView(transactions, session)}
      />
      <CerysButton buttonText={"Test dynamic component"} handleClick={() => test()} />
      <CerysButton buttonText={"Assignment Home"} handleClick={() => handleView("assignmentDashHome")} />
      <CerysButton buttonText={"test"} handleClick={() => tbreq()} />
    </>
  );
};

export default ManageAssignmentDashHome;
