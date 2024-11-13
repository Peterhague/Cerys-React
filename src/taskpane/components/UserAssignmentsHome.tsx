import * as React from "react";
import CerysButton from "./CerysButton";

interface userAssignmentsHomeProps {
  handleView: (view) => void;
  session: {};
}

const UserAssignmentsHome: React.FC<userAssignmentsHomeProps> = (props: userAssignmentsHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"NEW ASSIGNMENT"} handleView={() => props.handleView("newAssignmentDtls")} />
      <CerysButton buttonText={"CONTINUE ASSIGNMENT"} handleView={() => props.handleView("assignmentDashHome")} />
    </>
  );
};

export default UserAssignmentsHome;
