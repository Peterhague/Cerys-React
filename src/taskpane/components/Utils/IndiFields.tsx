import { NewIndiAssociation } from "../../classes/individuals";
import React from "react";

interface IndiFieldsProps {
  activeIndi: NewIndiAssociation;
  setActiveIndi: (indi: NewIndiAssociation) => void;
}

const IndiFields = ({ activeIndi, setActiveIndi }: IndiFieldsProps) => {
  const updateState = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const newState = { ...activeIndi, [key]: e.target.value };
    setActiveIndi(newState);
  };

  return (
    <>
      <tr>
        <td>
          <label htmlFor="firstName">First Name</label>
        </td>
        <td>
          <input
            name="firstName"
            type="text"
            id="firstName"
            className="form-control"
            value={activeIndi.firstName}
            onChange={(e) => updateState(e, "firstName")}
          ></input>
        </td>
      </tr>
      <tr>
        <td>
          <label htmlFor="lastName">Last Name</label>
        </td>
        <td>
          <input
            name="lastName"
            type="text"
            id="lastName"
            className="form-control"
            value={activeIndi.lastName}
            onChange={(e) => updateState(e, "lastName")}
          ></input>
        </td>
      </tr>
      <tr>
        <td>
          <label htmlFor="email">Email address</label>
        </td>
        <td>
          <input
            name="email"
            type="text"
            id="email"
            className="form-control"
            value={activeIndi.email}
            onChange={(e) => updateState(e, "email")}
          ></input>
        </td>
      </tr>
      <tr>
        <td>
          <label htmlFor="phone">Phone number</label>
        </td>
        <td>
          <input
            name="phone"
            type="text"
            id="phone"
            className="form-control"
            value={activeIndi.phone}
            onChange={(e) => updateState(e, "phone")}
          ></input>
        </td>
      </tr>
      <tr>
        <td>
          <label htmlFor="address">Address</label>
        </td>
        <td>
          <input
            name="address"
            type="text"
            id="address"
            className="form-control"
            value={activeIndi.address}
            onChange={(e) => updateState(e, "address")}
          ></input>
        </td>
      </tr>
      <tr>
        <td>
          <label htmlFor="uTR">Unique Taxpayer Reference</label>
        </td>
        <td>
          <input
            name="uTR"
            type="text"
            id="uTR"
            className="form-control"
            value={activeIndi.uTR}
            onChange={(e) => updateState(e, "uTR")}
          ></input>
        </td>
      </tr>
    </>
  );
};

export default IndiFields;
