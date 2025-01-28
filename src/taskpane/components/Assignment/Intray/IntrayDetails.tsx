import * as React from "react";
import { useState } from "react";
import CerysButton from "../../CerysButton";
import { Session } from "../../../classes/session";
import { Intray } from "../../../classes/in-trays/nominal-ledger";

interface IntrayDetailsProps {
  handleView: (view: string) => void;
  session: Session;
  intray: Intray;
}

const IntrayDetails = ({ session, intray }: IntrayDetailsProps) => {
  console.log(session);
  console.log(intray);
  return <></>;
};

export default IntrayDetails;
