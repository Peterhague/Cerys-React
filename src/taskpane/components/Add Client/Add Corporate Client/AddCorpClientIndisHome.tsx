import * as React from "react";
import { useRef, useState } from "react";
import CerysButton from "../../CerysButton";
import { Session } from "../../../classes/session";
import { ADD_CORP_CLIENT_INDI_NEW, ADD_CORP_CLIENT_OPTIONS } from "../../../static-values/views";
import IndividualInput from "../../Utils/IndividualInput";
import { NewIndividual } from "../../../classes/new-individual";
import { ExtendedIndividual } from "../../../interfaces/interfaces";
import { IndividualShareAllocation, NewShareholding } from "../../../classes/share-classes";
import _ from "lodash";

interface addCorpClientIndisHomeProps {
  handleView: (view: string) => void;
  session: Session;
}

const AddCorpClientIndisHome = ({ session, handleView }: addCorpClientIndisHomeProps) => {
  const [mode, setMode] = useState("search");
  const [activeIndi, setActiveIndi] = useState<NewIndividual>(null);
  const [controlIndi, setControlIndi] = useState<NewIndividual>(null);
  const [suggestedIndi, setSuggestedIndi] = useState<ExtendedIndividual>(null);
  const [isDirector, setIsDirector] = useState(false);
  const [dateAppointed, setDateAppointed] = useState("");
  const [isCeased, setIsCeased] = useState(false);
  const [dateCeased, setDateCeased] = useState("");
  const [isShareholder, setIsShareholder] = useState(false);
  const [availableIndis] = useState([...session.customer.nonCorpClients, ...session.customer.individuals]);
  const [newClientIndis, setNewClientIndis] = useState(session.newClientPrelim.existingIndividuals);
  const [backupNewClientIndis, setBackupNewClientIndis] = useState(null);
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
      setActiveIndi(newIndi);
      const copy = _.cloneDeep(newIndi);
      setControlIndi(copy);
    } else {
      setActiveIndi(null);
      setControlIndi(null);
    }
  };

  const handleShareAllocation = (value: string, shareClassNumber: number) => {
    const val = value ? parseInt(value) : 0;
    const shareClass = session.newClientPrelim.shareClasses.find((i) => i.shareClassNumber === shareClassNumber);
    const potentialAllocation = activeIndi.potentialShareAllocations.find(
      (sClass) => sClass.shareClassNumber === shareClassNumber
    );
    if (shareClass.getAvailabletoAllocate(activeIndi) >= val) {
      potentialAllocation.indiAllocationLive = val;
      setActiveIndi({
        ...activeIndi,
        potentialShareAllocations: [
          ...activeIndi.potentialShareAllocations.filter((i) => i.shareClassNumber !== shareClassNumber),
          potentialAllocation,
        ],
      });
      //shareClass.prelimAllocation = val - addBack;
    } else {
      console.log("There aren't enough shares available for this allocation");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    console.log(_.isEqual(activeIndi, controlIndi));
    e.preventDefault();
    const isAllocatedShares = activeIndi.potentialShareAllocations.find((i) => i.indiAllocationLive !== 0);
    if (
      (isShareholder && !isAllocatedShares) ||
      (isDirector && !dateAppointed) ||
      (!isShareholder && isAllocatedShares)
    )
      return;
    const existingIndis = session.newClientPrelim.existingIndividuals;
    const order = {};
    existingIndis.forEach((indi, index) => (order[indi._id] = index));
    session.newClientPrelim.existingIndividuals = existingIndis.filter((i) => i._id !== activeIndi._id);
    // if (isDirector || isShareholder) {
    //   processIndividual(isAllocatedShares);
    // }
    processIndividual(isAllocatedShares);
    console.log(_.isEqual(activeIndi, controlIndi));
    console.log(activeIndi);
    console.log(controlIndi);
    if (_.isEqual(activeIndi, controlIndi)) return;
    session.newClientPrelim.shareClasses.forEach((item) => {
      const indiShareholding = activeIndi.potentialShareAllocations.find(
        (i) => i.shareClassNumber === item.shareClassNumber
      );
      const allocation = item.allocations.find((i) => i.individualId === activeIndi._id);
      if (indiShareholding) {
        if (allocation) {
          allocation.numberSubscribed = indiShareholding.indiAllocationLive;
        } else {
          item.allocations.push({
            individualId: activeIndi._id,
            numberSubscribed: indiShareholding.indiAllocationLive,
          });
        }
        item.allocations = item.allocations.filter((i) => i.numberSubscribed > 0);
      }
    });
    activeIndi.potentialShareAllocations.forEach((i) => (i.indiAllocationSuspended = 0));
    session.newClientPrelim.existingIndividuals.sort((a, b) => {
      return order[a._id] - order[b._id];
    });
    setNewClientIndis(session.newClientPrelim.existingIndividuals);
    backupNewClientIndis && setBackupNewClientIndis(null);
    nullifyForm();
  };

  const processIndividual = (isAllocatedShares: IndividualShareAllocation) => {
    activeIndi.isDirector = isDirector;
    activeIndi.dateAppointed = dateAppointed;
    activeIndi.dateCeased = dateCeased;
    if (isDirector && dateAppointed) {
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
    if (isShareholder && isAllocatedShares) {
      addShareholding(activeIndi);
    } else {
      removeShareholding(activeIndi);
    }
    activeIndi.potentialShareAllocations.forEach((allocation) => {
      allocation.indiAllocationSubmitted = allocation.indiAllocationLive;
    });
    if (isDirector || isShareholder) {
      session.newClientPrelim.existingIndividuals.push(activeIndi);
    }
  };

  const addDirectorship = (indi: NewIndividual) => {
    const directorship = {
      clientName: session.newClientPrelim.clientName,
      clientCode: session.newClientPrelim.clientCode,
      dateAppointed: indi.dateAppointed,
      dateCeased: indi.dateCeased,
    };
    indi.newClientDirectorships = [directorship];
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
    activeIndi.potentialShareAllocations.forEach((allocation) => {
      if (isShareholder) {
        if (mode === "update") {
          allocation.indiAllocationSuspended = allocation.indiAllocationSubmitted;
        }
        allocation.indiAllocationLive = 0;
        allocation.indiAllocationSubmitted = 0;
      } else if (!isShareholder) {
        if (mode === "update") {
          allocation.indiAllocationLive = allocation.indiAllocationSuspended;
          allocation.indiAllocationSubmitted = allocation.indiAllocationSuspended;
          allocation.indiAllocationSuspended = 0;
        }
      }
    });
    setIsShareholder(!isShareholder);
  };

  const handleUpdateMode = (indi: NewIndividual) => {
    const copy = _.cloneDeep(newClientIndis);
    setBackupNewClientIndis(copy);
    reinstateIndiDetails(indi);
    setMode("update");
  };

  const nullifyForm = () => {
    setActiveIndi(null);
    setControlIndi(null);
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
    setActiveIndi(indi);
    const copy = _.cloneDeep(indi);
    setControlIndi(copy);
  };

  const cancelFormInput = () => {
    console.log(backupNewClientIndis);
    const copy = _.cloneDeep(backupNewClientIndis);
    setNewClientIndis(copy);
    console.log(newClientIndis);
    setBackupNewClientIndis(null);
    nullifyForm();
  };

  const cancelDirectorship = () => {
    setIsDirector(false);
    setDateAppointed("");
    setDateCeased("");
  };

  return (
    <>
      {availableIndis.length > 0 && (
        <form onSubmit={handleSubmit} id="selectIndiForm" action="">
          {mode === "search" && (
            <IndividualInput
              ref={inputRef}
              session={session}
              selection={availableIndis}
              activeIndi={activeIndi}
              setActiveIndividual={setActiveIndividual}
              suggestedIndi={suggestedIndi}
              setSuggestedIndi={setSuggestedIndi}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              searchDisplay={searchDisplay}
              setSearchDisplay={setSearchDisplay}
              itemsToExclude={newClientIndis}
            />
          )}
          {mode === "update" && (
            <p>
              {newClientIndis.find((indi) => indi._id === activeIndi._id).firstName}{" "}
              {newClientIndis.find((indi) => indi._id === activeIndi._id).lastName}
            </p>
          )}
          {activeIndi && !activeIndi.isDirector && (
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
          {activeIndi && activeIndi.isDirector && (
            <div>
              <label htmlFor="isNotDirector"> Remove as director?</label>
              <input
                type="checkbox"
                id="isNotDirector"
                name="isNotDirector"
                checked={!isDirector}
                onChange={cancelDirectorship}
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
          {activeIndi && !activeIndi.isShareholder && (
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
          {activeIndi && activeIndi.isShareholder && (
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
            session.newClientPrelim.shareClasses.map((sC) => {
              return (
                <div key={sC.shareClassNumber}>
                  <table>
                    <tbody>
                      <tr>
                        <td>Shares issued</td>
                        <td>{sC.numberIssued}</td>
                      </tr>
                      <tr>
                        <td>Allocated elsewhere</td>
                        <td>{sC.getOtherAllocations(activeIndi)}</td>
                      </tr>
                      <tr>
                        <td>Available to allocate</td>
                        <td>{sC.getAvailabletoAllocate(activeIndi)}</td>
                      </tr>
                      <tr>
                        <td>Allocate to</td>
                        <td>
                          <input
                            type="number"
                            value={
                              activeIndi.potentialShareAllocations.find(
                                (sClass: IndividualShareAllocation) => sClass.shareClassNumber === sC.shareClassNumber
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
                </div>
              );
            })}
          {activeIndi && (
            <div>
              <button type="submit">Submit</button>
              <button type="button" onClick={cancelFormInput}>
                Cancel
              </button>
            </div>
          )}
        </form>
      )}
      {newClientIndis && newClientIndis.length > 0 && (
        <table>
          <tbody>
            {newClientIndis.map((indi) => {
              const isDirector = session.newClientPrelim.directors.find((dir) => dir._id === indi._id);
              const isShareholder = session.newClientPrelim.shareholders.find((sh) => sh._id === indi._id);
              return (
                <tr key={indi._id}>
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
              );
            })}
          </tbody>
        </table>
      )}
      <CerysButton buttonText={"Add new individual"} handleClick={() => handleView(ADD_CORP_CLIENT_INDI_NEW)} />
      <CerysButton buttonText={"Finish"} handleClick={() => handleView(ADD_CORP_CLIENT_OPTIONS)} />
    </>
  );
};

export default AddCorpClientIndisHome;
