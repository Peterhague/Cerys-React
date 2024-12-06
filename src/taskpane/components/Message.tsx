import * as React from "react";
//import { Button, tokens, makeStyles } from "@fluentui/react-components";

interface MessageProps {
  messageText: React.ReactNode;
}

const Message = ({ messageText }: MessageProps) => {
  return <div>{messageText}</div>;
};

export default Message;
