import * as React from "react";
import { Fragment } from "react";
import { Session } from "../../../classes/session";
import { ASSIGNMENT_DASH_HOME, INTRAY_NESTED_SUMMARY, INTRAY_SUMMARY } from "../../../static-values/views";
import CerysButton from "../../CerysButton";
import { InTray, InTrayAndParentInTray, InTrayItem } from "../../../classes/in-trays/global";

interface InTrayNestedSummaryProps {
  handleView: (view: string) => void;
  session: Session;
  inTrayAndParentInTray: InTrayAndParentInTray;
}

const IntrayNestedSummary = ({ session, inTrayAndParentInTray, handleView }: InTrayNestedSummaryProps) => {
  const { inTray, parentInTray } = inTrayAndParentInTray;

  const handleGoBack = () => {
    const options = new InTrayAndParentInTray(inTray, parentInTray);
    session.handleDynamicView(INTRAY_NESTED_SUMMARY, options);
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
                      <button type="button" onClick={handleGoBack}>
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
      <CerysButton buttonText={"Go back"} handleClick={() => session.handleDynamicView(INTRAY_SUMMARY, parentInTray)} />
      <CerysButton buttonText={"Assignment Home"} handleClick={() => handleView(ASSIGNMENT_DASH_HOME)} />
    </>
  );
};

export default IntrayNestedSummary;
