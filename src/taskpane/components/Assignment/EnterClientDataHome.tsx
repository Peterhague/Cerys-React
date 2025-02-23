import * as React from "react";
import CerysButton from "../CerysButton";
import { checkTBMapping, enterTB } from "../../client-data-processing/trial-balance";
import { enterNL } from "../../client-data-processing/nominal-ledger";
import { Session } from "../../classes/session";
import { ASSIGNMENT_DASH_HOME, CUSTOMER_SIGN_UP, MAP_UNMAPPED_CODES, USER_LOGIN } from "../../static-values/views";
import { ClientCodeObject } from "../../classes/client-codes";

interface enterClientDataHomeProps {
  session: Session;
}

const EnterClientDataHome = ({ session }: enterClientDataHomeProps) => {
  const handleTBEntry = async () => {
    const unmappedCodeObjects: ClientCodeObject[] = await checkTBMapping(session);
    if (unmappedCodeObjects.length > 0) {
      session.unmappedCodeObjects = unmappedCodeObjects;
      session.handleView(MAP_UNMAPPED_CODES);
    } else {
      enterTB(session);
    }
  };

  return (
    <>
      <CerysButton buttonText={"GO BACK"} handleClick={() => session.handleView(ASSIGNMENT_DASH_HOME)} />
      <CerysButton buttonText={"TRIAL BALANCE"} handleClick={() => handleTBEntry()} />
      <CerysButton buttonText={"NOMINAL LEDGER"} handleClick={() => enterNL(session)} />
      <CerysButton buttonText={"AGED DEBTORS REPORT"} handleClick={() => session.handleView(CUSTOMER_SIGN_UP)} />
      <CerysButton buttonText={"AGED CREDITORS REPORT"} handleClick={() => session.handleView(CUSTOMER_SIGN_UP)} />
      <CerysButton buttonText={"VAT DATA"} handleClick={() => session.handleView(USER_LOGIN)} />
      <CerysButton buttonText={"WAGES DATA"} handleClick={() => session.handleView(CUSTOMER_SIGN_UP)} />
    </>
  );
};

export default EnterClientDataHome;
