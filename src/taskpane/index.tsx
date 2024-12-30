import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import { Session } from "./classes/session";

/* global Office */

const title = "Contoso Task Pane Add-in";
const session = new Session();

const rootElement: HTMLElement | null = document.getElementById("container");
const root = rootElement ? createRoot(rootElement) : undefined;

/* Render application after Office initializes */
Office.onReady(() => {
  root?.render(
    <FluentProvider theme={webLightTheme}>
      <App title={title} session={session} />
    </FluentProvider>
  );
});

if ((module as any).hot) {
  (module as any).hot.accept("./components/App", () => {
    const NextApp = require("./components/App").default;
    root?.render(NextApp);
  });
}
