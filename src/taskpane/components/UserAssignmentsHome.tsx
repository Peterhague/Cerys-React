import * as React from "react";
import CerysButton from "./CerysButton";
import { ASSIGNMENT_DASH_HOME, NEW_ASSIGNMENT_DETAILS } from "../static-values/views";
import { Session } from "../classes/session";

interface userAssignmentsHomeProps {
  session: Session;
}

const UserAssignmentsHome = ({ session }: userAssignmentsHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"NEW ASSIGNMENT"} handleClick={() => session.handleView(NEW_ASSIGNMENT_DETAILS)} />
      <CerysButton buttonText={"CONTINUE ASSIGNMENT"} handleClick={() => session.handleView(ASSIGNMENT_DASH_HOME)} />
    </>
  );
};

export default UserAssignmentsHome;
