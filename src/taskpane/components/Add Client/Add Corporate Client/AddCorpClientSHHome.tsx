import * as React from "react";
import CerysButton from "../../CerysButton";

interface addCorpClientSHHomeProps {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const AddCorpClientSHHome: React.FC<addCorpClientSHHomeProps> = (props: addCorpClientSHHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"Select individual"} handleView={() => props.handleView("addCorpClientShares")} />
      <CerysButton buttonText={"Add new individual"} handleView={() => props.handleView("addCorpClientSHNew")} />
      <CerysButton buttonText={"Finish"} handleView={() => props.handleView("addCorpClientOptions")} />
    </>
  );
};

export default AddCorpClientSHHome;
