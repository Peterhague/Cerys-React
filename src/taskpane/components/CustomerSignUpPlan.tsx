import * as React from "react";
import { useState } from "react";
import CerysButton from "./CerysButton";
import { fetchOptionsSignUp } from "../fetching/generateOptions";
import { customerUrl } from "../fetching/apiEndpoints";
import { Session } from "../classes/session";
import { LANDING_PAGE, NEW_CUSTOMER_LANDING } from "../static-values/views";
import { Customer } from "../classes/customer";

interface customerSignUpPlanProps {
  handleView: (view: string) => void;
  session: Session;
}

const CustomerSignUpPlan = ({ handleView, session }: customerSignUpPlanProps) => {
  const [licences, setLicences] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newCustObj = { ...session.newCustDtlsOne, ...session.newCustDtlsTwo, licences };
    const customer = await processNewCustomer(newCustObj);
    session.customer = new Customer(customer);
    delete session.newCustDtlsOne;
    delete session.newCustDtlsTwo;
    handleView(NEW_CUSTOMER_LANDING);
  };

  const processNewCustomer = async (newCustObj) => {
    const options = fetchOptionsSignUp(newCustObj);
    const customerDb = await fetch(customerUrl, options);
    const customer = await customerDb.json();
    return customer;
  };

  return (
    <>
      <form onSubmit={handleSubmit} id="yourPlan" action="">
        <h3>Select your plan</h3>
        <div>
          <input
            name="licences"
            type="number"
            id="licences"
            className="form-control"
            placeholder="Enter number of licences..."
            value={licences}
            onChange={(e) => setLicences(e.target.value)}
          ></input>
        </div>
        <div>
          <button type="submit">Next</button>
        </div>
      </form>
      <CerysButton buttonText={"Return"} handleClick={() => handleView(LANDING_PAGE)} />
    </>
  );
};

export default CustomerSignUpPlan;
