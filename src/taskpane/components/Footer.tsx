import * as React from "react";
import CerysButton from "./CerysButton";
import { getActiveWorksheet, highlightEditableRanges, unhighlightEditableRanges } from "../utils.ts/worksheet";
import { handleEditButtonClick } from "../utils.ts/helperFunctions";

interface footerProps {
  handleView: (view) => void;
  setEditButton: (state) => void;
  editButton: string;
  session: {};
}

const Footer: React.FC<footerProps> = ({ editButton, session }: footerProps) => {
  //const handleShow = async () => {
  //  const ws = await getActiveWorksheet();
  //  session["editableSheets"].forEach((sheet) => {
  //    if (sheet.name === ws["name"]) {
  //      console.log(sheet);
  //      highlightEditableRanges(sheet.editableRanges);
  //    }
  //  });
  //  setEditButton("hide");
  //};

  //const handleHide = async () => {
  //  const ws = await getActiveWorksheet();
  //  session["editableSheets"].forEach((sheet) => {
  //    if (sheet.name === ws["name"]) {
  //      console.log(sheet);
  //      unhighlightEditableRanges(sheet);
  //    }
  //  });
  //  setEditButton("show");
  //};

  return (
    <>
      <>
        {editButton === "show" && <CerysButton buttonText={"Show"} handleView={() => handleEditButtonClick(session)} />}
      </>
      <>
        {editButton === "hide" && <CerysButton buttonText={"Hide"} handleView={() => handleEditButtonClick(session)} />}
      </>
    </>
  );
};

export default Footer;
