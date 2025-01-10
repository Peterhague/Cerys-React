/*global Excel */
import { Session } from "../classes/session";
import { ViewOptions } from "../interfaces/interfaces";

export const BLANK_VIEW_OPTIONS: ViewOptions = {
  handleYes: () => console.log("yes"),
  handleNo: () => console.log("no"),
  message: undefined,
  yesButtonText: "Yes",
  noButtonText: "No",
  registerType: {
    initials: "",
    longLower: "",
    longCap: "",
    createRegister: async (context: Excel.RequestContext, session: Session) => console.log(context, session),
  },
  nominalCode: "",
  nominalCodeName: "",
  cerysCode: 0,
  wsName: "",
};

export const getViewOptions = (targets: { key: string; value: any }[]) => {
  const template = BLANK_VIEW_OPTIONS;
  targets.forEach((target) => (template[target.key] = target.value));
  return template;
};
