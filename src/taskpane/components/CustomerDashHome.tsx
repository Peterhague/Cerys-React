import * as React from "react";
import CerysButton from "./CerysButton";
import {
  CUSTOMER_CLIENTS_HOME,
  CUSTOMER_INDIS_HOME,
  CUSTOMER_SIGN_UP,
  LANDING_PAGE,
  USER_LOGIN,
} from "../static-values/views";

interface customerDashHomeProps {
  handleView: (view: string) => void;
  session: {};
}

const CustomerDashHome = ({ handleView }: customerDashHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"CLIENTS"} handleClick={() => handleView(CUSTOMER_CLIENTS_HOME)} />
      <CerysButton buttonText={"NON-CLIENT INDIVIDUALS"} handleClick={() => handleView(CUSTOMER_INDIS_HOME)} />
      <CerysButton buttonText={"NON-CLIENT COMPANIES"} handleClick={() => handleView(LANDING_PAGE)} />
      <CerysButton buttonText={"LICENCES"} handleClick={() => handleView(CUSTOMER_SIGN_UP)} />
      <CerysButton buttonText={"STAFF"} handleClick={() => handleView(CUSTOMER_SIGN_UP)} />
      <CerysButton buttonText={"SIGN IN AS USER"} handleClick={() => handleView(USER_LOGIN)} />
    </>
  );
};

export default CustomerDashHome;
