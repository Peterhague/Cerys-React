import { getCerysNomDetailPL } from "../taskpane/cerys-item-retrieval";
import { addWorksheet, getWorksheet } from "../worksheet";
import { showClientNominalDetail } from "./client-drilling";

export async function addPlClickListener(activeAssignment) {
  try {
    await Excel.run(async (context) => {
      const ws = context.workbook.worksheets.getItem("Profit & loss account");
      ws.onSingleClicked.add(async (e) => showNominalDetailPL(e, activeAssignment, context));
      activeAssignment.pLListenerAdded = true;

      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
}
export async function showNominalDetailPL(e, activeAssignment, context) {
  const address = e.address;
  console.log("working");
  if (address[0] !== "A") return;
  const ws = context.workbook.worksheets.getItem("Profit & loss account");
  const range = ws.getRange(`${address}:${address}`);
  const values = range.load("values");
  await context.sync();
  const innerValues = values.values;
  const category = innerValues[0][0];
  console.log(category);
  const detail = getCerysNomDetailPL(category, activeAssignment);
  await context.sync();
  console.log(detail);
  cerysNomDetailViewPL(context, detail, activeAssignment);
}
export async function cerysNomDetailViewPL(context, detail, activeAssignment) {
  addWorksheet(context, `${detail[0][0].cerysCategory} analysis`);
  await context.sync();
  const ws = getWorksheet(context, `${detail[0][0].cerysCategory} analysis`);
  const valuesToPost = [];
  detail.forEach((code) => {
    valuesToPost.push([`Nominal Code ${code[0].cerysCode}: ${code[0].cerysName}`, "", "", ""]);
    valuesToPost.push(["", "", "", ""]);
    code.forEach((line) => {
      let arr = [];
      arr.push(line.transactionType);
      line.clientNominalCode > 0 ? arr.push(line.clientNominalCode) : arr.push("NA");
      arr.push(line.narrative);
      arr.push(line.value / 100);
      valuesToPost.push(arr);
    });
    valuesToPost.push(["", "", "", ""]);
  });
  const range = ws.getRange(`A1:D${valuesToPost.length}`);
  range.values = valuesToPost;
  ws.activate();
  ws.onSingleClicked.add(async (e) => showClientNominalDetail(e, activeAssignment));
  await context.sync();
}
