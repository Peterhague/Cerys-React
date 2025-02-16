import * as React from "react";
import { Fragment } from "react";
import { Session } from "../../../classes/session";
import { ASSIGNMENT_DASH_HOME, INTRAY_SUMMARY } from "../../../static-values/views";
import CerysButton from "../../CerysButton";
import { InTray, InTrayItem } from "../../../classes/in-trays/global";
import { handleInTrayRouting } from "../../../utils/in-trays/in-tray-routing";

interface IntraySummaryProps {
  handleView: (view: string) => void;
  session: Session;
  inTray: InTray;
}

const IntraySummary = ({ session, inTray, handleView }: IntraySummaryProps) => {
  const path = inTray.reconstructPath();
  const handleInTray = (childInTray: InTray) => {
    session.handleDynamicView(INTRAY_SUMMARY, childInTray);
  };

  return (
    <>
      {" "}
      {inTray.collections.map((coll) => (
        <Fragment key={coll.id}>
          {coll.title && coll.getItems(session).length > 0 && <p>{coll.title}</p>}
          <table>
            <tbody>
              {coll.getItems(session).map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.title}
                    {item instanceof InTrayItem && item.getSubtitle() && item.getSubtitle()}
                  </td>
                  <td>
                    {item instanceof InTrayItem && (
                      <button type="button" onClick={() => item.handleClick(session, inTray)}>
                        Details
                      </button>
                    )}
                    {item instanceof InTray && (
                      <button type="button" onClick={() => handleInTray(item)}>
                        See more
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Fragment>
      ))}
      {inTray.parentInTray && (
        <CerysButton
          buttonText={"Go back"}
          handleClick={() => session.handleDynamicView(INTRAY_SUMMARY, inTray.parentInTray)}
        />
      )}
      <div>
        {path.length > 0 &&
          path.map((item) => (
            <button type="button" key={item.id} onClick={() => handleInTrayRouting(session, item)}>
              {item.title}
            </button>
          ))}
      </div>
      <CerysButton buttonText={"Assignment Home"} handleClick={() => handleView(ASSIGNMENT_DASH_HOME)} />
    </>
  );
};

export default IntraySummary;
