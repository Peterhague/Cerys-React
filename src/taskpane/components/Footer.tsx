import * as React from "react";
import CerysButton from "./CerysButton";
import { handleEditButtonClick } from "../utils/helperFunctions";
import { Session } from "../classes/session";

interface footerProps {
  handleView: (view) => void;
  setEditButton: (state) => void;
  editButton: string;
  session: Session;
}

const Footer = ({ editButton, session }: footerProps) => {
  return (
    <>
      <>
        {editButton === "show" && (
          <CerysButton buttonText={"Show"} handleClick={() => handleEditButtonClick(session)} />
        )}
      </>
      <>
        {editButton === "hide" && (
          <CerysButton buttonText={"Hide"} handleClick={() => handleEditButtonClick(session)} />
        )}
      </>
    </>
  );
};

export default Footer;
