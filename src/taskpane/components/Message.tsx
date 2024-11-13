import * as React from "react";
//import { Button, tokens, makeStyles } from "@fluentui/react-components";

interface MessageProps {
  //messageText: string;
  messageText: React.ReactNode;
}

//const useStyles = makeStyles({
//    instructions: {
//        fontWeight: tokens.fontWeightSemibold,
//        marginTop: "20px",
//        marginBottom: "10px",
//    },
//    textPromptAndInsertion: {
//        display: "flex",
//        flexDirection: "column",
//        alignItems: "center",
//    },
//    textAreaField: {
//        marginLeft: "20px",
//        marginTop: "30px",
//        marginBottom: "20px",
//        marginRight: "20px",
//        maxWidth: "50%",
//    },
//});

const Message: React.FC<MessageProps> = ({ messageText }: MessageProps) => {
  return <div>{messageText}</div>;
};

export default Message;
