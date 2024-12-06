import * as React from "react";
import { useState } from "react";
import CerysButton from "./CerysButton";
import { fetchOptionsSignUp } from "../fetching/generateOptions";
import { customerUrl } from "../fetching/apiEndpoints";

interface customerSignUpPlanProps {
  handleView: (view) => void;
  session: {};
}

const CustomerSignUpPlan = ({ handleView, session }: customerSignUpPlanProps) => {
  const [licences, setLicences] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newCustObj = { ...session["newCustDtlsOne"], ...session["newCustDtlsTwo"], licences };
    const newCustomer = await processNewCustomer(newCustObj);
    session["customer"] = newCustomer;
    delete session["newCustDtlsOne"];
    delete session["newCustDtlsTwo"];
    handleView("newCustomerLanding");
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
      <CerysButton buttonText={"Return"} handleClick={() => handleView("landingPage")} />
    </>
  );
};

export default CustomerSignUpPlan;
