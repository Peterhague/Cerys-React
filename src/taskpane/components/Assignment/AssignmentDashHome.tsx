import * as React from "react";
import CerysButton from "../CerysButton";
import {
  CUSTOMER_INDIS_HOME,
  CUSTOMER_SIGN_UP,
  ENTER_CLIENT_DATA_HOME,
  ENTER_JOURNAL,
  INTRAY_SUMMARY,
  MANAGE_ASSIGNMENT_DASH_HOME,
  USER_LOGIN,
} from "../../static-values/views";
import { Session } from "../../classes/session";

interface assignmentDashHomeProps {
  handleView: (view: string) => void;
  session: Session;
}

const AssignmentDashHome = ({ session, handleView }: assignmentDashHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"ENTER CLIENT DATA"} handleClick={() => handleView(ENTER_CLIENT_DATA_HOME)} />
      <CerysButton buttonText={"EDIT ASSIGNMENT DATA"} handleClick={() => handleView(CUSTOMER_INDIS_HOME)} />
      <CerysButton buttonText={"ENTER JOURNAL"} handleClick={() => handleView(ENTER_JOURNAL)} />
      <CerysButton buttonText={"ACCOUNTS & OTHER REPORTS"} handleClick={() => handleView(CUSTOMER_SIGN_UP)} />
      <CerysButton buttonText={"MANAGE ASSIGNMENT"} handleClick={() => handleView(MANAGE_ASSIGNMENT_DASH_HOME)} />
      <CerysButton buttonText={"TAX"} handleClick={() => handleView(CUSTOMER_SIGN_UP)} />
      <CerysButton buttonText={"FIXED ASSET REGISTER"} handleClick={() => handleView(USER_LOGIN)} />
      <CerysButton buttonText={"STATUTORY DATABASE"} handleClick={() => handleView(CUSTOMER_SIGN_UP)} />
      <CerysButton buttonText={"INDEX"} handleClick={() => handleView(USER_LOGIN)} />
      <CerysButton
        buttonText={"INTRAY"}
        handleClick={() => session.handleDynamicView(INTRAY_SUMMARY, session.assignment.inTray)}
      />
    </>
  );
};

export default AssignmentDashHome;
