import * as React from "react";
import { useState } from "react";
import CerysButton from "../../CerysButton";
import { accessExcelContext, clearNextViewButOne } from "../../../utils/helperFunctions";
import { activateWorksheet, deleteManyWorksheets } from "../../../utils/worksheet";
import { checkNewTransForAssets } from "../../../utils/transactions/transactions";
import { Session } from "../../../classes/session";
/* global Excel */

interface deleteSheetPromptProps {
  handleView: (view: string) => void;
  session: Session;
}

const DeleteSheetPrompt = ({ session }: deleteSheetPromptProps) => {
  const sheetsToDelete = session.editableSheets.filter((i) => i.promptDeletion).map((i) => i.name);
  const [emptySheets, setEmptySheets] = useState(sheetsToDelete);

  clearNextViewButOne(session);

  const deleteSheets = async () => {
    try {
      await Excel.run(async (context) => {
        deleteManyWorksheets(context, sheetsToDelete);
        checkNewTransForAssets(session);
        session.options.updatedTransactions = [];
      });
    } catch (e) {
      console.error(e);
    }
  };

  const deleteSingleWorksheet = async (sheetName: string) => {
    try {
      await Excel.run(async (context) => {
        await deleteManyWorksheets(context, [sheetName]);
        const newArr = [];
        session.editableSheets.forEach((ws) => {
          if (ws.name !== sheetName) newArr.push(ws);
        });
        setEmptySheets(newArr);
      });
    } catch (e) {
      console.error(e);
    }
  };

  const skipDeleteSheets = () => {
    checkNewTransForAssets(session);
    session.options.updatedTransactions = [];
  };

  return (
    <>
      {emptySheets.length === 1 && (
        <>
          <p>{sheetsToDelete[0]} transactions all reposted. Would you like to delete this sheet?</p>
          <div>
            <CerysButton buttonText={"YES"} handleClick={() => deleteSheets()} />
            <CerysButton buttonText={"NO"} handleClick={() => skipDeleteSheets()} />
          </div>
        </>
      )}
      {emptySheets.length > 1 && (
        <>
          <p>Transactions all reposted from the following sheets:</p>
          <table>
            <tbody>
              {sheetsToDelete.map((sheet, index) => (
                <tr key={index}>
                  <td>{sheet}</td>
                  <td>
                    <button onClick={() => accessExcelContext(activateWorksheet, [sheet])}>View</button>
                    <button onClick={() => deleteSingleWorksheet(sheet)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            <CerysButton buttonText={"DELETE ALL"} handleClick={() => deleteSheets()} />
            <CerysButton buttonText={"SKIP"} handleClick={() => skipDeleteSheets()} />
          </div>
        </>
      )}
    </>
  );
};

export default DeleteSheetPrompt;
