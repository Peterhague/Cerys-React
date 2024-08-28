import * as React from "react";
import CerysButton from "./CerysButton";

interface customerLoginProps {
  handleView: (view) => void;
}

const CustomerLogin: React.FC<customerLoginProps> = (props: customerLoginProps) => {
  return (
    <>
      <form id="customerLogin" action="">
        <h3>Sign in as account owner</h3>
        <div>
          <input
            name="email"
            type="email"
            id="login-email"
            className="form-control"
            placeholder="Enter your email..."
          ></input>
        </div>
        <div>
          <input
            name="password"
            type="password"
            id="login-password"
            className="form-control"
            placeholder="Enter your password..."
          ></input>
        </div>
        <div>
          <button type="submit">Next</button>
        </div>
      </form>
      <CerysButton buttonText={"Return"} handleView={() => props.handleView("landingPage")} />
    </>
  );
};

export default CustomerLogin;
