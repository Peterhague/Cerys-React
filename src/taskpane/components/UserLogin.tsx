import * as React from "react";
import { useState } from "react";
import CerysButton from "./CerysButton";
import { fetchOptionsGetUser } from "../fetching/generateOptions";

interface userLoginProps {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const UserLogin: React.FC<userLoginProps> = ({ updateSession, handleView, session }: userLoginProps) => {
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
      console.log(userAndCustomerObject);
    session["user"] = userAndCustomerObject.user;
    session["customer"] = userAndCustomerObject.customer;
    updateSession(session);
    handleView("userDashHome");
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
      <CerysButton buttonText={"Return"} handleView={() => handleView("landingPage")} />
    </>
  );
};

export default UserLogin;
