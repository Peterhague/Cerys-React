import { InTray } from "../../classes/in-trays/global";
import { Session } from "../../classes/session";
import { INTRAY_SUMMARY } from "../../static-values/views";
import { callNextView } from "../helper-functions";

export const handleInTrayRouting = (session: Session, inTray: InTray) => {
  const pathOfInTrays = renewInTraysCollections(session, inTray);
  const nextInTray = pathOfInTrays.find((tray) => tray.collections.length > 0);
  if (nextInTray) {
    session.handleDynamicView(INTRAY_SUMMARY, nextInTray);
  } else {
    callNextView(session);
  }
};

export const renewInTraysCollections = (session: Session, inTray: InTray) => {
  const path = inTray.reconstructPath();
  const inTrays = [inTray, ...path];
  inTrays.forEach((tray) => {
    tray.collections = tray.collections.filter((coll) => {
      const itemsCount = coll.getItems(session);
      return itemsCount.length > 0;
    });
  });
  return inTrays;
};
