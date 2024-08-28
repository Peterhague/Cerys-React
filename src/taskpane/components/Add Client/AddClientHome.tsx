import * as React from "react";
import CerysButton from "../CerysButton";

interface addClientHomeProps {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const AddClientHome: React.FC<addClientHomeProps> = (props: addClientHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"ADD CORPORATE CLIENT"} handleView={() => props.handleView("addCorpClientDtls")} />
      <CerysButton buttonText={"ADD INDIVIDUAL AS CLIENT"} handleView={() => props.handleView("addIndiClientDtls")} />
    </>
  );
};

export default AddClientHome;
