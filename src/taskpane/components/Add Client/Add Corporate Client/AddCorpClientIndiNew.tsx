import * as React from "react";
import { useState } from "react";
import CerysButton from "../../CerysButton";
import { fetchOptionsNewIndi, fetchOptionsUpdateClientPrelim } from "../../../fetching/generateOptions";
import { clientAddPersonsUrl, postIndiUrl, postNonCorpClientUrl } from "../../../fetching/apiEndpoints";
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
  const [shareAllocations, setShareAllocations] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [clientCode, setClientCode] = useState("");

  const shareClasses = session["newClientPrelim"]["shareClasses"];
  console.log(shareClasses);

  const handleShareholderChecked = () => {
    setIsShareholder(true);
    setShowShareClasses(true);
  };

  const handleShareAllocation = (value, shareClassId) => {
    shareClasses.forEach((sClass) => {
      if (sClass._id === shareClassId && sClass.issuedNotAllocated >= value) {
        sClass["prelimAllocation"] = parseInt(value);
        sClass.issuedNotAllocated -= parseInt(value);
        const allocation = {
          clientName: session["newClientPrelim"]["clientName"],
          clientCode: session["newClientPrelim"]["clientCode"],
          clientId: session["newClientPrelim"]["_id"],
          shareClassId: sClass._id,
          shareClassName: sClass.shareClassName,
          interest: parseInt(value),
        };
        setShareAllocations([...shareAllocations, allocation]);
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
    updateSession(session);
    const updatesFromDb = await processNewIndi(newIndi);
    const updatedClient = await updateClient(updatesFromDb.person);
    console.log(updatedClient);
    session["newClientPrelim"] = updatedClient;
    updateSession(session);
    console.log(session);
    handleView("addCorpClientIndisHome");
  };

  const processNewIndi = async (newIndi) => {
    const customerId = session["customer"]["_id"];
    newIndi.isDirector && addDirectorship(newIndi);
    newIndi.isShareholder && addShareholding(newIndi);
    console.log(newIndi);
    const options = fetchOptionsNewIndi(newIndi, customerId);
    const route = newIndi.isClient ? postNonCorpClientUrl : postIndiUrl;
    const newIndiDb = await fetch(route, options);
    const newIndiObj = await newIndiDb.json();
    return newIndiObj;
  };

  const addDirectorship = (newIndi) => {
    const directorship = {
      clientName: session["newClientPrelim"]["clientName"],
      clientCode: session["newClientPrelim"]["clientCode"],
      clientId: session["newClientPrelim"]["_id"],
      dateAppointed: newIndi.dateAppointed,
      dateCeased: newIndi.dateCeased,
    };
    newIndi._clientDirectorships.push(directorship);
  };

  const addShareholding = (newIndi) => {
    console.log(shareAllocations);
    newIndi._clientShareholdings = shareAllocations;
    console.log(newIndi);
  };

  const updateClient = async (newIndiDb) => {
    newIndiDb.clientId = session["newClientPrelim"]["_id"];
    newIndiDb._clientDirectorships.length > 0 && constructDirectorObjDb(newIndiDb);
    newIndiDb._clientShareholdings.length > 0 && constructShareholderObjDb(newIndiDb);
    console.log(newIndiDb);
    const options = fetchOptionsUpdateClientPrelim(newIndiDb, session["customer"]["_id"]);
    const updatedCustomerDb = await fetch(clientAddPersonsUrl, options);
    const updatedCustomerObj = await updatedCustomerDb.json();
    console.log(updatedCustomerObj);
    return updatedCustomerObj.client;
  };

  const constructDirectorObjDb = (newIndiDb) => {
    newIndiDb._clientDirectorships[0].firstName = newIndiDb.firstName;
    newIndiDb._clientDirectorships[0].lastName = newIndiDb.lastName;
    newIndiDb._clientDirectorships[0].email = newIndiDb.email;
    newIndiDb._clientDirectorships[0].personId = newIndiDb._id;
  };

  const constructShareholderObjDb = (newIndiDb) => {
    newIndiDb._clientShareholdings[0].firstName = newIndiDb.firstName;
    newIndiDb._clientShareholdings[0].lastName = newIndiDb.lastName;
    newIndiDb._clientShareholdings[0].email = newIndiDb.email;
    newIndiDb._clientShareholdings[0].personId = newIndiDb._id;
    newIndiDb._clientShareholdings[0].shareholdings = [
      {
        numberSubscribed: newIndiDb._clientShareholdings[0].interest,
        shareClassId: newIndiDb._clientShareholdings[0].shareClassId,
        shareClassName: newIndiDb._clientShareholdings[0].shareClassName,
      },
    ];
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
            </div>{" "}
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
          shareClasses.map((sC) => (
            <>
              <table key={sC._id}>
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
};

export default AddCorpClientIndiNew;
