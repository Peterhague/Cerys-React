import * as React from "react";
import CerysButton from "./CerysButton";

interface customerClientsHomeProps {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const CustomerClientsHome: React.FC<customerClientsHomeProps> = (props: customerClientsHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"MANAGE CLIENTS"} handleView={() => props.handleView("customerSignUp")} />
      <CerysButton buttonText={"ADD CLIENT"} handleView={() => props.handleView("addClientHome")} />
    </>
  );
};

export default CustomerClientsHome;
