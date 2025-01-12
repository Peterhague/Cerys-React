import * as React from "react";
import CerysButton from "../../CerysButton";
import {
  ADD_COPR_CLIENT_SHAREHOLDER_NEW,
  ADD_CORP_CLIENT_OPTIONS,
  ADD_CORP_CLIENT_SHARES,
} from "../../../static-values/views";

interface addCorpClientSHHomeProps {
  handleView: (view) => void;
  session: {};
}

const AddCorpClientSHHome = (props: addCorpClientSHHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"Select individual"} handleClick={() => props.handleView(ADD_CORP_CLIENT_SHARES)} />
      <CerysButton
        buttonText={"Add new individual"}
        handleClick={() => props.handleView(ADD_COPR_CLIENT_SHAREHOLDER_NEW)}
      />
      <CerysButton buttonText={"Finish"} handleClick={() => props.handleView(ADD_CORP_CLIENT_OPTIONS)} />
    </>
  );
};

export default AddCorpClientSHHome;
