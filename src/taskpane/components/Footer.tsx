import * as React from "react";
import CerysButton from "./CerysButton";
import { handleEditButtonClick } from "../utils.ts/helperFunctions";

interface footerProps {
  handleView: (view) => void;
  setEditButton: (state) => void;
  editButton: string;
  session: {};
}

const Footer: React.FC<footerProps> = ({ editButton, session }: footerProps) => {
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
