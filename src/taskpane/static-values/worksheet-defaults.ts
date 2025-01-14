import { WorksheetDefaults } from "../interfaces/interfaces";
import { addBsClickListener, addPlClickListener, addTbClickListener } from "../utils/worksheet-drilling/cerys-drilling";
import { BS_WSNAME, PL_WSNAME, TB_WSNAME } from "./worksheet-names";

export const TRIAL_BALANCE: WorksheetDefaults = { name: TB_WSNAME, addListeners: [addTbClickListener] };
export const PL_ACCOUNT: WorksheetDefaults = { name: PL_WSNAME, addListeners: [addPlClickListener] };
export const BALANCE_SHEET: WorksheetDefaults = { name: BS_WSNAME, addListeners: [addBsClickListener] };
