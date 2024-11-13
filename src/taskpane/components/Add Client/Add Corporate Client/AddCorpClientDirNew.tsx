import * as React from "react";
import { useState } from "react";
import CerysButton from "../../CerysButton";
interface addCorpClientDirNewProps {
  handleView: (view) => void;
  session: {};
}

const AddCorpClientDirNew: React.FC<addCorpClientDirNewProps> = ({ handleView, session }: addCorpClientDirNewProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [uTR, setUTR] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newClientDirector = { firstName, lastName, email, phone, address, uTR };
    session["newCorpClientDirectors"].push(newClientDirector);
    handleView("addCorpClientDirsHome");
  };

  return (
    <>
      <form onSubmit={handleSubmit} id="addClientForm" action="">
        <h3>Add New Director</h3>
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
      </form>
      <CerysButton buttonText={"Return"} handleView={() => handleView("landingPage")} />
    </>
  );
};

export default AddCorpClientDirNew;
