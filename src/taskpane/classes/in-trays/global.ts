import { InTrayItemProps } from "../../interfaces/interfaces";
import { INTRAY_DETAILS } from "../../static-values/views";
import { Session } from "../session";
import { InTray, InTrayAndItem } from "./nominal-ledger";

export class InTrayItem {
  title: string;
  getSubtitle: () => string;
  getSummaryText: () => string;
  detailsAction: () => void;
  affirmativeAction: (session: Session) => void | Promise<void>;
  id: string;
  constructor(inTrayItem: InTrayItemProps) {
    this.title = inTrayItem.title;
    this.getSubtitle = inTrayItem.getSubtitle;
    this.getSummaryText = inTrayItem.getSummaryText;
    this.detailsAction = inTrayItem.detailsAction;
    this.affirmativeAction = inTrayItem.affirmativeAction;
    this.id = Math.round(Math.random() * 10000000).toString();
  }

  showDetails(session: Session, inTray: InTray) {
    this.detailsAction && this.detailsAction();
    const options = new InTrayAndItem(inTray, this);
    session.handleDynamicView(INTRAY_DETAILS, options);
  }
}
