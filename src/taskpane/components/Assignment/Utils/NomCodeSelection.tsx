import * as React from "react";
import { useState, useRef } from "react";
import CerysButton from "../../CerysButton";
import NomCodeInput from "../../Utils/NomCodeInput";
import { setExcelRangeValue } from "../../../utils.ts/worksheet";
import { colNumToLetter } from "../../../utils.ts/excel-col-conversion";
import { callNextView, resetActiveEditableCellObj } from "../../../utils.ts/helperFunctions";
import { bFPrevPeriodMessage } from "../../../utils.ts/messages";
interface nomCodeSelectionProps {
  handleView: (view) => void;
  session: {};
  chart: [
    {
      cerysCode: number;
      cerysName: string;
      cerysExcelName: string;
      clientCode: number;
      clientCodeName: string;
      _id: string;
    },
  ];
}

const NomCodeSelection = ({ handleView, session, chart }: nomCodeSelectionProps) => {
  const [nominalCode, setNominalCode] = useState("");
  const [nominalCodeName, setNominalCodeName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDisplay, setSearchDisplay] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nominalCode) return;
    const wsName = session["activeEditableCell"].wsName;
    const colNum = session["activeEditableCell"].addressObj.firstCol;
    const col = colNumToLetter(colNum);
    const row = session["activeEditableCell"].addressObj.firstRow;
    const range = `${col}${row}:${col}${row}`;
    if (session["activeEditableCell"].options.action === "clientCodeMapping") {
      handleClientCodeMapping(wsName, range);
    } else {
      await setExcelRangeValue(wsName, range, nominalCode);
    }
    session["activeEditableCell"] = resetActiveEditableCellObj();
  };

  const handleClientCodeMapping = (wsName, range) => {
    const options = {
      handleYes: () => console.log("yes"),
      handleNo: () => setExcelRangeValue(wsName, range, nominalCode),
      message: bFPrevPeriodMessage,
    };
    session["handleDynamicView"]("userConfirmPrompt", options);
  };

  const handleGoBack = (e) => {
    e.preventDefault();
    session["activeEditableCell"] = resetActiveEditableCellObj();
    if (session["updatedTransactions"].length > 0) {
      handleView("handleTransUpdates");
    } else {
      callNextView(session);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} id="nomcodeSelectionForm" action="">
        <h3>Select Nominal Code</h3>
        <NomCodeInput
          ref={inputRef}
          chart={chart}
          session={session}
          nominalCode={nominalCode}
          setNominalCode={setNominalCode}
          nominalCodeName={nominalCodeName}
          setNominalCodeName={setNominalCodeName}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchDisplay={searchDisplay}
          setSearchDisplay={setSearchDisplay}
        />
        <div>
          <button type="submit">Submit</button>
          <button onClick={(e) => handleGoBack(e)}>Back</button>
        </div>
      </form>
      <CerysButton buttonText={"Return"} handleClick={() => handleView("landingPage")} />
    </>
  );
};

export default NomCodeSelection;
