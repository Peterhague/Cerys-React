import * as React from "react";
//import { useState } from "react";
import CerysButton from "../../CerysButton";
import { Session } from "../../../classes/session";
import { InTrayItem } from "../../../classes/in-trays/global";
import { ASSIGNMENT_DASH_HOME, INTRAY_SUMMARY } from "../../../static-values/views";
import { InTray } from "../../../classes/in-trays/nominal-ledger";

interface IntrayDetailsProps {
  handleView: (view: string) => void;
  session: Session;
  options: { inTrayItem: InTrayItem; inTray: InTray };
}

const IntrayDetails = ({ session, options, handleView }: IntrayDetailsProps) => {
  const { inTrayItem, inTray } = options;
  return (
    <>
      <p>{options.inTrayItem.getSummaryText()}</p>
      <CerysButton buttonText={"Yes"} handleClick={async () => await inTrayItem.affirmativeAction(session)} />
      <CerysButton buttonText={"Add to intray"} handleClick={() => inTrayItem.affirmativeAction(session)} />
      <CerysButton buttonText={"Ignore"} handleClick={() => inTrayItem.affirmativeAction(session)} />
      <CerysButton
        buttonText={"Return to In-tray"}
        handleClick={() => session.handleDynamicView(INTRAY_SUMMARY, inTray)}
      />
      <CerysButton buttonText={"Assignment Home"} handleClick={() => handleView(ASSIGNMENT_DASH_HOME)} />
    </>
  );
};

export default IntrayDetails;
