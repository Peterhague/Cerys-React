import * as React from "react";
import { useState } from "react";
import CerysButton from "./CerysButton";
import { fetchOptionsAddUser } from "../fetching/generateOptions";
import { userUrl } from "../fetching/apiEndpoints";
import { Session } from "../classes/session";
import { LANDING_PAGE, NEW_CUSTOMER_LANDING } from "../static-values/views";
import { Customer } from "../classes/customer";

interface addUserProps {
  handleView: (view: string) => void;
  session: Session;
}

const AddUser = ({ handleView, session }: addUserProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newUserDtls = { firstName, lastName, email, password, isAdmin, customerId: session.customer.customerId };
    const { user, customer } = await processNewUser(newUserDtls);
    session.newUserAccount = user;
    session.customer = new Customer(customer);
    handleView(NEW_CUSTOMER_LANDING);
  };

  const processNewUser = async (newUserDtls: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    isAdmin: boolean;
    customerId: string;
  }) => {
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
      <CerysButton buttonText={"Return"} handleClick={() => handleView(LANDING_PAGE)} />
    </>
  );
};

export default AddUser;
