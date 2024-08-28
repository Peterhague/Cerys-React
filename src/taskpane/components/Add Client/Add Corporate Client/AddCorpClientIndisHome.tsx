import * as React from "react";
import CerysButton from "../../CerysButton";

interface addCorpClientIndisHomeProps {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const AddCorpClientIndisHome: React.FC<addCorpClientIndisHomeProps> = (props: addCorpClientIndisHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"Select individual"} handleView={() => props.handleView("addCorpClientShares")} />
      <CerysButton buttonText={"Add new individual"} handleView={() => props.handleView("addCorpClientIndiNew")} />
      <CerysButton buttonText={"Finish"} handleView={() => props.handleView("addCorpClientOptions")} />
    </>
  );
};

export default AddCorpClientIndisHome;
