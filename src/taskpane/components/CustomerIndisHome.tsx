import * as React from "react";
import CerysButton from "./CerysButton";
import { ADD_INDI_DETAILS, CUSTOMER_SIGN_UP } from "../static-values/views";

interface customerIndisHomeProps {
  handleView: (view: string) => void;
  session: {};
}

const CustomerIndisHome = ({ handleView }: customerIndisHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"MANAGE INDIVIDUALS"} handleClick={() => handleView(CUSTOMER_SIGN_UP)} />
      <CerysButton buttonText={"ADD INDIVIDUAL"} handleClick={() => handleView(ADD_INDI_DETAILS)} />
    </>
  );
};

export default CustomerIndisHome;
