import * as React from "react";
import { useState, useRef } from "react";
import CerysButton from "../../CerysButton";
import NomCodeInput from "../../Utils/NomCodeInput";
import { setExcelRangeValue } from "../../../utils.ts/worksheet";
import { colNumToLetter } from "../../../utils.ts/excel-col-conversion";
import { callNextView, resetActiveEditableCellObj } from "../../../utils.ts/helperFunctions";
interface nomCodeSelectionProps {
  handleView: (view) => void;
  session: {};
}

const NomCodeSelection = ({ handleView, session }: nomCodeSelectionProps) => {
  const [nominalCode, setNominalCode] = useState("");
  const [nominalCodeName, setNominalCodeName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDisplay, setSearchDisplay] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const wsName = session["activeEditableCell"].wsName;
    const colNum = session["activeEditableCell"].addressObj.firstCol;
    const col = colNumToLetter(colNum);
    const row = session["activeEditableCell"].addressObj.firstRow;
    const range = `${col}${row}:${col}${row}`;
    await setExcelRangeValue(wsName, range, nominalCode);
    session["activeEditableCell"] = resetActiveEditableCellObj();
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
