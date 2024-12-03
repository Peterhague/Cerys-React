import * as React from "react";
import CerysButton from "../../CerysButton";
import { fetchOptionsAddClient } from "../../../fetching/generateOptions";
import { addClientGlobalUrl } from "../../../fetching/apiEndpoints";

interface addCorpClientOptionsProps {
  handleView: (view) => void;
  session: {};
}

const AddCorpClientOptions: React.FC<addCorpClientOptionsProps> = ({
  handleView,
  session,
}: addCorpClientOptionsProps) => {
  const handleSubmission = async () => {
    const client = session["newClientPrelim"];
    const customerId = session["customer"]["_id"];
    const options = fetchOptionsAddClient(client, customerId);
    const newCustAndClientDb = await fetch(addClientGlobalUrl, options);
    const newCustAndClient = await newCustAndClientDb.json();
    console.log(newCustAndClient);
    session["customer"] = newCustAndClient.customer;
    delete session["newClientPrelim"];
    handleView("customerDashHome");
  };

  return (
    <>
      <CerysButton buttonText={"ADD ANOTHER CLASS"} handleClick={() => handleView("addCorpClientShares")} />
      <CerysButton buttonText={"ENTER AMORTISATION POLICIES"} handleClick={() => handleView("addCorpClientAmort")} />
      <CerysButton buttonText={"ENTER DEPRECIATION POLICIES"} handleClick={() => handleView("addCorpClientDepn")} />
      <CerysButton buttonText={"ENTER IP DEPN POLICIES"} handleClick={() => handleView("addCorpClientDepnIP")} />
      <CerysButton buttonText={"ENTER VAT DETAILS"} handleClick={() => handleView("addClientHome")} />
      <CerysButton buttonText={"ADD INDIVIDUALS"} handleClick={() => handleView("addCorpClientIndisHome")} />
      <CerysButton buttonText={"Submit client now"} handleClick={() => handleSubmission()} />
    </>
  );
};

export default AddCorpClientOptions;
