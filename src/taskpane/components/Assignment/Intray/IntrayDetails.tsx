import * as React from "react";
//import { useState } from "react";
import CerysButton from "../../CerysButton";
import { Session } from "../../../classes/session";
import { InTray, InTrayItem } from "../../../classes/in-trays/global";
import { ASSIGNMENT_DASH_HOME, INTRAY_SUMMARY } from "../../../static-values/views";

interface IntrayDetailsProps {
  handleView: (view: string) => void;
  session: Session;
  options: { inTrayItem: InTrayItem; inTray: InTray };
}

const IntrayDetails = ({ session, options, handleView }: IntrayDetailsProps) => {
  const { inTrayItem, inTray } = options;

  const handleIgnore = () => {
    inTray.deleteThisItem(inTrayItem);
    session.handleDynamicView(INTRAY_SUMMARY, inTray);
  };

  const handleAddToAssignmentInTray = () => {
    inTray.deleteThisItem(inTrayItem);
    session.assignment.inTray.addItem(inTrayItem);
    session.handleDynamicView(INTRAY_SUMMARY, inTray);
  };

  const handleAffirmative = async () => {
    await inTrayItem.affirmativeAction(session);
    inTray.deleteThisItem(inTrayItem);
    session.handleDynamicView(INTRAY_SUMMARY, inTray);
  };

  return (
    <>
      <p>{options.inTrayItem.getSummaryText()}</p>
      <CerysButton buttonText={"Yes"} handleClick={handleAffirmative} />
      <CerysButton buttonText={"Add to assignment intray"} handleClick={handleAddToAssignmentInTray} />
      <CerysButton buttonText={"Ignore"} handleClick={handleIgnore} />
      <CerysButton
        buttonText={"Return to In-tray"}
        handleClick={() => session.handleDynamicView(INTRAY_SUMMARY, inTray)}
      />
      <CerysButton buttonText={"Assignment Home"} handleClick={() => handleView(ASSIGNMENT_DASH_HOME)} />
    </>
  );
};

export default IntrayDetails;
