import { InTrayItemProps } from "../../interfaces/interfaces";
import { INTRAY_DETAILS } from "../../static-values/views";
import { Session } from "../session";

export class InTrayItem {
  title: string;
  subtitle: string;
  summary: string;
  detailsAction: () => void;
  affirmativeAction: (session: Session) => void | Promise<void>;
  id: string;
  constructor(inTrayItem: InTrayItemProps) {
    this.title = inTrayItem.title;
    this.subtitle = inTrayItem.subtitle;
    this.summary = inTrayItem.summary;
    this.detailsAction = inTrayItem.detailsAction;
    this.affirmativeAction = inTrayItem.affirmativeAction;
    this.id = Math.round(Math.random() * 10000000).toString();
  }

  showDetails(session: Session) {
    this.detailsAction && this.detailsAction();
    session.handleDynamicView(INTRAY_DETAILS, this);
  }
}
