import * as React from "react";
import CerysButton from "../CerysButton";
import { ADD_CORP_CLIENT_DETAILS, ADD_INDI_CLIENT_DETAILS } from "../../static-values/views";

interface addClientHomeProps {
  handleView: (view) => void;
  session: {};
}

const AddClientHome = (props: addClientHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"ADD CORPORATE CLIENT"} handleClick={() => props.handleView(ADD_CORP_CLIENT_DETAILS)} />
      <CerysButton
        buttonText={"ADD INDIVIDUAL AS CLIENT"}
        handleClick={() => props.handleView(ADD_INDI_CLIENT_DETAILS)}
      />
    </>
  );
};

export default AddClientHome;
