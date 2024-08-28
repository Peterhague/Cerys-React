import * as React from "react";
import CerysButton from "../../CerysButton";

interface addIndiClientAssocOptionsProps {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const AddIndiClientAssocOptions: React.FC<addIndiClientAssocOptionsProps> = ({
  handleView,
}: addIndiClientAssocOptionsProps) => {
  return (
    <>
      <p>Associate with existing corporate client?</p>
      <CerysButton buttonText={"AS DIRECTOR"} handleView={() => handleView("addIndiClientAssocDir")} />
      <CerysButton buttonText={"AS SHAREHOLDER"} handleView={() => handleView("addClientHome")} />
      <CerysButton buttonText={"Submit Now"} handleView={() => handleView("addCorpClientIndisHome")} />
    </>
  );
};

export default AddIndiClientAssocOptions;
