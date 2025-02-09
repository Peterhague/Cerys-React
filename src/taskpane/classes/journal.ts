import {
  ActiveJournalProps,
  BaseCerysCodeObjectProps,
  JournalDetailsProps,
  JournalProps,
  TransactionProps,
} from "../interfaces/interfaces";
import { calculateExcelDate } from "../utils/helper-functions";
import { Session } from "./session";

export class ActiveJournal {
  journals: Journal[];
  journalsForDb: JournalForDatabase[];
  type: TransactionProps["transactionType"];
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
  transactionType: TransactionProps["transactionType"];
  transactionDate: string | Date;
  transactionDateExcel: number;
  processedAsAsset: boolean;
  representsBalanceOfClientCode: number;
  constructor(journalDetails: JournalDetailsProps) {
    this.value = journalDetails.value;
    this.narrative = journalDetails.narrative;
    this.transactionType = journalDetails.transactionType;
    this.transactionDate = journalDetails.transactionDate;
    this.transactionDateExcel = calculateExcelDate(this.transactionDate);
    this.representsBalanceOfClientCode = journalDetails.representsBalanceOfClientCode;
  }
}

export interface TransactionAttachmentProps {
  type: "cerys" | "client";
  transactionId: string;
}

export class Journal extends BaseJournal implements JournalProps {
  cerysCodeObj: BaseCerysCodeObjectProps;
  transactionAttachment: TransactionAttachmentProps;

  constructor(
    session: Session,
    journalDetails: JournalDetailsProps,
    transactionAttachment: TransactionAttachmentProps = null
  ) {
    super(journalDetails);
    this.cerysCodeObj = session.chart.find((code) => code.cerysCode === journalDetails.cerysCode);
    this.processedAsAsset = !this.cerysCodeObj.isFixedAsset;
    this.transactionAttachment = transactionAttachment;
  }
}

export class JournalForDatabase {
  transactionId?: string;
  value: number;
  narrative: string;
  transactionType: TransactionProps["transactionType"];
  transactionDate: string | Date;
  transactionDateExcel: number;
  processedAsAsset: boolean;
  representsBalanceOfClientCode: number;
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
  transactionAttachment: TransactionAttachmentProps;
  _id?: string;
  constructor(journal: Journal) {
    this.transactionId = journal.transactionId;
    this.value = journal.value;
    this.narrative = journal.narrative;
    this.transactionType = journal.transactionType;
    this.transactionDate = journal.transactionDate;
    this.transactionDateExcel = journal.transactionDateExcel;
    this.processedAsAsset = journal.processedAsAsset;
    this.representsBalanceOfClientCode = journal.representsBalanceOfClientCode;
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
    this.transactionAttachment = journal.transactionAttachment;
    this._id = journal.cerysCodeObj._id;
  }
}
