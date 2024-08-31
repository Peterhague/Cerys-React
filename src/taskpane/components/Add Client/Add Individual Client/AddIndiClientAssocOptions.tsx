import * as React from "react";
import CerysButton from "../../CerysButton";
import { fetchOptionsNewIndi } from "../../../fetching/generateOptions";
import { postNonCorpClientUrl } from "../../../fetching/apiEndpoints";

interface addIndiClientAssocOptionsProps {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const AddIndiClientAssocOptions: React.FC<addIndiClientAssocOptionsProps> = ({
  updateSession,
  handleView,
  session,
}: addIndiClientAssocOptionsProps) => {
  const processNewIndiClient = async () => {
    const newIndiClient = session["newIndiClientPrelim"];
    console.log(newIndiClient);
    delete session["newIndiClientPrelim"];
    updateSession(session);
    handleView("customerDashHome");
    const customerId = session["customer"]["_id"];
    const options = fetchOptionsNewIndi(newIndiClient, customerId);
    const newIndiDb = await fetch(postNonCorpClientUrl, options);
    const newIndiObj = await newIndiDb.json();
    console.log(newIndiObj);
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
