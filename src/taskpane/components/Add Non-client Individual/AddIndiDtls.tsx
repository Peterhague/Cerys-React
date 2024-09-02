import * as React from "react";
import { useState } from "react";
import CerysButton from "../CerysButton";
import { fetchOptionsNewIndi } from "../../fetching/generateOptions";
import { postIndiUrl } from "../../fetching/apiEndpoints";
interface addIndiDtlsprops {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const AddIndiDtls: React.FC<addIndiDtlsprops> = ({ updateSession, handleView, session }: addIndiDtlsprops) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newIndi = {
      firstName,
      lastName,
      email,
      phone,
      address,
      isClient: false,
      _clientDirectorships: [],
      _clientShareholdings: [],
      otherDirectorships: [],
      otherShareholdings: [],
    };
    session["newIndiPrelim"] = newIndi;
    updateSession(session);
    console.log(newIndi);
    const route = session["customer"]["clients"].length > 0 ? "addIndiClientAssocOptions" : "customerDashHome";
    session["customer"]["clients"].length === 0 && processNewIndi(newIndi);
    handleView(route);
  };

  const processNewIndi = async (newIndi) => {
    const customerId = session["customer"]["_id"];
    const options = fetchOptionsNewIndi(newIndi, customerId);
    const newIndiAndUpdatedCustomerDb = await fetch(postIndiUrl, options);
    const newIndiAndUpdatedCustomerObj = await newIndiAndUpdatedCustomerDb.json();
    console.log(newIndiAndUpdatedCustomerObj);
    session["customer"] = newIndiAndUpdatedCustomerObj.customer;
    updateSession(session);
  };

  return (
    <>
      <form onSubmit={handleSubmit} id="addClientForm" action="">
        <h3>Add New Individual</h3>
        <>
          <div>
            <input
              name="firstName"
              type="text"
              id="firstName"
              className="form-control"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            ></input>
          </div>
          <div>
            <input
              name="lastName"
              type="text"
              id="lastName"
              className="form-control"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            ></input>
          </div>
          <div>
            <input
              name="email"
              type="text"
              id="email"
              className="form-control"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            ></input>
          </div>
          <div>
            <input
              name="phone"
              type="text"
              id="phone"
              className="form-control"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            ></input>
          </div>
          <div>
            <input
              name="address"
              type="text"
              id="address"
              className="form-control"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            ></input>
          </div>

          <div>
            <button type="submit">Submit details</button>
          </div>
        </>
      </form>
      <CerysButton buttonText={"Return"} handleView={() => handleView("landingPage")} />
    </>
  );
};

export default AddIndiDtls;
