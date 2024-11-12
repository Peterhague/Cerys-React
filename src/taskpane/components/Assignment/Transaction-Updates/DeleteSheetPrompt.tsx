import * as React from "react";
import { useState } from "react";
import CerysButton from "../../CerysButton";
import { clearNextViewButOne } from "../../../utils.ts/helperFunctions";
import { activateWorksheet, deleteManyWorksheets } from "../../../utils.ts/worksheet";
import { checkNewTransForAssets } from "../../../utils.ts/transactions/transactions";

interface deleteSheetPromptProps {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const DeleteSheetPrompt: React.FC<deleteSheetPromptProps> = ({
  //handleView,
  session,
  //updateSession,
}: deleteSheetPromptProps) => {
  const sheetsToDelete = [];
  session["editableSheets"].forEach((sheet) => {
    if (sheet.promptDeletion) {
      sheetsToDelete.push(sheet.name);
    }
  });
  const [emptySheets, setEmptySheets] = useState(sheetsToDelete);

  clearNextViewButOne(session);

  const deleteSheets = async () => {
    await deleteManyWorksheets(sheetsToDelete);
    checkNewTransForAssets(session, session["options"].updatedTransactions);
    session["options"].updatedTransactions = [];
  };

  const deleteSingleWorksheet = async (sheet) => {
    await deleteManyWorksheets([sheet]);
    const newArr = [];
    session["editableSheets"].forEach((ws) => {
      if (ws.name !== sheet) newArr.push(ws);
    });
    setEmptySheets(newArr);
  };

  const skipDeleteSheets = () => {
    checkNewTransForAssets(session, session["options"].updatedTransactions);
    session["options"].updatedTransactions = [];
  };

  return (
    <>
      {emptySheets.length === 1 && (
        <>
          <p>{sheetsToDelete[0]} transactions all reposted. Would you like to delete this sheet?</p>
          <div>
            <CerysButton buttonText={"YES"} handleView={() => deleteSheets()} />
            <CerysButton buttonText={"NO"} handleView={() => skipDeleteSheets()} />
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
                    <button onClick={() => activateWorksheet(sheet)}>View</button>
                    <button onClick={() => deleteSingleWorksheet(sheet)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            <CerysButton buttonText={"DELETE ALL"} handleView={() => deleteSheets()} />
            <CerysButton buttonText={"SKIP"} handleView={() => skipDeleteSheets()} />
          </div>
        </>
      )}
    </>
  );
};

export default DeleteSheetPrompt;
