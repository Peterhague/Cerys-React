import * as React from "react";
import { useState } from "react";
import CerysButton from "../../CerysButton";
import { Session } from "../../../classes/session";
interface addCorpClientIndiNewProps {
  handleView: (view) => void;
  session: Session;
}

const AddCorpClientIndiNew = ({ handleView, session }: addCorpClientIndiNewProps) => {
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
  const [shareAllocations, setShareAllocations] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [clientCode, setClientCode] = useState("");

  let newShareAllocations = [];

  const handleShareholderChecked = () => {
    setIsShareholder(true);
    setShowShareClasses(true);
  };

  const handleShareAllocation = (value, shareClassNumber) => {
    session.newClientPrelim.shareClasses.forEach((sClass) => {
      if (sClass.shareClassNumber === shareClassNumber && sClass.issuedNotAllocated >= value) {
        sClass.prelimAllocation = parseInt(value);
        const allocation = {
          key: shareClassNumber,
          clientName: session.newClientPrelim.clientName,
          clientCode: session.newClientPrelim.clientCode,
          clientId: session.newClientPrelim._id,
          shareClassName: sClass.shareClassName,
          shareClassNumber,
          interest: parseInt(value),
        };
        const updatedShareAllocations = [allocation];
        newShareAllocations.forEach((item) => {
          if (item.key !== shareClassNumber) {
            updatedShareAllocations.push(item);
          }
        });
        newShareAllocations = updatedShareAllocations;
        setShareAllocations(newShareAllocations);
      } else {
        console.log("There aren't enough shares available for this allocation");
      }
    });
  };

  const finishSharesAllocation = () => {
    setShowShareClasses(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newIndi = {
      firstName,
      lastName,
      email,
      phone,
      address,
      uTR,
      isDirector,
      isShareholder,
      dateAppointed,
      isCeased,
      dateCeased,
      isClient,
      clientCode,
      _clientDirectorships: [],
      _clientShareholdings: [],
      otherDirectorShips: [],
      otherShareholdings: [],
    };
    processNewIndi(newIndi);
    session.newClientPrelim.newIndividuals.push(newIndi);
    session.newClientPrelim.shareClasses.forEach((item) => {
      item.issuedNotAllocated -= item.prelimAllocation;
      item.prelimAllocation = 0;
    });
    handleView("addCorpClientIndisHome");
  };

  const processNewIndi = async (newIndi) => {
    newIndi.isDirector && addDirectorship(newIndi);
    newIndi.isShareholder && addShareholding(newIndi);
  };

  const addDirectorship = (newIndi) => {
    const directorship = {
      clientName: session.newClientPrelim.clientName,
      clientCode: session.newClientPrelim.clientCode,
      dateAppointed: newIndi.dateAppointed,
      dateCeased: newIndi.dateCeased,
    };
    newIndi._clientDirectorships.push(directorship);
    session.newClientPrelim.directors.push(newIndi);
  };

  const addShareholding = (newIndi) => {
    newIndi._clientShareholdings = shareAllocations;
    newIndi.shareholdings = newIndi._clientShareholdings;
    session.newClientPrelim.shareholders.push(newIndi);
  };

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
                  <label htmlFor="isCeased">No longer in office?</label>
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
              <label htmlFor="isClient"> Register as a client?</label>
              <input
                type="checkbox"
                id="isClient"
                name="isClient"
                checked={isClient}
                onChange={(e) => setIsClient(e.target.checked)}
              ></input>
              {isClient && (
                <div>
                  <input
                    type="text"
                    id="clientCode"
                    name="clientCode"
                    placeholder="Enter client code"
                    value={clientCode}
                    onChange={(e) => setClientCode(e.target.value)}
                  ></input>
                </div>
              )}
            </div>
            <div>
              <button type="submit">Submit details</button>
            </div>
          </>
        )}
        {showShareClasses &&
          session.newClientPrelim.shareClasses.map((sC) => (
            <>
              <table key={sC.shareClassNumber}>
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
                      <input
                        type="number"
                        onChange={(e) => handleShareAllocation(e.target.value, sC.shareClassNumber)}
                      ></input>
                    </td>
                  </tr>
                </tbody>
              </table>
            </>
          ))}
        {showShareClasses && <button onClick={finishSharesAllocation}>Submit details</button>}
      </form>
      <CerysButton buttonText={"Return"} handleClick={() => handleView("landingPage")} />
    </>
  );
};

export default AddCorpClientIndiNew;
