import {
  addBsClickListener,
  addPlClickListener,
  addTbClickListener,
} from "../utils.ts/worksheet-drilling/cerys-drilling";

export const TRIAL_BALANCE = { name: "Trial Balance", addListeners: [addTbClickListener] };
export const PL_ACCOUNT = { name: "Profit & Loss Account", addListeners: [addPlClickListener] };
export const BALANCE_SHEET = { name: "Balance Sheet", addListeners: [addBsClickListener] };
