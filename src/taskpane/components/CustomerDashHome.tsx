import * as React from "react";
import CerysButton from "./CerysButton";

interface customerDashHomeProps {
  handleView: (view) => void;
  session: {};
}

const CustomerDashHome: React.FC<customerDashHomeProps> = (props: customerDashHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"CLIENTS"} handleClick={() => props.handleView("customerClientsHome")} />
      <CerysButton buttonText={"NON-CLIENT INDIVIDUALS"} handleClick={() => props.handleView("customerIndisHome")} />
      <CerysButton buttonText={"NON-CLIENT COMPANIES"} handleClick={() => props.handleView("customerCompaniesHome")} />
      <CerysButton buttonText={"LICENCES"} handleClick={() => props.handleView("customerSignUp")} />
      <CerysButton buttonText={"STAFF"} handleClick={() => props.handleView("customerSignUp")} />
      <CerysButton buttonText={"SIGN IN AS USER"} handleClick={() => props.handleView("userLogin")} />
    </>
  );
};

export default CustomerDashHome;
