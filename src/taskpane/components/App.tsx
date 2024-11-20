import * as React from "react";
import { makeStyles } from "@fluentui/react-components";
import AppBody from "./AppBody";

interface AppProps {
  title: string;
  session: {};
}

const useStyles = makeStyles({
  root: {
    minHeight: "100vh",
  },
});

const App: React.FC<AppProps> = ({ session }: AppProps) => {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <AppBody session={session} />
    </div>
  );
};

export default App;
