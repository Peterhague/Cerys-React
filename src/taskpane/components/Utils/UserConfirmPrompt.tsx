import * as React from "react";
import CerysButton from "../CerysButton";
import Message from "../Message";

interface userConfirmPromptProps {
  handleView: (view) => void;
  session: {};
  options: {
    handleYes: () => void;
    handleNo: () => void;
    message: React.ReactNode;
    yesButtonText: string;
    noButtonText: string;
  };
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
