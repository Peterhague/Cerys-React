import * as React from "react";
//import { useState } from "react";
import CerysButton from "../../CerysButton";
import { Session } from "../../../classes/session";
import { ViewOptions } from "../../../interfaces/interfaces";
import { updateCerysCodeMappingIgnoreCustom } from "../../../assignment/assignment-management/opening-balance-adjustments";

interface ReviewCustomMappedTransProps {
  handleView: (view) => void;
  session: Session;
  options: ViewOptions;
}

const ReviewCustomMappedTrans = ({ session, options }: ReviewCustomMappedTransProps) => {
  const handleIgnoreAll = () => {
    const cerysCode = options.cerysCode;
    const wsName = options.wsName;
    const nominalCode =
      typeof options.nominalCode === "string" || typeof options.nominalCode === "number" ? options.nominalCode : "";
    const nominalCodeName = typeof options.nominalCodeName === "string" ? options.nominalCodeName : "";
    updateCerysCodeMappingIgnoreCustom(session, nominalCode, nominalCodeName, cerysCode, wsName);
  };

  return (
    <>
      <CerysButton buttonText={"APPLY TO ALL"} handleClick={() => handleIgnoreAll()} />
      <CerysButton buttonText={"IGNORE THESE TRANSACTIONS"} handleClick={() => handleIgnoreAll()} />
    </>
  );
};

export default ReviewCustomMappedTrans;
