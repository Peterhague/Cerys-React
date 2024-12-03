import * as React from "react";
import CerysButton from "../../CerysButton";

interface addCorpClientSHHomeProps {
  handleView: (view) => void;
  session: {};
}

const AddCorpClientSHHome: React.FC<addCorpClientSHHomeProps> = (props: addCorpClientSHHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"Select individual"} handleClick={() => props.handleView("addCorpClientShares")} />
      <CerysButton buttonText={"Add new individual"} handleClick={() => props.handleView("addCorpClientSHNew")} />
      <CerysButton buttonText={"Finish"} handleClick={() => props.handleView("addCorpClientOptions")} />
    </>
  );
};

export default AddCorpClientSHHome;
