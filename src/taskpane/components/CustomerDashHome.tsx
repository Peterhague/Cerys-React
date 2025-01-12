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
  handleView: (view) => void;
  session: {};
}

const CustomerDashHome = (props: customerDashHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"CLIENTS"} handleClick={() => props.handleView(CUSTOMER_CLIENTS_HOME)} />
      <CerysButton buttonText={"NON-CLIENT INDIVIDUALS"} handleClick={() => props.handleView(CUSTOMER_INDIS_HOME)} />
      <CerysButton buttonText={"NON-CLIENT COMPANIES"} handleClick={() => props.handleView(LANDING_PAGE)} />
      <CerysButton buttonText={"LICENCES"} handleClick={() => props.handleView(CUSTOMER_SIGN_UP)} />
      <CerysButton buttonText={"STAFF"} handleClick={() => props.handleView(CUSTOMER_SIGN_UP)} />
      <CerysButton buttonText={"SIGN IN AS USER"} handleClick={() => props.handleView(USER_LOGIN)} />
    </>
  );
};

export default CustomerDashHome;
