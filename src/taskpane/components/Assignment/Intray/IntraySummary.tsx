import * as React from "react";
import { Session } from "../../../classes/session";
import { ASSIGNMENT_DASH_HOME } from "../../../static-values/views";
import CerysButton from "../../CerysButton";
import { InTray } from "../../../classes/in-trays/global";

interface IntraySummaryProps {
  handleView: (view: string) => void;
  session: Session;
  intray: InTray;
}

const IntraySummary = ({ session, intray, handleView }: IntraySummaryProps) => {
  return (
    <>
      {" "}
      <table>
        <tbody>
          {intray.items.map((item) => (
            <tr key={item.id}>
              <td>
                {item.title}
                {item.getSubtitle() && item.getSubtitle()}
              </td>
              <td>
                <button type="button" onClick={() => item.showDetails(session, intray)}>
                  Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <CerysButton buttonText={"Assignment Home"} handleClick={() => handleView(ASSIGNMENT_DASH_HOME)} />
    </>
  );
};

export default IntraySummary;
