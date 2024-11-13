import * as React from "react";
import { useState } from "react";
import CerysButton from "../CerysButton";
import Message from "../Message";

interface userConfirmPromptProps {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
  options: { handleYes: () => void; handleNo: () => void; message: React.ReactNode };
}

const UserConfirmPrompt: React.FC<userConfirmPromptProps> = ({ options }: userConfirmPromptProps) => {
  console.log(options);
  return (
    <>
      <div>
        <Message messageText={options.message} />
        <CerysButton buttonText={"Yes"} handleView={() => options.handleYes()} />
        <CerysButton buttonText={"No"} handleView={() => options.handleNo()} />
      </div>
    </>
  );
};

export default UserConfirmPrompt;
