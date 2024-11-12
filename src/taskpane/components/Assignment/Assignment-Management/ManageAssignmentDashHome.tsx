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
}: manageAssignmentDashHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"FINALISE"} handleView={() => finaliseAssignment(session)} />
    </>
  );
};

export default ManageAssignmentDashHome;
