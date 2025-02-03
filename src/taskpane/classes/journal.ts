import {
  ActiveJournalProps,
  BaseCerysCodeObjectProps,
  JournalDetailsProps,
  JournalProps,
} from "../interfaces/interfaces";
import { calculateExcelDate } from "../utils/helper-functions";
import { Session } from "./session";
import { BaseCerysCodeObject } from "./cerys-codes";

export class ActiveJournal {
  journals: Journal[];
  journalsForDb: JournalForDatabase[];
  type: "journal" | "opening balance" | "OBA auto-entry" | "clientTB" | "auto-journal" | "autoAddition";
  constructor(activeJournal: ActiveJournalProps) {
    this.journals = activeJournal ? activeJournal.journals : [];
    this.journalsForDb = [];
    this.type = activeJournal.type;
  }

  getNetValue() {
    return this.journals.reduce((total, i) => {
      return total + i.value;
    }, 0);
  }

  finaliseJournalsForDb(session: Session) {
    const amendedJnls = this.journals.map((jnl) => {
      return { ...jnl };
    });
    amendedJnls.forEach((jnl) => {
      const periodStartDate = session.assignment.reportingPeriod.periodStart.split("T")[0];
      if (jnl.narrative === "") jnl.narrative = "No narrative";
      if (jnl.transactionDate === "") {
        if (
          jnl.cerysCodeObj.assetSubCategory === "Cost bfwd" ||
          jnl.cerysCodeObj.assetSubCategory === "Amort bfwd" ||
          jnl.cerysCodeObj.assetSubCategory === "Depn bfwd"
        ) {
          jnl.transactionDate = periodStartDate;
        } else {
          jnl.transactionDate = session.assignment.reportingPeriod.reportingDateOrig;
        }
      }
      jnl.transactionDateExcel = calculateExcelDate(jnl.transactionDate);
      jnl.transactionType = this.type;
    });
    this.journalsForDb = amendedJnls.map((jnl) => new JournalForDatabase(jnl));
  }
}

class BaseJournal {
  transactionId?: string;
  value: number;
  narrative: string;
  transactionType: string;
  clientTB: boolean;
  journal: boolean;
  transactionDate: string | Date;
  transactionDateExcel: number;
  processedAsAsset: boolean;
  constructor(journalDetails: JournalDetailsProps) {
    const value = journalDetails.value;
    const numberValue = typeof value === "string" ? parseFloat(value) : value;
    this.value = numberValue * 100;
    this.narrative = journalDetails.narrative;
    this.transactionType = journalDetails.transactionType;
    this.clientTB = journalDetails.clientTB;
    this.journal = journalDetails.journal;
    this.transactionDate = journalDetails.transactionDate;
    this.transactionDateExcel = calculateExcelDate(this.transactionDate);
  }
}

export class Journal extends BaseJournal implements JournalProps {
  cerysCodeObj: BaseCerysCodeObjectProps;

  constructor(session: Session, journalDetails: JournalDetailsProps) {
    super(journalDetails);
    this.cerysCodeObj = session.chart.find((code) => code.cerysCode === journalDetails.cerysCode);
    this.processedAsAsset = !this.cerysCodeObj.isFixedAsset;
  }
}

export class JournalForDatabase extends BaseJournal {
  cerysCode: number;
  cerysName: string;
  cerysShortName: string;
  cerysExcelName: string;
  cerysCategory: string;
  cerysSubCategory: string | null;
  isFixedAsset: boolean;
  assetCategory: string | null;
  assetCategoryNo: number | null;
  assetSubCategory: string | null;
  assetSubCatCode: number | null;
  assetCodeType: string | null;
  regColNameOne: string | null;
  regColNameTwo: string | null;
  altCategory: string | null;
  defaultSign: string | null;
  clientAdj: boolean;
  closeOffCode: number;
  _id?: string;
  constructor(journal: Journal) {
    const journDtlsProps = { ...journal, cerysCode: journal.cerysCodeObj.cerysCode };
    super(journDtlsProps);
    this.cerysCode = journal.cerysCodeObj.cerysCode;
    this.cerysName = journal.cerysCodeObj.cerysName;
    this.cerysShortName = journal.cerysCodeObj.cerysShortName;
    this.cerysExcelName = journal.cerysCodeObj.cerysExcelName;
    this.cerysCategory = journal.cerysCodeObj.cerysCategory;
    this.cerysSubCategory = journal.cerysCodeObj.cerysSubCategory;
    this.isFixedAsset = journal.cerysCodeObj.isFixedAsset;
    this.assetCategory = journal.cerysCodeObj.assetCategory;
    this.assetCategoryNo = journal.cerysCodeObj.assetCategoryNo;
    this.assetSubCategory = journal.cerysCodeObj.assetSubCategory;
    this.assetSubCatCode = journal.cerysCodeObj.assetSubCatCode;
    this.assetCodeType = journal.cerysCodeObj.assetCodeType;
    this.regColNameOne = journal.cerysCodeObj.regColNameOne;
    this.regColNameTwo = journal.cerysCodeObj.regColNameTwo;
    this.altCategory = journal.cerysCodeObj.altCategory;
    this.defaultSign = journal.cerysCodeObj.defaultSign;
    this.clientAdj = journal.cerysCodeObj.clientAdj;
    this.closeOffCode = journal.cerysCodeObj.closeOffCode;
    this._id = journal.cerysCodeObj._id;
  }
}
