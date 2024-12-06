import * as React from "react";
import CerysButton from "../../CerysButton";
import { fetchOptionsNewIndi } from "../../../fetching/generateOptions";
import { postIndiUrl, postNonCorpClientUrl } from "../../../fetching/apiEndpoints";

interface addIndiClientAssocOptionsProps {
  handleView: (view) => void;
  session: {};
}

const AddIndiClientAssocOptions = ({
  handleView,
  session,
}: addIndiClientAssocOptionsProps) => {
  const processNewIndiClient = async () => {
    const newIndi = session["newIndiPrelim"];
    delete session["newIndiPrelim"];
    const customerId = session["customer"]["_id"];
    const options = fetchOptionsNewIndi(newIndi, customerId);
    const url = newIndi.isClient ? postNonCorpClientUrl : postIndiUrl;
    const newIndiAndCustomerDb = await fetch(url, options);
    const newIndiAndCustomerObj = await newIndiAndCustomerDb.json();
    session["customer"] = newIndiAndCustomerObj.customer;
    handleView("customerDashHome");
  };
  return (
    <>
      <p>Associate with existing corporate client?</p>
      <CerysButton buttonText={"AS DIRECTOR"} handleClick={() => handleView("addIndiClientAssocDir")} />
      <CerysButton buttonText={"AS SHAREHOLDER"} handleClick={() => handleView("addIndiClientAssocSH")} />
      <CerysButton buttonText={"Submit Now"} handleClick={() => processNewIndiClient()} />
    </>
  );
};

export default AddIndiClientAssocOptions;
