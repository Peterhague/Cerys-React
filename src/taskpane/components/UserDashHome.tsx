import * as React from "react";
import CerysButton from "./CerysButton";

interface userDashHomeProps {
  handleView: (view) => void;
}

const UserDashHome = (props: userDashHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"CLIENTS"} handleClick={() => props.handleView("customerSignUp")} />
      <CerysButton buttonText={"MY ASSIGNMENTS"} handleClick={() => props.handleView("userAssignmentsHome")} />
      <CerysButton buttonText={"TIME MANAGEMENT"} handleClick={() => props.handleView("customerSignUp")} />
    </>
  );
};

export default UserDashHome;
