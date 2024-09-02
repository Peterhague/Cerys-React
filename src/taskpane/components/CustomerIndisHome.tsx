import * as React from "react";
import CerysButton from "./CerysButton";

interface customerIndisHomeProps {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const CustomerIndisHome: React.FC<customerIndisHomeProps> = (props: customerIndisHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"MANAGE INDIVIDUALS"} handleView={() => props.handleView("customerSignUp")} />
      <CerysButton buttonText={"ADD INDIVIDUAL"} handleView={() => props.handleView("addIndiDtls")} />
    </>
  );
};

export default CustomerIndisHome;
