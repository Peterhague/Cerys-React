import * as React from "react";
import CerysButton from "./CerysButton";
import { CUSTOMER_SIGN_UP, USER_ASSIGNMENTS_HOME } from "../static-values/views";
import { Session } from "../classes/session";

interface userDashHomeProps {
  session: Session;
}

const UserDashHome = ({ session }: userDashHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"CLIENTS"} handleClick={() => session.handleView(CUSTOMER_SIGN_UP)} />
      <CerysButton buttonText={"MY ASSIGNMENTS"} handleClick={() => session.handleView(USER_ASSIGNMENTS_HOME)} />
      <CerysButton buttonText={"TIME MANAGEMENT"} handleClick={() => session.handleView(CUSTOMER_SIGN_UP)} />
    </>
  );
};

export default UserDashHome;
