import * as React from "react";
import { useState } from "react";
import CerysButton from "./CerysButton";
import { getCustomerUrl } from "../fetching/apiEndpoints";
import { fetchOptionsGetCustomer } from "../fetching/generateOptions";

interface customerLoginProps {
  handleView: (view) => void;
  setEditButton: (state) => void;
  session: {};
}

const CustomerLogin = ({ handleView, session, setEditButton }: customerLoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const customerDtls = { email, password };
    const options = fetchOptionsGetCustomer(customerDtls);
    const customerDb = await fetch(getCustomerUrl, options);
    const customer = await customerDb.json();
    session["customer"] = customer;
    session["handleView"] = handleView;
    session["setEditButton"] = setEditButton;
    handleView("customerDashHome");
  };

  return (
    <>
      <form onSubmit={handleSubmit} id="customerLogin" action="">
        <h3>Sign in as account owner</h3>
        <div>
          <input
            name="email"
            type="email"
            id="login-email"
            className="form-control"
            placeholder="Enter your email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          ></input>
        </div>
        <div>
          <input
            name="password"
            type="password"
            id="login-password"
            className="form-control"
            placeholder="Enter your password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

export default CustomerLogin;
