import { InTray } from "../../classes/in-trays/global";
import { Session } from "../../classes/session";
import { INTRAY_SUMMARY } from "../../static-values/views";
import { callNextView } from "../helper-functions";

export const handleInTrayRouting = (session: Session, inTray: InTray) => {
  const pathOfInTrays = renewInTraysCollections(session, inTray);
  const nextInTray = pathOfInTrays.find((tray) => tray.collections.length > 0);
  const route = nextInTray ? INTRAY_SUMMARY : null;
  if (route) {
    session.handleDynamicView(route, nextInTray);
  } else {
    callNextView(session);
  }
};

export const renewInTraysCollections = (session: Session, inTray: InTray) => {
  const path = inTray.reconstructPath();
  const inTrays = [inTray, ...path];
  inTrays.forEach((tray) => {
    tray.collections = tray.collections.filter((coll) => {
      const items = coll.getItems(session);
      return items.length > 0;
    });
  });
  return inTrays;
};
