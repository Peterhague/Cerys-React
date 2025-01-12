import * as React from "react";
import CerysButton from "../CerysButton";
import { checkTBMapping, enterTB } from "../../client-data-processing/trial-balance";
import { enterNL } from "../../client-data-processing/nominal-ledger";
import { Session } from "../../classes/session";
import { ASSIGNMENT_DASH_HOME, CUSTOMER_SIGN_UP, MAP_UNMAPPED_CODES, USER_LOGIN } from "../../static-values/views";

interface enterClientDataHomeProps {
  handleView: (view) => void;
  session: Session;
}

const EnterClientDataHome = ({ handleView, session }: enterClientDataHomeProps) => {
  const handleTBEntry = async () => {
    const unmappedCodeObjects = await checkTBMapping(session);
    if (unmappedCodeObjects.length > 0) {
      session.unmappedCodeObjects = unmappedCodeObjects;
      handleView(MAP_UNMAPPED_CODES);
    } else {
      enterTB(session);
    }
  };

  return (
    <>
      <CerysButton buttonText={"GO BACK"} handleClick={() => handleView(ASSIGNMENT_DASH_HOME)} />
      <CerysButton buttonText={"TRIAL BALANCE"} handleClick={() => handleTBEntry()} />
      <CerysButton buttonText={"NOMINAL LEDGER"} handleClick={() => enterNL(session)} />
      <CerysButton buttonText={"AGED DEBTORS REPORT"} handleClick={() => handleView(CUSTOMER_SIGN_UP)} />
      <CerysButton buttonText={"AGED CREDITORS REPORT"} handleClick={() => handleView(CUSTOMER_SIGN_UP)} />
      <CerysButton buttonText={"VAT DATA"} handleClick={() => handleView(USER_LOGIN)} />
      <CerysButton buttonText={"WAGES DATA"} handleClick={() => handleView(CUSTOMER_SIGN_UP)} />
    </>
  );
};

export default EnterClientDataHome;
