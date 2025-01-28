import { InTrayItemProps } from "../../interfaces/interfaces";

export class InTrayItem {
  title: string;
  subtitle: string;
  summary: string;
  detailsAction: () => void;
  affirmativeAction: () => void;
  id: string;
  constructor(inTrayItem: InTrayItemProps) {
    this.title = inTrayItem.title;
    this.subtitle = inTrayItem.subtitle;
    this.summary = inTrayItem.summary;
    this.detailsAction = inTrayItem.detailsAction;
    this.affirmativeAction = inTrayItem.affirmativeAction;
    this.id = Math.round(Math.random() * 10000000).toString();
  }
}
