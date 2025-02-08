import * as React from "react";
import { Fragment } from "react";
import { Session } from "../../../classes/session";
import { ASSIGNMENT_DASH_HOME, INTRAY_NESTED_SUMMARY, INTRAY_SUMMARY } from "../../../static-values/views";
import CerysButton from "../../CerysButton";
import { InTray, InTrayAndParentInTray, InTrayItem } from "../../../classes/in-trays/global";

interface IntraySummaryProps {
  handleView: (view: string) => void;
  session: Session;
  intray: InTray;
}

const IntraySummary = ({ session, intray, handleView }: IntraySummaryProps) => {
  const handleNestedInTray = (childInTray: InTray) => {
    const options = new InTrayAndParentInTray(childInTray, intray);
    session.handleDynamicView(INTRAY_NESTED_SUMMARY, options);
  };
  console.log(intray.collections[0]);
  console.log(intray.collections[0].getItems(session));
  intray.collections.length > 1 && console.log(intray.collections[1]);
  intray.collections.length > 1 && console.log(intray.collections[1].getItems(session));

  return (
    <>
      {" "}
      {intray.collections.map((coll) => (
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
                      <button type="button" onClick={() => item.handleClick(session, intray)}>
                        Details
                      </button>
                    )}
                    {item instanceof InTray && (
                      <button type="button" onClick={() => handleNestedInTray(item)}>
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
      {intray.parentInTray && (
        <CerysButton
          buttonText={"Go back"}
          handleClick={() => session.handleDynamicView(INTRAY_SUMMARY, intray.parentInTray)}
        />
      )}
      <CerysButton buttonText={"Assignment Home"} handleClick={() => handleView(ASSIGNMENT_DASH_HOME)} />
    </>
  );
};

export default IntraySummary;
