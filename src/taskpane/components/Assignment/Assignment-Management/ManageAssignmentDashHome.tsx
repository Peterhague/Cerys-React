import * as React from "react";
import CerysButton from "../../CerysButton";
import { finaliseAssignment } from "../../../assignment/assignment-management/assignment-finalisation";
import { bFPrevPeriodMessage } from "../../../utils.ts/messages";
import { trialBalanceUrl } from "../../../fetching/apiEndpoints";
import { Session } from "../../../classes/session";

interface manageAssignmentDashHomeProps {
  handleView: (view) => void;
  session: Session;
}

const ManageAssignmentDashHome = ({ session, handleView }: manageAssignmentDashHomeProps) => {
  const test = () => {
    const options = {
      handleYes: () => console.log("yes"),
      handleNo: () => console.log("no"),
      message: bFPrevPeriodMessage,
    };
    session.handleDynamicView("userConfirmPrompt", options);
  };

  const updateChart = async () => {
    await fetch("http://localhost:4000/api/main-nominal/update-chart");
  };

  const tbreq = async () => {
    await fetch(trialBalanceUrl);
  };
  return (
    <>
      <CerysButton buttonText={"FINALISE"} handleClick={() => finaliseAssignment(session)} />
      <CerysButton
        buttonText={"Opening Balance Adjustments"}
        handleClick={() => handleView("openingBalanceAdjustments")}
      />
      <CerysButton buttonText={"Test dynamic component"} handleClick={() => test()} />
      <CerysButton buttonText={"Update chart"} handleClick={() => updateChart()} />
      <CerysButton buttonText={"Assignment Home"} handleClick={() => handleView("assignmentDashHome")} />
      <CerysButton buttonText={"test"} handleClick={() => tbreq()} />
    </>
  );
};

export default ManageAssignmentDashHome;
