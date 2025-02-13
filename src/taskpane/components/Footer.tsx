import * as React from "react";
import CerysButton from "./CerysButton";
import { handleEditButtonClick } from "../utils/helper-functions";
import { Session } from "../classes/session";

interface footerProps {
  handleView: (view: string) => void;
  setEditButton: (state: string) => void;
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
      <CerysButton buttonText="Log Session" handleClick={() => console.log(session)} />
    </>
  );
};

export default Footer;
