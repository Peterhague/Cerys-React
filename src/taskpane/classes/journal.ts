import { BaseCerysCodeObjectProps, JournalDetailsProps, JournalProps } from "../interfaces/interfaces";
import { calculateExcelDate } from "../utils/helper-functions";
import { Session } from "./session";

export class Journal implements JournalProps {
  cerysCodeObj: BaseCerysCodeObjectProps;
  transactionId?: string;
  value: number;
  narrative: string;
  transactionType: string;
  clientTB: boolean;
  journal: boolean;
  transactionDate: string | Date;
  transactionDateExcel: number;
  processedAsAsset: boolean;

  constructor(session: Session, journalDetails: JournalDetailsProps) {
    this.cerysCodeObj = session.chart.find((code) => code.cerysCode === journalDetails.cerysCode);
    const value = journalDetails.value;
    const numberValue = typeof value === "string" ? parseFloat(value) : value;
    this.value = numberValue * 100;
    this.narrative = journalDetails.narrative;
    this.transactionType = journalDetails.transactionType;
    this.clientTB = journalDetails.clientTB;
    this.journal = journalDetails.journal;
    this.transactionDate = journalDetails.transactionDate;
    this.transactionDateExcel = calculateExcelDate(this.transactionDate);
    this.processedAsAsset = !this.cerysCodeObj.isFixedAsset;
  }
}
