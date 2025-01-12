import * as React from "react";
import CerysButton from "../../CerysButton";
import { ADD_CORP_CLIENT_DIR_NEW, ADD_CORP_CLIENT_OPTIONS, ADD_CORP_CLIENT_SHARES } from "../../../static-values/views";

interface addCorpClientDirsHomeProps {
  handleView: (view) => void;
  session: {};
}

const AddCorpClientDirsHome = (props: addCorpClientDirsHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"Select individual"} handleClick={() => props.handleView(ADD_CORP_CLIENT_SHARES)} />
      <CerysButton buttonText={"Add new individual"} handleClick={() => props.handleView(ADD_CORP_CLIENT_DIR_NEW)} />
      <CerysButton buttonText={"Finish"} handleClick={() => props.handleView(ADD_CORP_CLIENT_OPTIONS)} />
    </>
  );
};

export default AddCorpClientDirsHome;
