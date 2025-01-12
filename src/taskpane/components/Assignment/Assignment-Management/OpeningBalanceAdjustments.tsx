import * as React from "react";
import CerysButton from "../../CerysButton";
import { oBARelevantTransView } from "../../../assignment/assignment-management/opening-balance-adjustments";
import { Session } from "../../../classes/session";

interface OpeningBalanceAdjustmentsProps {
  handleView: (view) => void;
  session: Session;
}

const OpeningBalanceAdjustments = ({ session }: OpeningBalanceAdjustmentsProps) => {
  return (
    <>
      <CerysButton buttonText={"Review Transactions"} handleClick={() => oBARelevantTransView(session)} />
      <CerysButton buttonText={"Generate Worksheet"} handleClick={() => oBARelevantTransView(session)} />
    </>
  );
};

export default OpeningBalanceAdjustments;
