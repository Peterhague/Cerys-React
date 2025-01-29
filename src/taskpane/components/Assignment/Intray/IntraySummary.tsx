import * as React from "react";
import { Session } from "../../../classes/session";
import { InTray } from "../../../classes/in-trays/nominal-ledger";

interface IntraySummaryProps {
  handleView: (view: string) => void;
  session: Session;
  intray: InTray;
}

const IntraySummary = ({ session, intray }: IntraySummaryProps) => {
  return (
    <table>
      <tbody>
        {intray.content.items.map((item) => (
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
  );
};

export default IntraySummary;
