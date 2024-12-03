import * as React from "react";
import CerysButton from "../CerysButton";
import Message from "../Message";

interface userConfirmPromptProps {
  handleView: (view) => void;
  session: {};
  options: { handleYes: () => void; handleNo: () => void; message: React.ReactNode };
}

const UserConfirmPrompt: React.FC<userConfirmPromptProps> = ({ options }: userConfirmPromptProps) => {
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
