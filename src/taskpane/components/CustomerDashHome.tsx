import * as React from "react";
import CerysButton from "./CerysButton";
import {
  CUSTOMER_CLIENTS_HOME,
  CUSTOMER_INDIS_HOME,
  CUSTOMER_SIGN_UP,
  LANDING_PAGE,
  USER_LOGIN,
} from "../static-values/views";
import { Session } from "../classes/session";

interface customerDashHomeProps {
  session: Session;
}

const CustomerDashHome = ({ session }: customerDashHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"CLIENTS"} handleClick={() => session.handleView(CUSTOMER_CLIENTS_HOME)} />
      <CerysButton buttonText={"NON-CLIENT INDIVIDUALS"} handleClick={() => session.handleView(CUSTOMER_INDIS_HOME)} />
      <CerysButton buttonText={"NON-CLIENT COMPANIES"} handleClick={() => session.handleView(LANDING_PAGE)} />
      <CerysButton buttonText={"LICENCES"} handleClick={() => session.handleView(CUSTOMER_SIGN_UP)} />
      <CerysButton buttonText={"STAFF"} handleClick={() => session.handleView(CUSTOMER_SIGN_UP)} />
      <CerysButton buttonText={"SIGN IN AS USER"} handleClick={() => session.handleView(USER_LOGIN)} />
    </>
  );
};

export default CustomerDashHome;
