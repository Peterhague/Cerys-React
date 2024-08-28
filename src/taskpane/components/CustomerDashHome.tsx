import * as React from "react";
import CerysButton from "./CerysButton";

interface customerDashHomeProps {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const CustomerDashHome: React.FC<customerDashHomeProps> = (props: customerDashHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"CLIENTS"} handleView={() => props.handleView("customerClientsHome")} />
      <CerysButton buttonText={"LICENCES"} handleView={() => props.handleView("customerSignUp")} />
      <CerysButton buttonText={"STAFF"} handleView={() => props.handleView("customerSignUp")} />
      <CerysButton buttonText={"SIGN IN AS USER"} handleView={() => props.handleView("userLogin")} />
    </>
  );
};

export default CustomerDashHome;
