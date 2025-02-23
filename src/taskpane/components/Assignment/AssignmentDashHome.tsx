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
  session: Session;
}

const AssignmentDashHome = ({ session }: assignmentDashHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"ENTER CLIENT DATA"} handleClick={() => session.handleView(ENTER_CLIENT_DATA_HOME)} />
      <CerysButton buttonText={"EDIT ASSIGNMENT DATA"} handleClick={() => session.handleView(CUSTOMER_INDIS_HOME)} />
      <CerysButton buttonText={"ENTER JOURNAL"} handleClick={() => session.handleView(ENTER_JOURNAL)} />
      <CerysButton buttonText={"ACCOUNTS & OTHER REPORTS"} handleClick={() => session.handleView(CUSTOMER_SIGN_UP)} />
      <CerysButton
        buttonText={"MANAGE ASSIGNMENT"}
        handleClick={() => session.handleView(MANAGE_ASSIGNMENT_DASH_HOME)}
      />
      <CerysButton buttonText={"TAX"} handleClick={() => session.handleView(CUSTOMER_SIGN_UP)} />
      <CerysButton buttonText={"FIXED ASSET REGISTER"} handleClick={() => session.handleView(USER_LOGIN)} />
      <CerysButton buttonText={"STATUTORY DATABASE"} handleClick={() => session.handleView(CUSTOMER_SIGN_UP)} />
      <CerysButton buttonText={"INDEX"} handleClick={() => session.handleView(USER_LOGIN)} />
      <CerysButton
        buttonText={"INTRAY"}
        handleClick={() => session.handleDynamicView(INTRAY_SUMMARY, session.inTray)}
      />
    </>
  );
};

export default AssignmentDashHome;
