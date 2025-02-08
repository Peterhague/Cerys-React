import * as React from "react";
//import { useState } from "react";
import CerysButton from "../../CerysButton";
import { Session } from "../../../classes/session";
import { InTray, InTrayAndParentInTray, InTrayItem } from "../../../classes/in-trays/global";
import { ASSIGNMENT_DASH_HOME, INTRAY_NESTED_SUMMARY, INTRAY_SUMMARY } from "../../../static-values/views";

interface IntrayDetailsProps {
  handleView: (view: string) => void;
  session: Session;
  options: { inTrayItem: InTrayItem; inTray: InTray };
}

const IntrayDetails = ({ session, options, handleView }: IntrayDetailsProps) => {
  const { inTrayItem, inTray } = options;

  const handleIgnore = () => {
    console.log(inTray);
    console.log(inTrayItem);
    //inTray.deleteThisItem(inTrayItem);
    session.handleDynamicView(INTRAY_SUMMARY, inTray);
  };

  const handleAffirmative = async () => {
    await inTrayItem.affirmativeAction(session);
    //inTray.deleteThisItem(inTrayItem);
  };

  const handleReturn = () => {
    const route = inTray.parentInTray ? INTRAY_NESTED_SUMMARY : INTRAY_SUMMARY;
    const options = inTray.parentInTray ? new InTrayAndParentInTray(inTray, inTray.parentInTray) : inTray;
    session.handleDynamicView(route, options);
  };

  return (
    <>
      <p>{options.inTrayItem.getSummaryText()}</p>
      <CerysButton buttonText={"Yes"} handleClick={handleAffirmative} />
      <CerysButton buttonText={"Ignore"} handleClick={handleIgnore} />
      <CerysButton buttonText={"Return to In-tray"} handleClick={handleReturn} />
      <CerysButton buttonText={"Assignment Home"} handleClick={() => handleView(ASSIGNMENT_DASH_HOME)} />
    </>
  );
};

export default IntrayDetails;
