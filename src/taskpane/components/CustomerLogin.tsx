import * as React from "react";
import { useState } from "react";
import CerysButton from "./CerysButton";
import { getCustomerUrl } from "../fetching/apiEndpoints";
import { fetchOptionsGetCustomer } from "../fetching/generateOptions";
import { Session } from "../classes/session";
import { CUSTOMER_DASH_HOME, LANDING_PAGE } from "../static-values/views";
import { Customer } from "../classes/customer";
import { ViewOptionsProps } from "../interfaces/interfaces";
import { Intray } from "../classes/in-trays/nominal-ledger";
import { InTrayItem } from "../classes/in-trays/global";

interface customerLoginProps {
  handleView: (view: string) => void;
  handleDynamicView: (view: string, options: ViewOptionsProps | Intray | InTrayItem) => void;
  setEditButton: (state: string) => void;
  session: Session;
}

const CustomerLogin = ({ handleView, handleDynamicView, session, setEditButton }: customerLoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const customerDtls = { email, password };
    const options = fetchOptionsGetCustomer(customerDtls);
    const customerDb = await fetch(getCustomerUrl, options);
    const customer = await customerDb.json();
    session.customer = new Customer(customer);
    session.handleView = handleView;
    session.handleDynamicView = handleDynamicView;
    session.setEditButton = setEditButton;
    handleView(CUSTOMER_DASH_HOME);
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
      <CerysButton buttonText={"Return"} handleClick={() => handleView(LANDING_PAGE)} />
    </>
  );
};

export default CustomerLogin;
