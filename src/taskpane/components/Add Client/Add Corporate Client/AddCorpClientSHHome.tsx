import * as React from "react";
import CerysButton from "../../CerysButton";
import {
  ADD_COPR_CLIENT_SHAREHOLDER_NEW,
  ADD_CORP_CLIENT_OPTIONS,
  ADD_CORP_CLIENT_SHARES,
} from "../../../static-values/views";
import { Session } from "../../../classes/session";

interface addCorpClientSHHomeProps {
  session: Session;
}

const AddCorpClientSHHome = ({ session }: addCorpClientSHHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"Select individual"} handleClick={() => session.handleView(ADD_CORP_CLIENT_SHARES)} />
      <CerysButton
        buttonText={"Add new individual"}
        handleClick={() => session.handleView(ADD_COPR_CLIENT_SHAREHOLDER_NEW)}
      />
      <CerysButton buttonText={"Finish"} handleClick={() => session.handleView(ADD_CORP_CLIENT_OPTIONS)} />
    </>
  );
};

export default AddCorpClientSHHome;
