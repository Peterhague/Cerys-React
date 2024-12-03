import * as React from "react";
import { Button, tokens, makeStyles } from "@fluentui/react-components";

interface CerysButtonProps {
  buttonText: string;
  handleClick: (view) => void;
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

const CerysButton: React.FC<CerysButtonProps> = ({ buttonText, handleClick }: CerysButtonProps) => {
  const styles = useStyles();

  return (
    <div className={styles.textPromptAndInsertion}>
      <Button appearance="primary" disabled={false} size="large" onClick={handleClick}>
        {buttonText}
      </Button>
    </div>
  );
};

export default CerysButton;
