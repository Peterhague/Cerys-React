import * as React from "react";
import CerysButton from "../../CerysButton";
import { Session } from "../../../classes/session";
import { InTray, InTrayItem } from "../../../classes/in-trays/global";
import { ASSIGNMENT_DASH_HOME, INTRAY_SUMMARY } from "../../../static-values/views";
import { handleInTrayRouting } from "../../../utils/in-trays/in-tray-routing";

interface IntrayDetailsProps {
  session: Session;
  options: { inTrayItem: InTrayItem; inTray: InTray };
}

const IntrayDetails = ({ session, options }: IntrayDetailsProps) => {
  const { inTrayItem, inTray } = options;
  const path = inTrayItem.reconstructPath(inTray);

  const handleIgnore = () => {
    session.handleDynamicView(INTRAY_SUMMARY, inTray);
  };

  const handleAffirmative = async () => {
    await inTrayItem.affirmativeAction(session);
    handleInTrayRouting(session, inTray);
  };

  const handleReturn = () => {
    handleInTrayRouting(session, inTray);
  };

  return (
    <>
      <p>{options.inTrayItem.getSummaryText()}</p>
      <CerysButton buttonText={"Yes"} handleClick={handleAffirmative} />
      <CerysButton buttonText={"Ignore"} handleClick={handleIgnore} />
      <CerysButton buttonText={"Return to In-tray"} handleClick={handleReturn} />
      <CerysButton buttonText={"Assignment Home"} handleClick={() => session.handleView(ASSIGNMENT_DASH_HOME)} />
      <div>
        {path.length > 0 &&
          path.map((item) => (
            <button type="button" key={item.id} onClick={() => handleInTrayRouting(session, item)}>
              {item.title}
            </button>
          ))}
      </div>
    </>
  );
};

export default IntrayDetails;
