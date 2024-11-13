import * as React from "react";
import CerysButton from "../../CerysButton";
import { fetchOptionsNewIndi } from "../../../fetching/generateOptions";
import { postIndiUrl, postNonCorpClientUrl } from "../../../fetching/apiEndpoints";

interface addIndiClientAssocOptionsProps {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const AddIndiClientAssocOptions: React.FC<addIndiClientAssocOptionsProps> = ({
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
      <CerysButton buttonText={"AS DIRECTOR"} handleView={() => handleView("addIndiClientAssocDir")} />
      <CerysButton buttonText={"AS SHAREHOLDER"} handleView={() => handleView("addIndiClientAssocSH")} />
      <CerysButton buttonText={"Submit Now"} handleView={() => processNewIndiClient()} />
    </>
  );
};

export default AddIndiClientAssocOptions;
