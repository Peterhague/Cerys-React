import * as React from "react";
import CerysButton from "../CerysButton";
import Message from "../Message";
import { ViewOptions } from "../../classes/view-options";

interface userConfirmPromptProps {
  handleView: (view: string) => void;
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
