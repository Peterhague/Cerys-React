import * as React from "react";
import CerysButton from "../../CerysButton";
import { finaliseAssignment } from "../../../assignment/assignment-management";

interface manageAssignmentDashHomeProps {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const ManageAssignmentDashHome: React.FC<manageAssignmentDashHomeProps> = ({
  session,
  handleView,
}: manageAssignmentDashHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"FINALISE"} handleView={() => finaliseAssignment(session)} />
      <CerysButton buttonText={"Test dynamic component"} handleView={() => handleView("userConfirmPrompt")} />
    </>
  );
};

export default ManageAssignmentDashHome;
