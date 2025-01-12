import * as React from "react";
import CerysButton from "./CerysButton";
import { ADD_CLIENT_HOME, CUSTOMER_SIGN_UP } from "../static-values/views";

interface customerClientsHomeProps {
  handleView: (view) => void;
  session: {};
}

const CustomerClientsHome = (props: customerClientsHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"MANAGE CLIENTS"} handleClick={() => props.handleView(CUSTOMER_SIGN_UP)} />
      <CerysButton buttonText={"ADD CLIENT"} handleClick={() => props.handleView(ADD_CLIENT_HOME)} />
    </>
  );
};

export default CustomerClientsHome;
