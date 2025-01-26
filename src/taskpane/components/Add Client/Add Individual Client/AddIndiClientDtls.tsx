import * as React from "react";
import { useState } from "react";
import CerysButton from "../../CerysButton";
import { fetchOptionsNewIndi } from "../../../fetching/generateOptions";
import { postNonCorpClientUrl } from "../../../fetching/apiEndpoints";
import { Session } from "../../../classes/session";
import { LANDING_PAGE } from "../../../static-values/views";
import { Customer } from "../../../classes/customer";
import { BaseIndividual } from "../../../classes/individuals";

interface addIndiClientDtlsprops {
  handleView: (view: string) => void;
  session: Session;
}

const AddIndiClientDtls = ({ handleView, session }: addIndiClientDtlsprops) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [clientCode, setClientCode] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [uTR, setUTR] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newIndi = new BaseIndividual({
      firstName,
      lastName,
      clientCode,
      email,
      phone,
      address,
      uTR,
      isClient: true,
      _clientDirectorships: [],
      _clientShareholdings: [],
      otherDirectorships: [],
      otherShareholdings: [],
    });
    session.newIndiPrelim = newIndi;
    const route = session.customer.clients.length > 0 ? "addIndiClientAssocOptions" : "customerDashHome";
    session.customer.clients.length === 0 && processNewIndi(newIndi);
    handleView(route);
  };

  const processNewIndi = async (newIndi: BaseIndividual) => {
    const customerId = session.customer._id;
    const options = fetchOptionsNewIndi(newIndi, customerId);
    const newIndiAndCustomerDb = await fetch(postNonCorpClientUrl, options);
    const { customer } = await newIndiAndCustomerDb.json();
    session.customer = new Customer(customer);
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
              name="clientCode"
              type="text"
              id="clientCode"
              className="form-control"
              placeholder="Client code"
              value={clientCode}
              onChange={(e) => setClientCode(e.target.value)}
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
            <input
              name="uTR"
              type="text"
              id="uTR"
              className="form-control"
              placeholder="Unique Taxpayer Reference"
              value={uTR}
              onChange={(e) => setUTR(e.target.value)}
            ></input>
          </div>

          <div>
            <button type="submit">Submit details</button>
          </div>
        </>
      </form>
      <CerysButton buttonText={"Return"} handleClick={() => handleView(LANDING_PAGE)} />
    </>
  );
};

export default AddIndiClientDtls;
