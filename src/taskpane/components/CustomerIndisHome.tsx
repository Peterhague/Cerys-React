import * as React from "react";
import CerysButton from "./CerysButton";
import { ADD_INDI_DETAILS, CUSTOMER_SIGN_UP } from "../static-values/views";
import { Session } from "../classes/session";

interface customerIndisHomeProps {
  session: Session;
}

const CustomerIndisHome = ({ session }: customerIndisHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"MANAGE INDIVIDUALS"} handleClick={() => session.handleView(CUSTOMER_SIGN_UP)} />
      <CerysButton buttonText={"ADD INDIVIDUAL"} handleClick={() => session.handleView(ADD_INDI_DETAILS)} />
    </>
  );
};

export default CustomerIndisHome;
