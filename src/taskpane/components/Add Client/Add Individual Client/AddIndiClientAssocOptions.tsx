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
import { Customer } from "../../../classes/customer";

interface addIndiClientAssocOptionsProps {
  session: Session;
}

const AddIndiClientAssocOptions = ({ session }: addIndiClientAssocOptionsProps) => {
  const processNewIndiClient = async () => {
    const newIndi = session.newIndiPrelim;
    delete session.newIndiPrelim;
    const customerId = session.customer.customerId;
    const options = fetchOptionsNewIndi(newIndi, customerId);
    const url = newIndi.isClient ? postNonCorpClientUrl : postIndiUrl;
    const newIndiAndCustomerDb = await fetch(url, options);
    const { customer } = await newIndiAndCustomerDb.json();
    session.customer = new Customer(customer);
    session.handleView(CUSTOMER_DASH_HOME);
  };
  return (
    <>
      <p>Associate with existing corporate client?</p>
      <CerysButton buttonText={"AS DIRECTOR"} handleClick={() => session.handleView(ADD_INDI_CLIENT_ASSOC_DIR)} />
      <CerysButton
        buttonText={"AS SHAREHOLDER"}
        handleClick={() => session.handleView(ADD_INDI_CLIENT_ASSOC_SHAREHOLDER)}
      />
      <CerysButton buttonText={"Submit Now"} handleClick={() => processNewIndiClient()} />
    </>
  );
};

export default AddIndiClientAssocOptions;
