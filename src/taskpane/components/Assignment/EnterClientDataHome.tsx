import * as React from "react";
import CerysButton from "../CerysButton";
import { addPrimarySheets } from "../../assignment/assignmentInit";
import { enterTB } from "../../client-data-processing/trial-balance";

interface enterClientDataHomeProps {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const EnterClientDataHome: React.FC<enterClientDataHomeProps> = (props: enterClientDataHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"GO BACK"} handleView={() => props.handleView("assignmentDashHome")} />
      <CerysButton buttonText={"TRIAL BALANCE"} handleView={() => enterTB(props.session)} />
      <CerysButton buttonText={"NOMINAL LEDGER"} handleView={() => props.handleView("customerCompaniesHome")} />
      <CerysButton buttonText={"AGED DEBTORS REPORT"} handleView={() => props.handleView("customerSignUp")} />
      <CerysButton buttonText={"AGED CREDITORS REPORT"} handleView={() => props.handleView("customerSignUp")} />
      <CerysButton buttonText={"VAT DATA"} handleView={() => props.handleView("userLogin")} />
      <CerysButton buttonText={"WAGES DATA"} handleView={() => props.handleView("customerSignUp")} />
    </>
  );
};

export default EnterClientDataHome;
