import * as React from "react";
import CerysButton from "../CerysButton";
import { enterTB } from "../../client-data-processing/trial-balance";
import { enterNL } from "../../client-data-processing/nominal-ledger";

interface enterClientDataHomeProps {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const EnterClientDataHome: React.FC<enterClientDataHomeProps> = ({
  updateSession,
  handleView,
  session,
}: enterClientDataHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"GO BACK"} handleView={() => handleView("assignmentDashHome")} />
      <CerysButton buttonText={"TRIAL BALANCE"} handleView={() => enterTB(session, updateSession)} />
      <CerysButton buttonText={"NOMINAL LEDGER"} handleView={() => enterNL(session, updateSession)} />
      <CerysButton buttonText={"AGED DEBTORS REPORT"} handleView={() => handleView("customerSignUp")} />
      <CerysButton buttonText={"AGED CREDITORS REPORT"} handleView={() => handleView("customerSignUp")} />
      <CerysButton buttonText={"VAT DATA"} handleView={() => handleView("userLogin")} />
      <CerysButton buttonText={"WAGES DATA"} handleView={() => handleView("customerSignUp")} />
    </>
  );
};

export default EnterClientDataHome;
