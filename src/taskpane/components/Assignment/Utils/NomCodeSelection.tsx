import * as React from "react";
import { useState } from "react";
import CerysButton from "../../CerysButton";
import NomCodeInput from "../../Utils/NomCodeInput";
import { setExcelRangeValue } from "../../../utils.ts/worksheet";
import { colNumToLetter } from "../../../utils.ts/excel-col-conversion";
import { callNextView } from "../../../utils.ts/helperFunctions";
interface nomCodeSelectionProps {
  handleView: (view) => void;
  session: {};
}

const NomCodeSelection: React.FC<nomCodeSelectionProps> = ({ handleView, session }: nomCodeSelectionProps) => {
  const [nominalCode, setNominalCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const wsName = session["activeEditableCell"].wsName;
    const colNum = session["activeEditableCell"].addressObj.firstCol;
    const col = colNumToLetter(colNum);
    const row = session["activeEditableCell"].addressObj.firstRow;
    const range = `${col}${row}:${col}${row}`;
    await setExcelRangeValue(wsName, range, nominalCode);
    session["activeEditableCell"] = {};
  };

  return (
    <>
      <form onSubmit={handleSubmit} id="nomcodeSelectionForm" action="">
        <h3>Select Nominal Code</h3>
        <NomCodeInput session={session} nominalCode={nominalCode} setNominalCode={setNominalCode} />
        <div>
          <button type="submit">Submit</button>
          <button onClick={() => callNextView(session)}>Back</button>
        </div>
      </form>
      <CerysButton buttonText={"Return"} handleClick={() => handleView("landingPage")} />
    </>
  );
};

export default NomCodeSelection;
