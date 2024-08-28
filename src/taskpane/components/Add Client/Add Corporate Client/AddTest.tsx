import * as React from "react";
import { useState } from "react";
import CerysButton from "../../CerysButton";
interface addCorpClientIndiNewProps {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const AddCorpClientIndiNew: React.FC<addCorpClientIndiNewProps> = ({
  updateSession,
  handleView,
  session,
}: addCorpClientIndiNewProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [uTR, setUTR] = useState("");
  const [isDirector, setIsDirector] = useState(false);
  const [dateAppointed, setDateAppointed] = useState("");
  const [isCeased, setIsCeased] = useState(false);
  const [dateCeased, setDateCeased] = useState("");
  const [isShareholder, setIsShareholder] = useState(false);
  const [showShareClasses, setShowShareClasses] = useState(false);

  const shareClasses = session["newClientPrelim"]["shareClasses"];
  console.log(shareClasses);

  const handleShareholderChecked = () => {
    setIsShareholder(true);
    setShowShareClasses(true);
  };

  const handleShareAllocation = (value, shareClassId) => {
    console.log(value);
    //setActiveAllocation(value);
    shareClasses.forEach((sClass) => {
      if (sClass._id === shareClassId && sClass.issuedNotAllocated >= value) {
        sClass["prelimAllocation"] = parseInt(value);
        sClass.issuedNotAllocated -= parseInt(value);
      } else {
        console.log("There aren't enough shares available for this allocation");
      }
    });
    //setActiveAllocation("");
    console.log(shareClasses);
  };

  const finishSharesAllocation = () => {
    setShowShareClasses(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newClientDtls = { clientCode, clientName, reportingPeriod, companyNumber, senior, manager, rI };
    session["newCorpClientDtls"] = newClientDtls;
    session["newCorpClientShareClasses"] = [];
    updateSession(session);
    console.log(session);
    handleView("addCorpClientShares");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isDirector) {
      const newClientDirector = {
        firstName,
        lastName,
        email,
        phone,
        address,
        uTR,
        isDirector,
        dateAppointed,
        isCeased,
        dateCeased,
      };
    }
    isDirector && session["newCorpClientDirectors"].push(newClientDirector);
    updateSession(session);
    console.log(session);
    handleView("addCorpClientIndisHome");
  };

  return (
    <>
      <form onSubmit={handleSubmit} id="addClientForm" action="">
        <h3>Add Client</h3>
        <div>
          <input
            name="clientCode"
            type="text"
            id="clientCode"
            className="form-control"
            placeholder="Enter client code..."
            value={clientCode}
            onChange={(e) => setClientCode(e.target.value)}
          ></input>
        </div>
        <div>
          <input
            name="clientName"
            type="text"
            id="clientName"
            className="form-control"
            placeholder="Enter client name..."
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          ></input>
        </div>
        <div>
          <input
            name="yearEnd"
            type="date"
            id="yearEnd"
            className="form-control"
            placeholder=""
            value={reportingPeriod}
            onChange={(e) => setReportingPeriod(e.target.value)}
          ></input>
        </div>
        <div>
          <input
            name="companyNumber"
            type="text"
            id="companyNumber"
            className="form-control"
            placeholder="Enter company number..."
            value={companyNumber}
            onChange={(e) => setCompanyNumber(e.target.value)}
          ></input>
        </div>
        {session["customer"]["users"].length > 0 && (
          <div>
            <select
              name="senior"
              id="senior"
              className="form-control"
              value={senior}
              onChange={(e) => setSenior(e.target.value)}
            >
              {!senior && <option>Please select</option>}
              {session["customer"]["users"].map((user) => (
                <option key={user._id} value={user._id}>
                  {user.firstName + " " + user.lastName}
                </option>
              ))}
            </select>
          </div>
        )}
        {session["customer"]["users"].length > 0 && (
          <div>
            <select
              name="manager"
              id="manager"
              className="form-control"
              value={manager}
              onChange={(e) => setManager(e.target.value)}
            >
              {!manager && <option>Please select</option>}
              {session["customer"]["users"].map((user) => (
                <option key={user._id} value={user._id}>
                  {user.firstName + " " + user.lastName}
                </option>
              ))}
            </select>
          </div>
        )}
        {session["customer"]["users"].length > 0 && (
          <div>
            <select name="RI" id="RI" className="form-control" value={rI} onChange={(e) => setRI(e.target.value)}>
              {!rI && <option>Please select</option>}
              {session["customer"]["users"].map((user) => (
                <option key={user._id} value={user._id}>
                  {user.firstName + " " + user.lastName}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <button type="submit">Add share classes</button>
        </div>
      </form>
      <CerysButton buttonText={"Return"} handleView={() => handleView("landingPage")} />
    </>
  );
};

export default AddCorpClientIndiNew;

return (
  <>
    <form onSubmit={handleSubmit} id="addClientForm" action="">
      <h3>Add New Individual</h3>
      {!showShareClasses && (
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
            <label htmlFor="isDirector"> Designate as a director?</label>
            <input
              type="checkbox"
              id="isDirector"
              name="isDirector"
              checked={isDirector}
              onChange={(e) => setIsDirector(e.target.checked)}
            ></input>
          </div>
          {isDirector && (
            <>
              <div>
                <label htmlFor="dateAppointed">Date appointed</label>
                <input
                  type="date"
                  id="dateAppointed"
                  name="dateAppointed"
                  value={dateAppointed}
                  onChange={(e) => setDateAppointed(e.target.value)}
                ></input>
              </div>
              <div>
                <label htmlFor="isDirector">No longer in office?</label>
                <input
                  type="checkbox"
                  id="isCeased"
                  name="isCeased"
                  checked={isCeased}
                  onChange={(e) => setIsCeased(e.target.checked)}
                ></input>
              </div>
              {isCeased && (
                <div>
                  <label htmlFor="dateCeased">Date ceased</label>
                  <input
                    type="date"
                    id="dateCeased"
                    name="dateCeased"
                    value={dateCeased}
                    onChange={(e) => setDateCeased(e.target.value)}
                  ></input>
                </div>
              )}
            </>
          )}
          <div>
            <label htmlFor="isShareholder"> Designate as a shareholder?</label>
            <input
              type="checkbox"
              id="isShareholder"
              name="isShareholder"
              checked={isShareholder}
              onChange={handleShareholderChecked}
            ></input>
          </div>
          <div>
            <button type="submit">Submit details</button>
          </div>
        </>
      )}
      {showShareClasses &&
        shareClasses.map((sC) => (
          <>
            <table>
              <tbody>
                <tr>
                  <td>Shares issued</td>
                  <td>{sC.numberIssued}</td>
                </tr>
                <tr>
                  <td>Already allocated</td>
                  <td>{sC.numberIssued - sC.issuedNotAllocated}</td>
                </tr>
                <tr>
                  <td>Available to allocate</td>
                  <td>{sC.issuedNotAllocated}</td>
                </tr>
                <tr>
                  <td>
                    Allocate to {firstName} {lastName}
                  </td>
                  <td>
                    <input type="number" onChange={(e) => handleShareAllocation(e.target.value, sC._id)}></input>
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        ))}
      {showShareClasses && <button onClick={finishSharesAllocation}>Submit details</button>}
    </form>
    <CerysButton buttonText={"Return"} handleView={() => handleView("landingPage")} />
  </>
);
