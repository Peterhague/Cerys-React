import { Session } from "../../classes/session";
import { ClientTransactionProps } from "../../interfaces/interfaces";
import { STANDARD_NUMBER_FORMAT } from "../../static-values/worksheet-formats";
import { getClientNomDetail } from "../taskpane/client-system-access";
import { addOneWorksheet } from "../worksheet";
/* global Excel */

// Called by a click on the client code in the Cerys code analysis sheets.
// Generates an array of client's relevant transactions and calls
// clientNomDetailView to generate a worksheet-based view to display the data.
export async function showClientNominalDetail(e: Excel.WorksheetSingleClickedEventArgs, session: Session) {
  try {
    await Excel.run(async (context) => {
      console.log("next...");
      const address = e.address;
      const ws = context.workbook.worksheets.getActiveWorksheet();
      const range = ws.getRange(`${address}:${address}`);
      const values = range.load("values");
      await context.sync();
      const innerValues = values.values;
      const clientCode = innerValues[0][0];
      const detail = getClientNomDetail(clientCode, session);
      clientNomDetailView(session, detail);
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
}

// called by showClientNominalDetail to generate a worksheet-based view of the client
// nominal activity.
export async function clientNomDetailView(session: Session, detail: ClientTransactionProps[]) {
  try {
    await Excel.run(async (context) => {
      console.log("final destination...");
      console.log(detail);
      const { ws } = await addOneWorksheet(context, session, {
        name: `${detail[0].cerysCode} analysis`,
        addListeners: undefined,
      });
      const headerRange = ws.getRange("A1:D2");
      const headers = [
        ["Transaction", "Transaction", "Detail", "£"],
        ["Number", "Date", "", ""],
      ];
      headerRange.values = headers;
      headerRange.format.font.bold = true;
      const range = ws.getRange(`A3:D${detail.length + 2}`);
      const valuesToPost = [];
      detail.forEach((line) => {
        let arr = [];
        arr.push(line.number);
        arr.push(line.date);
        arr.push(line.detail);
        arr.push(line.value / 100);
        valuesToPost.push(arr);
      });
      range.values = valuesToPost;
      const rangeB = ws.getRange("B:B");
      rangeB.numberFormat = [["dd/mm/yyyy"]];
      const rangeD = ws.getRange("D:D");
      rangeD.numberFormat = STANDARD_NUMBER_FORMAT;
      rangeD.format.horizontalAlignment = "Right";
      const currencyRange = ws.getRange("D1:D1");
      currencyRange.format.horizontalAlignment = "Center";
      const rangeAB = ws.getRange("A:B");
      rangeAB.format.horizontalAlignment = "Left";
      range.format.autofitColumns();
      ws.activate();
    });
  } catch (e) {
    console.error(e);
  }
}
