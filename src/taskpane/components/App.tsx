import * as React from "react";
import { makeStyles } from "@fluentui/react-components";
import AppBody from "./AppBody";

interface AppProps {
  title: string;
}

const useStyles = makeStyles({
  root: {
    minHeight: "100vh",
  },
});

const App: React.FC<AppProps> = () => {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <AppBody />
    </div>
  );
};

export default App;
