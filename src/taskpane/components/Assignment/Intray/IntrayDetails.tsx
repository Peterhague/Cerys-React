import * as React from "react";
//import { useState } from "react";
import CerysButton from "../../CerysButton";
import { Session } from "../../../classes/session";
import { InTray, InTrayAndParentInTray, InTrayItem } from "../../../classes/in-trays/global";
import { ASSIGNMENT_DASH_HOME, INTRAY_NESTED_SUMMARY, INTRAY_SUMMARY } from "../../../static-values/views";
import { handleInTrayRouting } from "../../../utils/in-trays/in-tray-routing";

interface IntrayDetailsProps {
  handleView: (view: string) => void;
  session: Session;
  options: { inTrayItem: InTrayItem; inTray: InTray };
}

const IntrayDetails = ({ session, options, handleView }: IntrayDetailsProps) => {
  const { inTrayItem, inTray } = options;
  console.log(inTrayItem);

  const handleIgnore = () => {
    session.handleDynamicView(INTRAY_SUMMARY, inTray);
  };

  const handleAffirmative = async () => {
    await inTrayItem.affirmativeAction(session);
    // updateInTray();
    // handleReturn();
    handleInTrayRouting(session, inTray);
  };

  const handleReturn = () => {
    handleInTrayRouting(session, inTray);
    // const route = inTray.parentInTray && inTray.collections.length > 0 ? INTRAY_NESTED_SUMMARY : INTRAY_SUMMARY;
    // const routeOptions =
    //   inTray.parentInTray && inTray.collections.length > 0
    //     ? new InTrayAndParentInTray(inTray, inTray.parentInTray)
    //     : inTray;
    // session.handleDynamicView(route, routeOptions);
  };

  // const updateInTray = () => {
  //   inTray.collections.forEach((coll) => {
  //     const items = coll.getItems(session);
  //     console.log(items);
  //     if (items.length === 0) inTray.deleteCollection(coll);
  //   });
  //   console.log(inTray.collections);
  // };

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
