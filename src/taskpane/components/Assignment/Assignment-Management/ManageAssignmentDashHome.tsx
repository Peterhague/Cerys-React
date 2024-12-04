import * as React from "react";
import CerysButton from "../../CerysButton";
import { finaliseAssignment } from "../../../assignment/assignment-management/assignment-finalisation";
import { bFPrevPeriodMessage } from "../../../utils.ts/messages";
import { oBARelevantTransView } from "../../../assignment/assignment-management/opening-balance-adjustments";

interface manageAssignmentDashHomeProps {
  handleView: (view) => void;
  session: {};
}

const ManageAssignmentDashHome: React.FC<manageAssignmentDashHomeProps> = ({
  session,
  handleView,
}: manageAssignmentDashHomeProps) => {
  const transactions = session["activeAssignment"].transactions;
  const test = () => {
    const options = {
      handleYes: () => console.log("yes"),
      handleNo: () => console.log("no"),
      message: bFPrevPeriodMessage,
    };
    session["handleDynamicView"]("userConfirmPrompt", options);
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
    </>
  );
};

export default ManageAssignmentDashHome;
