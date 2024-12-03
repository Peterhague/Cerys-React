import * as React from "react";
import CerysButton from "./CerysButton";

interface customerIndisHomeProps {
  handleView: (view) => void;
  session: {};
}

const CustomerIndisHome: React.FC<customerIndisHomeProps> = (props: customerIndisHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"MANAGE INDIVIDUALS"} handleClick={() => props.handleView("customerSignUp")} />
      <CerysButton buttonText={"ADD INDIVIDUAL"} handleClick={() => props.handleView("addIndiDtls")} />
    </>
  );
};

export default CustomerIndisHome;
