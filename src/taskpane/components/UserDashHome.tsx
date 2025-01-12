import * as React from "react";
import CerysButton from "./CerysButton";
import { CUSTOMER_SIGN_UP, USER_ASSIGNMENTS_HOME } from "../static-values/views";

interface userDashHomeProps {
  handleView: (view) => void;
}

const UserDashHome = (props: userDashHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"CLIENTS"} handleClick={() => props.handleView(CUSTOMER_SIGN_UP)} />
      <CerysButton buttonText={"MY ASSIGNMENTS"} handleClick={() => props.handleView(USER_ASSIGNMENTS_HOME)} />
      <CerysButton buttonText={"TIME MANAGEMENT"} handleClick={() => props.handleView(CUSTOMER_SIGN_UP)} />
    </>
  );
};

export default UserDashHome;
