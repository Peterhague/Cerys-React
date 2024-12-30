import * as React from "react";
import { useState } from "react";
import CerysButton from "./CerysButton";
import { Session } from "../classes/session";

interface customerSignUpDtlsProps {
  handleView: (view) => void;
  session: Session;
}

const CustomerSignUpDtls = ({ handleView, session }: customerSignUpDtlsProps) => {
  const [orgName, setOrgName] = useState("");
  const [orgAddress, setOrgAddress] = useState("");
  const [orgPhone, setOrgPhone] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newCustDtlsTwo = { orgName, orgAddress, orgPhone };
    session.newCustDtlsTwo = newCustDtlsTwo;
    handleView("customerSignUpPlan");
  };

  return (
    <>
      <form onSubmit={handleSubmit} id="signUpDetails" action="">
        <h3>Enter your details</h3>
        <div>
          <input
            name="organisationName"
            type="text"
            id="organisationName"
            className="form-control"
            placeholder="Enter organisation name..."
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
          ></input>
        </div>
        <div>
          <input
            name="organisationAddress"
            type="text"
            id="organisationName"
            className="form-control"
            placeholder="Enter contact address..."
            value={orgAddress}
            onChange={(e) => setOrgAddress(e.target.value)}
          ></input>
        </div>
        <div>
          <input
            name="organisationPhone"
            type="text"
            id="organisationName"
            className="form-control"
            placeholder="Enter contact phone number..."
            value={orgPhone}
            onChange={(e) => setOrgPhone(e.target.value)}
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

export default CustomerSignUpDtls;
