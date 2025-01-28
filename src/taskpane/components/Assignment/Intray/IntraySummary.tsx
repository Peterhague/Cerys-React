import * as React from "react";
import { Session } from "../../../classes/session";
import { Intray } from "../../../classes/in-trays/nominal-ledger";

interface IntraySummaryProps {
  handleView: (view: string) => void;
  session: Session;
  intray: Intray;
}

const IntraySummary = ({ intray }: IntraySummaryProps) => {
  return (
    <table>
      <tbody>
        {intray.content.items.map((item) => (
          <tr key={item.id}>
            <td>{item.title}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default IntraySummary;
