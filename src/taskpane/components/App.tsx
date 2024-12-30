import * as React from "react";
import { makeStyles } from "@fluentui/react-components";
import AppBody from "./AppBody";
import { Session } from "../classes/session";

interface AppProps {
  title: string;
  session: Session;
}

const useStyles = makeStyles({
  root: {
    minHeight: "100vh",
  },
});

const App = ({ session }: AppProps) => {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <AppBody session={session} />
    </div>
  );
};

export default App;
