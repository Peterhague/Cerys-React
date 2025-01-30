import * as React from "react";
import { Session } from "../../../classes/session";
import { ASSIGNMENT_DASH_HOME, INTRAY_SUMMARY } from "../../../static-values/views";
import CerysButton from "../../CerysButton";
import { InTray, InTrayItem } from "../../../classes/in-trays/global";

interface IntraySummaryProps {
  handleView: (view: string) => void;
  session: Session;
  intray: InTray;
}

const IntraySummary = ({ session, intray, handleView }: IntraySummaryProps) => {
  console.log(intray);
  return (
    <>
      {" "}
      <table>
        <tbody>
          {intray.items.map((item) => (
            <tr key={item.id}>
              <td>
                {item.title}
                {item instanceof InTrayItem && item.getSubtitle() && item.getSubtitle()}
              </td>
              <td>
                {item instanceof InTrayItem && (
                  <button type="button" onClick={() => item.handleClick(session, intray)}>
                    Details
                  </button>
                )}
                {item instanceof InTray && (
                  <button type="button" onClick={() => session.handleDynamicView(INTRAY_SUMMARY, item)}>
                    See more
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <CerysButton buttonText={"Go back"} handleClick={() => handleView(ASSIGNMENT_DASH_HOME)} />
      <CerysButton buttonText={"Assignment Home"} handleClick={() => handleView(ASSIGNMENT_DASH_HOME)} />
    </>
  );
};

export default IntraySummary;
