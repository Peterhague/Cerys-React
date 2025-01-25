import * as React from "react";
import CerysButton from "../../CerysButton";
import { fetchOptionsAddClient } from "../../../fetching/generateOptions";
import { addClientGlobalUrl } from "../../../fetching/apiEndpoints";
import { Session } from "../../../classes/session";
import {
  ADD_CLIENT_HOME,
  ADD_CORP_CLIENT_AMORTISATION,
  ADD_CORP_CLIENT_DEPRECIATION,
  ADD_CORP_CLIENT_DEPRECIATION_INV_PROP,
  ADD_CORP_CLIENT_INDIS,
  ADD_CORP_CLIENT_SHARES,
  CUSTOMER_DASH_HOME,
} from "../../../static-values/views";

interface addCorpClientOptionsProps {
  handleView: (view) => void;
  session: Session;
}

const AddCorpClientOptions = ({ handleView, session }: addCorpClientOptionsProps) => {
  const handleSubmission = async () => {
    const client = session.newClientPrelim;
    const customerId = session.customer._id;
    const options = fetchOptionsAddClient(client, customerId);
    const newCustAndClientDb = await fetch(addClientGlobalUrl, options);
    const newCustAndClient = await newCustAndClientDb.json();
    session.customer = newCustAndClient.customer;
    delete session.newClientPrelim;
    handleView(CUSTOMER_DASH_HOME);
  };

  return (
    <>
      <CerysButton buttonText={"ADD ANOTHER CLASS"} handleClick={() => handleView(ADD_CORP_CLIENT_SHARES)} />
      <CerysButton
        buttonText={"ENTER AMORTISATION POLICIES"}
        handleClick={() => handleView(ADD_CORP_CLIENT_AMORTISATION)}
      />
      <CerysButton
        buttonText={"ENTER DEPRECIATION POLICIES"}
        handleClick={() => handleView(ADD_CORP_CLIENT_DEPRECIATION)}
      />
      <CerysButton
        buttonText={"ENTER IP DEPN POLICIES"}
        handleClick={() => handleView(ADD_CORP_CLIENT_DEPRECIATION_INV_PROP)}
      />
      <CerysButton buttonText={"ENTER VAT DETAILS"} handleClick={() => handleView(ADD_CLIENT_HOME)} />
      <CerysButton buttonText={"ADD INDIVIDUALS"} handleClick={() => handleView(ADD_CORP_CLIENT_INDIS)} />
      <CerysButton buttonText={"Submit client now"} handleClick={() => handleSubmission()} />
    </>
  );
};

export default AddCorpClientOptions;
