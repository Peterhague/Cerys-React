import * as React from "react";
import { Button, tokens, makeStyles } from "@fluentui/react-components";

interface CerysButtonProps {
  buttonText: string;
  handleView: (view) => void;
}

const useStyles = makeStyles({
  instructions: {
    fontWeight: tokens.fontWeightSemibold,
    marginTop: "20px",
    marginBottom: "10px",
  },
  textPromptAndInsertion: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  textAreaField: {
    marginLeft: "20px",
    marginTop: "30px",
    marginBottom: "20px",
    marginRight: "20px",
    maxWidth: "50%",
  },
});

const CerysButton: React.FC<CerysButtonProps> = (props: CerysButtonProps) => {
  const styles = useStyles();

  return (
    <div className={styles.textPromptAndInsertion}>
      <Button appearance="primary" disabled={false} size="large" onClick={props.handleView}>
        {props.buttonText}
      </Button>
    </div>
  );
};

export default CerysButton;
