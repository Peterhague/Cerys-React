import * as React from "react";
import CerysButton from "../../CerysButton";
import {
  oBARelevantTransView,
  createOBAWorksheet,
} from "../../../assignment/assignment-management/opening-balance-adjustments";
import { Session } from "../../../classes/session";
import { ASSIGNMENT_DASH_HOME } from "../../../static-values/views";

interface OpeningBalanceAdjustmentsProps {
  session: Session;
}

const OpeningBalanceAdjustments = ({ session }: OpeningBalanceAdjustmentsProps) => {
  return (
    <>
      <CerysButton buttonText={"Review Transactions"} handleClick={() => oBARelevantTransView(session)} />
      <CerysButton buttonText={"Generate Worksheet"} handleClick={() => createOBAWorksheet(session)} />
      <CerysButton buttonText={"ASSINGMENT HOME"} handleClick={() => session.handleView(ASSIGNMENT_DASH_HOME)} />
    </>
  );
};

export default OpeningBalanceAdjustments;
