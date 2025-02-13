import { InTray, InTrayAndParentInTray } from "../../classes/in-trays/global";
import { Session } from "../../classes/session";
import { INTRAY_NESTED_SUMMARY, INTRAY_SUMMARY } from "../../static-values/views";
import { callNextView } from "../helper-functions";

export const handleInTrayRouting = (session: Session, inTray: InTray) => {
  renewInTrayCollections(session, inTray);
  let route = null;
  if (inTray.collections.length > 0) {
    route = inTray.parentInTray ? INTRAY_NESTED_SUMMARY : INTRAY_SUMMARY;
  }
  if (route) {
    const routeOptions = inTray.parentInTray ? new InTrayAndParentInTray(inTray, inTray.parentInTray) : inTray;
    session.handleDynamicView(route, routeOptions);
  } else {
    callNextView(session);
  }
};

export const renewInTrayCollections = (session: Session, inTray: InTray) => {
  inTray.collections = inTray.collections.filter((coll) => {
    const items = coll.getItems(session);
    return items.length > 0;
  });
};
