import * as React from "react";
import { useState, useRef } from "react";
import CerysButton from "../../CerysButton";
import NomCodeInput from "../../Utils/NomCodeInput";
import { setExcelRangeValue } from "../../../utils.ts/worksheet";
import { callNextView, getUpdatedTransactions } from "../../../utils.ts/helperFunctions";
import { handleClientCodeMapping } from "../../../assignment/assignment-management/opening-balance-adjustments";
import { createEditableCell } from "../../../classes/editable-cell";
import { Session } from "../../../classes/session";
import { ClientCerysCodeObject, ClientCodeObject } from "../../../interfaces/interfaces";

interface nomCodeSelectionProps {
  handleView: (view) => void;
  session: Session;
  chart: ClientCerysCodeObject[] | ClientCodeObject[];
}

const NomCodeSelection = ({ handleView, session, chart }: nomCodeSelectionProps) => {
  const [nominalCode, setNominalCode] = useState("");
  const [nominalCodeName, setNominalCodeName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDisplay, setSearchDisplay] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  /* global Excel */

  const handleSubmit = async (e) => {
    try {
      await Excel.run(async (context) => {
        e.preventDefault();
        if (!nominalCode) return;
        const wsName = session.activeEditableCell.wsName;
        const range = session.activeEditableCell.getRange();
        if (session.activeEditableCell.options.action === "clientCodeMapping") {
          handleClientCodeMapping(session, nominalCode, nominalCodeName);
        } else {
          await setExcelRangeValue(wsName, range, nominalCode);
        }
        session.activeEditableCell = createEditableCell(null, null, null);
        await context.sync();
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleGoBack = (e) => {
    e.preventDefault();
    session.activeEditableCell = createEditableCell(null, null, null);
    if (getUpdatedTransactions(session).length > 0) {
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
