import * as React from "react";
import { useState } from "react";
import CerysButton from "../../CerysButton";

interface addCorpClientIndisHomeProps {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const AddCorpClientIndisHome: React.FC<addCorpClientIndisHomeProps> = ({
  session,
  handleView,
}: addCorpClientIndisHomeProps) => {
  const [selectedIndi, setSelectedIndi] = useState("");
  const [isDirector, setIsDirector] = useState(false);
  const [dateAppointed, setDateAppointed] = useState("");
  const [isCeased, setIsCeased] = useState(false);
  const [dateCeased, setDateCeased] = useState("");
  const [isShareholder, setIsShareholder] = useState(false);
  const [showShareClasses, setShowShareClasses] = useState(false);
  const [shareAllocations, setShareAllocations] = useState([]);

  let newShareAllocations = [];

  const handleShareholderChecked = () => {
    setIsShareholder(true);
    setShowShareClasses(true);
  };

  const handleShareAllocation = (value, shareClassNumber) => {
    session["newClientPrelim"]["shareClasses"].forEach((sClass) => {
      if (sClass.shareClassNumber === shareClassNumber && sClass.issuedNotAllocated >= value) {
        sClass["prelimAllocation"] = parseInt(value);
        const allocation = {
          key: shareClassNumber,
          clientName: session["newClientPrelim"]["clientName"],
          clientCode: session["newClientPrelim"]["clientCode"],
          clientId: session["newClientPrelim"]["_id"],
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

  const indis = [...session["customer"]["nonCorpClients"], ...session["customer"]["individuals"]];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(selectedIndi);
    indis.forEach((indi) => {
      if (indi._id === selectedIndi) {
        indi.isDirector = isDirector;
        indi.dateAppointed = dateAppointed;
        indi.dateCeased = dateCeased;
        indi.isDirector && addDirectorship(indi);
        indi.isShareholder = isShareholder;
        indi.isShareholder && addShareholding(indi);
        console.log("HERE!!!!");
        console.log(indi);
        session["newClientPrelim"]["existingIndividuals"].push(indi);
      }
    });
    session["newClientPrelim"]["shareClasses"].forEach((item) => {
      item.issuedNotAllocated -= item.prelimAllocation;
      item.prelimAllocation = 0;
    });
    console.log(session);
  };

  const finishSharesAllocation = () => {
    setShowShareClasses(false);
  };

  const addDirectorship = (indi) => {
    const directorship = {
      clientName: session["newClientPrelim"]["clientName"],
      clientCode: session["newClientPrelim"]["clientCode"],
      //clientId: session["newClientPrelim"]["_id"],
      dateAppointed: indi.dateAppointed,
      dateCeased: indi.dateCeased,
    };
    indi.newClientDirectorships = [];
    indi.newClientDirectorships.push(directorship);
    session["newClientPrelim"]["directors"].push(indi);
  };

  const addShareholding = (indi) => {
    indi.newClientShareholdings = shareAllocations;
    indi.shareholdings = indi.newClientShareholdings;
    //indi._clientShareholdings = shareAllocations;
    session["newClientPrelim"]["shareholders"].push(indi);
    console.log(indi);
  };

  const selectableIndis = session["customer"]["nonCorpClients"].length > 0 || session["customer"]["individuals"];
  console.log(indis);

  return (
    <>
      {selectableIndis && (
        <>
          <form onSubmit={handleSubmit} id="selectIndiForm" action="">
            <select
              name="selectedIndi"
              id="selectedIndi"
              className="form-control"
              value={selectedIndi}
              onChange={(e) => setSelectedIndi(e.target.value)}
            >
              {selectableIndis &&
                indis.map((indi) => (
                  <>
                    <option key={indi._id} value={indi._id}>
                      {indi.firstName} {indi.lastName}
                    </option>
                  </>
                ))}
            </select>
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
            {showShareClasses &&
              session["newClientPrelim"]["shareClasses"].map((sC) => (
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
                        <td>Allocate to</td>
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
            <div>
              <button type="submit">GO</button>
            </div>
          </form>
        </>
      )}

      <CerysButton buttonText={"Select individual"} handleView={() => handleView("addCorpClientShares")} />
      <CerysButton buttonText={"Add new individual"} handleView={() => handleView("addCorpClientIndiNew")} />
      <CerysButton buttonText={"Finish"} handleView={() => handleView("addCorpClientOptions")} />
    </>
  );
};

export default AddCorpClientIndisHome;
