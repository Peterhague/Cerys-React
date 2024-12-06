import * as React from "react";
import { useState } from "react";
import CerysButton from "./CerysButton";
import { fetchOptionsAddUser } from "../fetching/generateOptions";
import { userUrl } from "../fetching/apiEndpoints";

interface addUserProps {
  handleView: (view) => void;
  session: {};
}

const AddUser = ({ handleView, session }: addUserProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newUserDtls = { firstName, lastName, email, password, isAdmin };
    newUserDtls["customerId"] = session["customer"]["_id"];
    const updatedDbObjs = await processNewUser(newUserDtls);
    session["newUserAccount"] = updatedDbObjs.user;
    session["customer"] = updatedDbObjs.customer;
    handleView("newCustomerLanding");
  };

  const processNewUser = async (newUserDtls) => {
    const options = fetchOptionsAddUser(newUserDtls);
    const newObjsFromDb = await fetch(userUrl, options.post);
    const newObjs = await newObjsFromDb.json();
    return newObjs;
  };
  return (
    <>
      <form onSubmit={handleSubmit} id="addUserForm" action="">
        <h3>Add User</h3>
        <div>
          <input
            name="userFirstName"
            type="text"
            id="userFirstName"
            className="form-control"
            placeholder="Enter your first name..."
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          ></input>
        </div>
        <div>
          <input
            name="userLastName"
            type="text"
            id="userLastName"
            className="form-control"
            placeholder="Enter your last name..."
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          ></input>
        </div>
        <div>
          <input
            name="loginEmail"
            type="email"
            id="loginEmail"
            className="form-control"
            placeholder="Enter your email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          ></input>
        </div>
        <div>
          <input
            name="loginPassword"
            type="password"
            id="loginPassword"
            className="form-control"
            placeholder="Enter your password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          ></input>
        </div>
        <div>
          <label htmlFor="isAdmin"> Set user as admin?</label>
          <input
            type="checkbox"
            id="isAdmin"
            name="isAdmin"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
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

export default AddUser;
