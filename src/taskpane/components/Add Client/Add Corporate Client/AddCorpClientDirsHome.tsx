import * as React from "react";
import CerysButton from "../../CerysButton";
import { ADD_CORP_CLIENT_DIR_NEW, ADD_CORP_CLIENT_OPTIONS, ADD_CORP_CLIENT_SHARES } from "../../../static-values/views";
import { Session } from "../../../classes/session";

interface addCorpClientDirsHomeProps {
  session: Session;
}

const AddCorpClientDirsHome = ({ session }: addCorpClientDirsHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"Select individual"} handleClick={() => session.handleView(ADD_CORP_CLIENT_SHARES)} />
      <CerysButton buttonText={"Add new individual"} handleClick={() => session.handleView(ADD_CORP_CLIENT_DIR_NEW)} />
      <CerysButton buttonText={"Finish"} handleClick={() => session.handleView(ADD_CORP_CLIENT_OPTIONS)} />
    </>
  );
};

export default AddCorpClientDirsHome;
