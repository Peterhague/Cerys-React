import * as React from "react";
import CerysButton from "../../CerysButton";

interface addCorpClientDirsHomeProps {
  handleView: (view) => void;
  session: {};
}

const AddCorpClientDirsHome: React.FC<addCorpClientDirsHomeProps> = (props: addCorpClientDirsHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"Select individual"} handleView={() => props.handleView("addCorpClientShares")} />
      <CerysButton buttonText={"Add new individual"} handleView={() => props.handleView("addCorpClientDirNew")} />
      <CerysButton buttonText={"Finish"} handleView={() => props.handleView("addCorpClientOptions")} />
    </>
  );
};

export default AddCorpClientDirsHome;
