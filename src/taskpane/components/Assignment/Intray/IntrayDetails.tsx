import * as React from "react";
//import { useState } from "react";
import CerysButton from "../../CerysButton";
import { Session } from "../../../classes/session";
import { InTrayItem } from "../../../classes/in-trays/global";

interface IntrayDetailsProps {
  handleView: (view: string) => void;
  session: Session;
  intrayItem: InTrayItem;
}

const IntrayDetails = ({ session, intrayItem }: IntrayDetailsProps) => {
  return (
    <>
      <p>{intrayItem.getSummaryText()}</p>
      <CerysButton buttonText={"Yes"} handleClick={async () => await intrayItem.affirmativeAction(session)} />
      <CerysButton buttonText={"Add to intray"} handleClick={() => intrayItem.affirmativeAction(session)} />
      <CerysButton buttonText={"Ignore"} handleClick={() => intrayItem.affirmativeAction(session)} />
    </>
  );
};

export default IntrayDetails;
