import * as React from "react";
import CerysButton from "../CerysButton";

interface addClientHomeProps {
  handleView: (view) => void;
  session: {};
}

const AddClientHome = (props: addClientHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"ADD CORPORATE CLIENT"} handleClick={() => props.handleView("addCorpClientDtls")} />
      <CerysButton buttonText={"ADD INDIVIDUAL AS CLIENT"} handleClick={() => props.handleView("addIndiClientDtls")} />
    </>
  );
};

export default AddClientHome;
