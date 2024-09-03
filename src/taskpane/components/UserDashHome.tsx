import * as React from "react";
import CerysButton from "./CerysButton";

interface userDashHomeProps {
  handleView: (view) => void;
}

const UserDashHome: React.FC<userDashHomeProps> = (props: userDashHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"CLIENTS"} handleView={() => props.handleView("customerSignUp")} />
      <CerysButton buttonText={"MY ASSIGNMENTS"} handleView={() => props.handleView("userAssignmentsHome")} />
      <CerysButton buttonText={"TIME MANAGEMENT"} handleView={() => props.handleView("customerSignUp")} />
    </>
  );
};

export default UserDashHome;
