import * as React from "react";
import CerysButton from "../CerysButton";
import Message from "../Message";
import { ViewOptions } from "../../interfaces/interfaces";

interface userConfirmPromptProps {
  handleView: (view) => void;
  session: {};
  options: ViewOptions;
}

const UserConfirmPrompt = ({ options }: userConfirmPromptProps) => {
  return (
    <>
      <div>
        <Message messageText={options.message} />
        <CerysButton buttonText={options.yesButtonText} handleClick={() => options.handleYes()} />
        <CerysButton buttonText={options.noButtonText} handleClick={() => options.handleNo()} />
      </div>
    </>
  );
};

export default UserConfirmPrompt;
