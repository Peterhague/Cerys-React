import * as React from "react";
import { useState } from "react";
import CerysButton from "./CerysButton";
import { fetchOptionsGetUser } from "../fetching/generateOptions";
import { registerWorksheetsCollectionHandler } from "../utils/helperFunctions";
import { Session } from "../classes/session";
import { LANDING_PAGE, USER_DASH_HOME } from "../static-values/views";

interface userLoginProps {
  handleView: (view) => void;
  handleDynamicView: (view, props) => void;
  session: Session;
  setEditButton: (state) => void;
}

const UserLogin = ({ handleView, handleDynamicView, setEditButton, session }: userLoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userDetails = { email, password };
    const options = fetchOptionsGetUser(userDetails);
    const userAndCustomerFromDb = await fetch("http://localhost:4000/api/user/get-user", options);
    if (userAndCustomerFromDb) await processUser(userAndCustomerFromDb);
  };

  const processUser = async (userAndCustomerFromDb) => {
    const userAndCustomerObject = await userAndCustomerFromDb.json();
    session.user = userAndCustomerObject.user;
    session.customer = userAndCustomerObject.customer;
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
