import { ViewOptionsProps } from "../interfaces/interfaces";

export const BLANK_VIEW_OPTIONS: ViewOptionsProps = {
  handleYes: () => console.log("yes"),
  handleNo: () => console.log("no"),
  message: undefined,
  yesButtonText: "Yes",
  noButtonText: "No",
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
