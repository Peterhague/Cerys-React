import * as React from "react";
import CerysButton from "./CerysButton";
import { ASSIGNMENT_DASH_HOME, NEW_ASSIGNMENT_DETAILS } from "../static-values/views";
import { Session } from "../classes/session";

interface userAssignmentsHomeProps {
  handleView: (view: string) => void;
  session: Session;
}

const UserAssignmentsHome = (props: userAssignmentsHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"NEW ASSIGNMENT"} handleClick={() => props.handleView(NEW_ASSIGNMENT_DETAILS)} />
      <CerysButton buttonText={"CONTINUE ASSIGNMENT"} handleClick={() => props.handleView(ASSIGNMENT_DASH_HOME)} />
    </>
  );
};

export default UserAssignmentsHome;
