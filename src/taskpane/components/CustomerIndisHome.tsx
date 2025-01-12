import * as React from "react";
import CerysButton from "./CerysButton";
import { ADD_INDI_DETAILS, CUSTOMER_SIGN_UP } from "../static-values/views";

interface customerIndisHomeProps {
  handleView: (view) => void;
  session: {};
}

const CustomerIndisHome = (props: customerIndisHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"MANAGE INDIVIDUALS"} handleClick={() => props.handleView(CUSTOMER_SIGN_UP)} />
      <CerysButton buttonText={"ADD INDIVIDUAL"} handleClick={() => props.handleView(ADD_INDI_DETAILS)} />
    </>
  );
};

export default CustomerIndisHome;
