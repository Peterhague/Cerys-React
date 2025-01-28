import * as React from "react";
import { useState } from "react";
import CerysButton from "./CerysButton";
import { fetchOptionsGetUser } from "../fetching/generateOptions";
import { registerWorksheetsCollectionHandler } from "../utils/helper-functions";
import { Session } from "../classes/session";
import { LANDING_PAGE, USER_DASH_HOME } from "../static-values/views";
import { Customer } from "../classes/customer";
import { ViewOptions } from "../classes/view-options";
import { Intray } from "../classes/in-trays/nominal-ledger";

interface userLoginProps {
  handleView: (view: string) => void;
  handleDynamicView: (view: string, options: ViewOptions | Intray) => void;
  session: Session;
  setEditButton: (state: string) => void;
}

const UserLogin = ({ handleView, handleDynamicView, setEditButton, session }: userLoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userDetails = { email, password };
    const options = fetchOptionsGetUser(userDetails);
    const userAndCustomerFromDb = await fetch("http://localhost:4000/api/user/get-user", options);
    if (userAndCustomerFromDb) await processUser(userAndCustomerFromDb);
  };

  const processUser = async (userAndCustomerFromDb: Response) => {
    const { user, customer } = await userAndCustomerFromDb.json();
    session.user = user;
    session.customer = new Customer(customer);
    session.handleView = handleView;
    session.handleDynamicView = handleDynamicView;
    session.setEditButton = setEditButton;
    await registerWorksheetsCollectionHandler(session);
    handleView(USER_DASH_HOME);
  };
  return (
    <>
      <form onSubmit={handleSubmit} id="login" action="">
        <h3>Sign in as user</h3>
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

export default UserLogin;
