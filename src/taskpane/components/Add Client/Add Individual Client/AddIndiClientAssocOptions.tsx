import * as React from "react";
import CerysButton from "../../CerysButton";
import { fetchOptionsNewIndi } from "../../../fetching/generateOptions";
import { postIndiUrl, postNonCorpClientUrl } from "../../../fetching/apiEndpoints";
import { Session } from "../../../classes/session";
import {
  ADD_INDI_CLIENT_ASSOC_DIR,
  ADD_INDI_CLIENT_ASSOC_SHAREHOLDER,
  CUSTOMER_DASH_HOME,
} from "../../../static-values/views";

interface addIndiClientAssocOptionsProps {
  handleView: (view) => void;
  session: Session;
}

const AddIndiClientAssocOptions = ({ handleView, session }: addIndiClientAssocOptionsProps) => {
  const processNewIndiClient = async () => {
    const newIndi = session.newIndiPrelim;
    delete session.newIndiPrelim;
    const customerId = session.customer._id;
    const options = fetchOptionsNewIndi(newIndi, customerId);
    const url = newIndi.isClient ? postNonCorpClientUrl : postIndiUrl;
    const newIndiAndCustomerDb = await fetch(url, options);
    const newIndiAndCustomerObj = await newIndiAndCustomerDb.json();
    session.customer = newIndiAndCustomerObj.customer;
    handleView(CUSTOMER_DASH_HOME);
  };
  return (
    <>
      <p>Associate with existing corporate client?</p>
      <CerysButton buttonText={"AS DIRECTOR"} handleClick={() => handleView(ADD_INDI_CLIENT_ASSOC_DIR)} />
      <CerysButton buttonText={"AS SHAREHOLDER"} handleClick={() => handleView(ADD_INDI_CLIENT_ASSOC_SHAREHOLDER)} />
      <CerysButton buttonText={"Submit Now"} handleClick={() => processNewIndiClient()} />
    </>
  );
};

export default AddIndiClientAssocOptions;
