import * as React from "react";
import { useState } from "react";
import CerysButton from "./CerysButton";
import { Session } from "../classes/session";
import { CUSTOMER_SIGN_UP_DETAILS, LANDING_PAGE } from "../static-values/views";

interface customerSignUpProps {
  handleView: (view: string) => void;
  session: Session;
}

const CustomerSignUp = ({ handleView, session }: customerSignUpProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newCustDtlsOne = { email, password, confirmPassword };
    session.newCustDtlsOne = newCustDtlsOne;
    handleView(CUSTOMER_SIGN_UP_DETAILS);
  };

  return (
    <>
      <form onSubmit={handleSubmit} id="signUpInitial" action="">
        <h3>Sign Up</h3>
        <div>
          <input
            name="customerEmail"
            type="email"
            id="customerEmail"
            className="form-control"
            placeholder="Enter email address..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          ></input>
        </div>
        <div>
          <input
            name="customerPassword"
            type="password"
            id="customerPassword"
            className="form-control"
            placeholder="Enter password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          ></input>
        </div>
        <div>
          <input
            name="customerPasswordCheck"
            type="password"
            id="customerPasswordCheck"
            className="form-control"
            placeholder="Re-enter password..."
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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

export default CustomerSignUp;
