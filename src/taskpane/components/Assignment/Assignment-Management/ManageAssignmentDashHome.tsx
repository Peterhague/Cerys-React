import * as React from "react";
import CerysButton from "../../CerysButton";
import { finaliseAssignment } from "../../../assignment/assignment-management";
import { bFPrevPeriodMessage } from "../../../utils.ts/messages";

interface manageAssignmentDashHomeProps {
  handleView: (view) => void;
  session: {};
}

const ManageAssignmentDashHome: React.FC<manageAssignmentDashHomeProps> = ({
  session,
  //handleView,
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
      <CerysButton buttonText={"FINALISE"} handleView={() => finaliseAssignment(session)} />
      <CerysButton buttonText={"Closing Balance Adjustments"} handleView={() => console.log(transactions)} />
      <CerysButton buttonText={"Test dynamic component"} handleView={() => test()} />
    </>
  );
};

export default ManageAssignmentDashHome;
