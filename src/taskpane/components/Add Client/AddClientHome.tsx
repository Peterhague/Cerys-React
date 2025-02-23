import * as React from "react";
import CerysButton from "../CerysButton";
import { ADD_CORP_CLIENT_DETAILS, ADD_INDI_CLIENT_DETAILS } from "../../static-values/views";
import { Session } from "../../classes/session";

interface addClientHomeProps {
  session: Session;
}

const AddClientHome = ({ session }: addClientHomeProps) => {
  return (
    <>
      <CerysButton
        buttonText={"ADD CORPORATE CLIENT"}
        handleClick={() => session.handleView(ADD_CORP_CLIENT_DETAILS)}
      />
      <CerysButton
        buttonText={"ADD INDIVIDUAL AS CLIENT"}
        handleClick={() => session.handleView(ADD_INDI_CLIENT_DETAILS)}
      />
    </>
  );
};

export default AddClientHome;
