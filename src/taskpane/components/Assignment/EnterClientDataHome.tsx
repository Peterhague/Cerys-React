import * as React from "react";
import CerysButton from "../CerysButton";
import { checkTBMapping, enterTB } from "../../client-data-processing/trial-balance";
import { enterNL } from "../../client-data-processing/nominal-ledger";

interface enterClientDataHomeProps {
  handleView: (view) => void;
  session: {};
}

const EnterClientDataHome = ({ handleView, session }: enterClientDataHomeProps) => {
  const handleTBEntry = async () => {
    const unmappedCodeObjects = await checkTBMapping(session);
    if (unmappedCodeObjects.length > 0) {
      session["unmappedCodeObjects"] = unmappedCodeObjects;
      handleView("mapUnmappedCodes");
    } else {
      enterTB(session);
    }
  };

  return (
    <>
      <CerysButton buttonText={"GO BACK"} handleClick={() => handleView("assignmentDashHome")} />
      <CerysButton buttonText={"TRIAL BALANCE"} handleClick={() => handleTBEntry()} />
      <CerysButton buttonText={"NOMINAL LEDGER"} handleClick={() => enterNL(session)} />
      <CerysButton buttonText={"AGED DEBTORS REPORT"} handleClick={() => handleView("customerSignUp")} />
      <CerysButton buttonText={"AGED CREDITORS REPORT"} handleClick={() => handleView("customerSignUp")} />
      <CerysButton buttonText={"VAT DATA"} handleClick={() => handleView("userLogin")} />
      <CerysButton buttonText={"WAGES DATA"} handleClick={() => handleView("customerSignUp")} />
    </>
  );
};

export default EnterClientDataHome;
