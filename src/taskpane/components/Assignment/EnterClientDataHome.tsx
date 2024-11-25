import * as React from "react";
import CerysButton from "../CerysButton";
import { checkTBMapping, enterTB } from "../../client-data-processing/trial-balance";
import { enterNL } from "../../client-data-processing/nominal-ledger";

interface enterClientDataHomeProps {
  handleView: (view) => void;
  session: {};
}

const EnterClientDataHome: React.FC<enterClientDataHomeProps> = ({ handleView, session }: enterClientDataHomeProps) => {
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
      <CerysButton buttonText={"GO BACK"} handleView={() => handleView("assignmentDashHome")} />
      <CerysButton buttonText={"TRIAL BALANCE"} handleView={() => handleTBEntry()} />
      <CerysButton buttonText={"NOMINAL LEDGER"} handleView={() => enterNL(session)} />
      <CerysButton buttonText={"AGED DEBTORS REPORT"} handleView={() => handleView("customerSignUp")} />
      <CerysButton buttonText={"AGED CREDITORS REPORT"} handleView={() => handleView("customerSignUp")} />
      <CerysButton buttonText={"VAT DATA"} handleView={() => handleView("userLogin")} />
      <CerysButton buttonText={"WAGES DATA"} handleView={() => handleView("customerSignUp")} />
    </>
  );
};

export default EnterClientDataHome;
