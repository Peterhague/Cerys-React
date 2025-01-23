import * as React from "react";
import { useRef, useState } from "react";
import CerysButton from "../../CerysButton";
import { Session } from "../../../classes/session";
import { ADD_CORP_CLIENT_INDI_NEW, ADD_CORP_CLIENT_OPTIONS } from "../../../static-values/views";
import IndividualInput from "../../Utils/IndividualInput";
import { NewIndividual } from "../../../classes/new-individual";
import { ExtendedIndividual } from "../../../interfaces/interfaces";
import { IndividualShareAllocation, NewShareholding } from "../../../classes/share-classes";

interface addCorpClientIndisHomeProps {
  handleView: (view) => void;
  session: Session;
}

const AddCorpClientIndisHome = ({ session, handleView }: addCorpClientIndisHomeProps) => {
  const [mode, setMode] = useState("search");
  const [activeIndi, setActiveIndi] = useState<NewIndividual>(null);
  const [isDirector, setIsDirector] = useState(false);
  const [dateAppointed, setDateAppointed] = useState("");
  const [isCeased, setIsCeased] = useState(false);
  const [dateCeased, setDateCeased] = useState("");
  const [isShareholder, setIsShareholder] = useState(false);
  const [availableIndis] = useState([...session.customer.nonCorpClients, ...session.customer.individuals]);
  const [newClientIndis, setNewClientIndis] = useState(session.newClientPrelim.existingIndividuals);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDisplay, setSearchDisplay] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const setActiveIndividual = (indi: ExtendedIndividual) => {
    if (indi) {
      const newIndi = new NewIndividual(indi);
      const potentialShareAllocations = session.newClientPrelim.shareClasses.map(
        (i) => new IndividualShareAllocation(i)
      );
      newIndi.potentialShareAllocations = potentialShareAllocations;
      console.log(newIndi);
      setActiveIndi(newIndi);
    } else setActiveIndi(null);
  };

  const handleShareAllocation = (value: string, shareClassNumber: number) => {
    const val = value ? parseInt(value) : 0;
    let addBack = 0;
    const potentialAllocation = activeIndi.potentialShareAllocations.find(
      (sClass) => sClass.shareClassNumber === shareClassNumber
    );
    addBack = potentialAllocation.indiAllocationSubmitted;
    potentialAllocation.indiAllocationLive = val;
    setActiveIndi({
      ...activeIndi,
      potentialShareAllocations: [
        ...activeIndi.potentialShareAllocations.filter((i) => i.shareClassNumber !== shareClassNumber),
        potentialAllocation,
      ],
    });
    session.newClientPrelim.shareClasses.forEach((sClass) => {
      if (sClass.shareClassNumber === shareClassNumber && sClass.issuedNotAllocated >= val) {
        sClass.prelimAllocation = val - addBack;
      } else {
        console.log("There aren't enough shares available for this allocation");
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const existingIndis = session.newClientPrelim.existingIndividuals;
    const order = {};
    existingIndis.forEach((indi, index) => (order[indi._id] = index));
    session.newClientPrelim.existingIndividuals = existingIndis.filter((i) => i._id !== activeIndi._id);
    if (isDirector || isShareholder) {
      processIndividual();
    }
    session.newClientPrelim.shareClasses.forEach((item) => {
      item.issuedNotAllocated -= item.prelimAllocation;
      item.prelimAllocation = 0;
    });
    activeIndi.potentialShareAllocations.forEach((i) => (i.indiAllocationSuspended = 0));
    session.newClientPrelim.existingIndividuals.sort((a, b) => {
      return order[a._id] - order[b._id];
    });
    setNewClientIndis(session.newClientPrelim.existingIndividuals);
    nullifyForm();
  };

  const processIndividual = () => {
    activeIndi.isDirector = isDirector;
    activeIndi.dateAppointed = dateAppointed;
    activeIndi.dateCeased = dateCeased;
    if (isDirector) {
      addDirectorship(activeIndi);
    } else {
      removeDirectorship(activeIndi);
    }
    activeIndi.newClientShareholdings = [];
    activeIndi.potentialShareAllocations.forEach((allocation) => {
      if (allocation.indiAllocationLive !== 0) {
        activeIndi.newClientShareholdings.push(
          new NewShareholding({
            clientName: session.newClientPrelim.clientName,
            clientCode: session.newClientPrelim.clientCode,
            shareClassName: allocation.shareClassName,
            shareClassNumber: allocation.shareClassNumber,
            interest: allocation.indiAllocationLive,
          })
        );
      }
    });
    activeIndi.shareholdings = activeIndi.newClientShareholdings;
    activeIndi.isShareholder = isShareholder;
    if (isShareholder) {
      addShareholding(activeIndi);
    } else {
      removeShareholding(activeIndi);
    }
    activeIndi.potentialShareAllocations.forEach((allocation) => {
      allocation.indiAllocationSubmitted = allocation.indiAllocationLive;
    });
    session.newClientPrelim.existingIndividuals.push(activeIndi);
  };

  const addDirectorship = (indi: NewIndividual) => {
    const directorship = {
      clientName: session.newClientPrelim.clientName,
      clientCode: session.newClientPrelim.clientCode,
      dateAppointed: indi.dateAppointed,
      dateCeased: indi.dateCeased,
    };
    indi.newClientDirectorships.push(directorship);
    session.newClientPrelim.directors = session.newClientPrelim.directors.filter((dir) => dir._id !== indi._id);
    session.newClientPrelim.directors.push(indi);
  };

  const removeDirectorship = (indi: NewIndividual) => {
    indi.newClientDirectorships = [];
    session.newClientPrelim.directors = session.newClientPrelim.directors.filter((dir) => dir._id !== indi._id);
  };

  const addShareholding = (indi: NewIndividual) => {
    session.newClientPrelim.shareholders = session.newClientPrelim.shareholders.filter((sh) => sh._id !== indi._id);
    session.newClientPrelim.shareholders.push(indi);
  };

  const removeShareholding = (indi: NewIndividual) => {
    session.newClientPrelim.shareholders = session.newClientPrelim.shareholders.filter((sh) => sh._id !== indi._id);
  };

  const manageShareAllocation = () => {
    console.log(activeIndi);
    activeIndi.potentialShareAllocations.forEach((allocation) => {
      const shareClass = session.newClientPrelim.shareClasses.find(
        (i) => i.shareClassNumber === allocation.shareClassNumber
      );
      if (isShareholder) {
        if (mode === "update") {
          shareClass.issuedNotAllocated += allocation.indiAllocationSubmitted;
          allocation.indiAllocationSuspended = allocation.indiAllocationSubmitted;
        }
        allocation.indiAllocationLive = 0;
        allocation.indiAllocationSubmitted = 0;
      } else if (!isShareholder) {
        if (mode === "update") {
          shareClass.issuedNotAllocated -= allocation.indiAllocationSuspended;
          allocation.indiAllocationLive = allocation.indiAllocationSuspended;
          allocation.indiAllocationSubmitted = allocation.indiAllocationSuspended;
          allocation.indiAllocationSuspended = 0;
        }
      }
    });
    setIsShareholder(!isShareholder);
  };

  const handleUpdateMode = (indi: NewIndividual) => {
    reinstateIndiDetails(indi);
    setMode("update");
  };

  const nullifyForm = () => {
    setActiveIndi(null);
    setIsDirector(false);
    setDateAppointed("");
    setIsCeased(false);
    setDateCeased("");
    setIsShareholder(false);
    setSearchTerm("");
    setSearchDisplay("");
    setMode("search");
  };

  const reinstateIndiDetails = (indi: NewIndividual) => {
    setIsDirector(indi.isDirector);
    setDateAppointed(indi.dateAppointed);
    setDateCeased(indi.dateCeased);
    setIsShareholder(indi.isShareholder);
    console.log(indi);
    setActiveIndi(indi);
  };

  return (
    <>
      {availableIndis.length > 0 && (
        <>
          <form onSubmit={handleSubmit} id="selectIndiForm" action="">
            {mode === "search" && (
              <IndividualInput
                ref={inputRef}
                session={session}
                selection={availableIndis}
                activeIndi={activeIndi}
                setActiveIndividual={setActiveIndividual}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchDisplay={searchDisplay}
                setSearchDisplay={setSearchDisplay}
              />
            )}
            {mode === "update" && (
              <p>
                {newClientIndis.find((indi) => indi._id === activeIndi._id).firstName}{" "}
                {newClientIndis.find((indi) => indi._id === activeIndi._id).lastName}
              </p>
            )}
            {activeIndi && (
              <>
                {!activeIndi.isDirector && (
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
                )}
                {activeIndi.isDirector && (
                  <div>
                    <label htmlFor="isNotDirector"> Remove as director?</label>
                    <input
                      type="checkbox"
                      id="isNotDirector"
                      name="isNotDirector"
                      checked={!isDirector}
                      onChange={(e) => setIsDirector(!e.target.checked)}
                    ></input>
                  </div>
                )}
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
                {!activeIndi.isShareholder && (
                  <div>
                    <label htmlFor="isShareholder"> Designate as a shareholder?</label>
                    <input
                      type="checkbox"
                      id="isShareholder"
                      name="isShareholder"
                      checked={isShareholder}
                      onChange={manageShareAllocation}
                    ></input>
                  </div>
                )}
                {activeIndi.isShareholder && (
                  <div>
                    <label htmlFor="isNotShareholder"> Remove as shareholder?</label>
                    <input
                      type="checkbox"
                      id="isNotShareholder"
                      name="isNotShareholder"
                      checked={!isShareholder}
                      onChange={manageShareAllocation}
                    ></input>
                  </div>
                )}
                {isShareholder &&
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
                            <td>Allocate to</td>
                            <td>
                              <input
                                type="number"
                                value={
                                  activeIndi.potentialShareAllocations.find(
                                    (sClass: IndividualShareAllocation) =>
                                      sClass.shareClassNumber === sC.shareClassNumber
                                  ).indiAllocationLive === 0
                                    ? ""
                                    : activeIndi.potentialShareAllocations.find(
                                        (sClass: IndividualShareAllocation) =>
                                          sClass.shareClassNumber === sC.shareClassNumber
                                      ).indiAllocationLive
                                }
                                onChange={(e) => handleShareAllocation(e.target.value, sC.shareClassNumber)}
                              ></input>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </>
                  ))}
              </>
            )}
            <div>
              <button type="submit">GO</button>
            </div>
          </form>
          {newClientIndis.length > 0 && (
            <>
              <table>
                <tbody>
                  {newClientIndis.map((indi) => {
                    const isDirector = session.newClientPrelim.directors.find((dir) => dir._id === indi._id);
                    const isShareholder = session.newClientPrelim.shareholders.find((sh) => sh._id === indi._id);
                    return (
                      <>
                        <tr>
                          <td>{`${indi.firstName} ${indi.lastName}`}</td>
                          <td>{isDirector ? "Yes" : "No"}</td>
                          <td>{isShareholder ? "Yes" : "No"}</td>
                          <td>
                            {(!activeIndi || indi._id !== activeIndi._id) && (
                              <button type="button" onClick={() => handleUpdateMode(indi)}>
                                Update
                              </button>
                            )}
                          </td>
                        </tr>
                      </>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </>
      )}

      <CerysButton buttonText={"Add new individual"} handleClick={() => handleView(ADD_CORP_CLIENT_INDI_NEW)} />
      <CerysButton buttonText={"Finish"} handleClick={() => handleView(ADD_CORP_CLIENT_OPTIONS)} />
    </>
  );
};

export default AddCorpClientIndisHome;
