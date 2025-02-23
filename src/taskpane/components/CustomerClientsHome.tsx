import * as React from "react";
import CerysButton from "./CerysButton";
import { ADD_CLIENT_HOME, CUSTOMER_SIGN_UP } from "../static-values/views";
import { Session } from "../classes/session";

interface customerClientsHomeProps {
  session: Session;
}

const CustomerClientsHome = ({ session }: customerClientsHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"MANAGE CLIENTS"} handleClick={() => session.handleView(CUSTOMER_SIGN_UP)} />
      <CerysButton buttonText={"ADD CLIENT"} handleClick={() => session.handleView(ADD_CLIENT_HOME)} />
    </>
  );
};

export default CustomerClientsHome;
