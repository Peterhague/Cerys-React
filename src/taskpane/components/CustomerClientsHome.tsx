import * as React from "react";
import CerysButton from "./CerysButton";

interface customerClientsHomeProps {
  handleView: (view) => void;
  session: {};
}

const CustomerClientsHome = (props: customerClientsHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"MANAGE CLIENTS"} handleClick={() => props.handleView("customerSignUp")} />
      <CerysButton buttonText={"ADD CLIENT"} handleClick={() => props.handleView("addClientHome")} />
    </>
  );
};

export default CustomerClientsHome;
