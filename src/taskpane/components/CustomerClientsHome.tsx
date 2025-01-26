import * as React from "react";
import CerysButton from "./CerysButton";
import { ADD_CLIENT_HOME, CUSTOMER_SIGN_UP } from "../static-values/views";
import { Session } from "../classes/session";

interface customerClientsHomeProps {
  handleView: (view: string) => void;
  session: Session;
}

const CustomerClientsHome = ({ handleView }: customerClientsHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"MANAGE CLIENTS"} handleClick={() => handleView(CUSTOMER_SIGN_UP)} />
      <CerysButton buttonText={"ADD CLIENT"} handleClick={() => handleView(ADD_CLIENT_HOME)} />
    </>
  );
};

export default CustomerClientsHome;
