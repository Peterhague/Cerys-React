import { WorksheetDefaults } from "../interfaces/interfaces";
import {
  addBsClickListener,
  addPlClickListener,
  addTbClickListener,
} from "../utils.ts/worksheet-drilling/cerys-drilling";

export const TRIAL_BALANCE: WorksheetDefaults = { name: "Trial Balance", addListeners: [addTbClickListener] };
export const PL_ACCOUNT: WorksheetDefaults = { name: "Profit & Loss Account", addListeners: [addPlClickListener] };
export const BALANCE_SHEET: WorksheetDefaults = { name: "Balance Sheet", addListeners: [addBsClickListener] };
