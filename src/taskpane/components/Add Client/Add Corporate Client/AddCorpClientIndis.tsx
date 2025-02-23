import * as React from "react";
import { useRef, useState, Fragment } from "react";
import CerysButton from "../../CerysButton";
import { Session } from "../../../classes/session";
import { ADD_CORP_CLIENT_OPTIONS } from "../../../static-values/views";
import IndividualInput from "../../Utils/IndividualInput";
import { NewIndiAssociation } from "../../../classes/individuals";
import { ExtendedIndividual } from "../../../interfaces/interfaces";
import { IndividualShareAllocation, NewShareholding } from "../../../classes/share-classes";
import _ from "lodash";
import IndiFields from "../../Utils/IndiFields";

interface AddCorpClientIndisProps {
  session: Session;
}

const AddCorpClientIndis = ({ session }: AddCorpClientIndisProps) => {
  const [mode, setMode] = useState("search");
  const [activeIndi, setActiveIndi] = useState<NewIndiAssociation>(null);
  const [controlIndi, setControlIndi] = useState<NewIndiAssociation>(null);
  const [suggestedIndi, setSuggestedIndi] = useState<ExtendedIndividual>(null);
  const [isDirector, setIsDirector] = useState(false);
  const [dateAppointed, setDateAppointed] = useState("");
  const [isCeased, setIsCeased] = useState(false);
  const [dateCeased, setDateCeased] = useState("");
  const [isShareholder, setIsShareholder] = useState(false);
  const [availableIndis] = useState([...session.customer.nonCorpClients, ...session.customer.individuals]);
  const [newClientIndis, setNewClientIndis] = useState([
    ...session.newClientPrelim.existingIndividuals,
    ...session.newClientPrelim.newIndividuals,
  ]);
  const [backupNewClientIndis, setBackupNewClientIndis] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDisplay, setSearchDisplay] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const setActiveIndividual = (indi: ExtendedIndividual) => {
    if (indi) {
      setActiveIndividualNext(indi);
    } else {
      setActiveIndi(null);
      setControlIndi(null);
    }
  };

  const setActiveIndividualNext = (indi: ExtendedIndividual | null) => {
    const newIndi = new NewIndiAssociation(indi);
    const potentialShareAllocations = session.newClientPrelim.shareClasses.map((i) => new IndividualShareAllocation(i));
    newIndi.potentialShareAllocations = potentialShareAllocations;
    setActiveIndi(newIndi);
    const copy = _.cloneDeep(newIndi);
    setControlIndi(copy);
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
    const relevantIndis = session.newClientPrelim[activeIndi.associationType];
    const order = {};
    relevantIndis.forEach((indi, index) => (order[indi.individualId] = index));
    session.newClientPrelim[activeIndi.associationType] = relevantIndis.filter(
      (i) => i.individualId !== activeIndi.individualId
    );
    processIndividual(isAllocatedShares);
    if (_.isEqual(activeIndi, controlIndi)) return;
    session.newClientPrelim.shareClasses.forEach((item) => {
      const indiShareholding = activeIndi.potentialShareAllocations.find(
        (i) => i.shareClassNumber === item.shareClassNumber
      );
      const allocation = item.allocations.find((i) => i.individualId === activeIndi.individualId);
      if (indiShareholding) {
        if (allocation) {
          allocation.numberSubscribed = indiShareholding.indiAllocationLive;
        } else {
          item.allocations.push({
            individualId: activeIndi.individualId,
            numberSubscribed: indiShareholding.indiAllocationLive,
          });
        }
        item.allocations = item.allocations.filter((i) => i.numberSubscribed > 0);
      }
    });
    activeIndi.potentialShareAllocations.forEach((i) => (i.indiAllocationSuspended = 0));
    session.newClientPrelim.existingIndividuals.sort((a, b) => {
      return order[a.individualId] - order[b.individualId];
    });
    setNewClientIndis([...session.newClientPrelim.existingIndividuals, ...session.newClientPrelim.newIndividuals]);
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
      session.newClientPrelim[activeIndi.associationType].push(activeIndi);
    }
  };

  const addDirectorship = (indi: NewIndiAssociation) => {
    const directorship = {
      clientName: session.newClientPrelim.clientName,
      clientCode: session.newClientPrelim.clientCode,
      dateAppointed: indi.dateAppointed,
      dateCeased: indi.dateCeased,
    };
    indi.newClientDirectorships = [directorship];
    session.newClientPrelim.directors = session.newClientPrelim.directors.filter(
      (dir) => dir.individualId !== indi.individualId
    );
    session.newClientPrelim.directors.push(indi);
  };

  const removeDirectorship = (indi: NewIndiAssociation) => {
    indi.newClientDirectorships = [];
    session.newClientPrelim.directors = session.newClientPrelim.directors.filter(
      (dir) => dir.individualId !== indi.individualId
    );
  };

  const addShareholding = (indi: NewIndiAssociation) => {
    session.newClientPrelim.shareholders = session.newClientPrelim.shareholders.filter(
      (sh) => sh.individualId !== indi.individualId
    );
    session.newClientPrelim.shareholders.push(indi);
  };

  const removeShareholding = (indi: NewIndiAssociation) => {
    session.newClientPrelim.shareholders = session.newClientPrelim.shareholders.filter(
      (sh) => sh.individualId !== indi.individualId
    );
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

  const handleUpdateMode = (indi: NewIndiAssociation) => {
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

  const reinstateIndiDetails = (indi: NewIndiAssociation) => {
    setIsDirector(indi.isDirector);
    setDateAppointed(indi.dateAppointed);
    setDateCeased(indi.dateCeased);
    setIsShareholder(indi.isShareholder);
    setActiveIndi(indi);
    const copy = _.cloneDeep(indi);
    setControlIndi(copy);
  };

  const cancelFormInput = () => {
    const copy = _.cloneDeep(backupNewClientIndis);
    setNewClientIndis(copy);
    setBackupNewClientIndis(null);
    nullifyForm();
  };

  const cancelDirectorship = () => {
    setIsDirector(false);
    setDateAppointed("");
    setDateCeased("");
  };

  const handleNewIndi = () => {
    setActiveIndividualNext(null);
    setMode("addIndi");
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
              {newClientIndis.find((indi) => indi.individualId === activeIndi.individualId).firstName}{" "}
              {newClientIndis.find((indi) => indi.individualId === activeIndi.individualId).lastName}
            </p>
          )}
          <table>
            <tbody>
              {mode === "addIndi" && <IndiFields activeIndi={activeIndi} setActiveIndi={setActiveIndi} />}
              {activeIndi && !activeIndi.isDirector && (
                <tr>
                  <td>
                    <label htmlFor="isDirector"> Designate as a director?</label>
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="isDirector"
                      name="isDirector"
                      checked={isDirector}
                      onChange={(e) => setIsDirector(e.target.checked)}
                    ></input>
                  </td>
                </tr>
              )}
              {activeIndi && activeIndi.isDirector && (
                <tr>
                  <td>
                    <label htmlFor="isNotDirector"> Remove as director?</label>
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="isNotDirector"
                      name="isNotDirector"
                      checked={!isDirector}
                      onChange={cancelDirectorship}
                    ></input>
                  </td>
                </tr>
              )}
              {isDirector && (
                <>
                  <tr>
                    <td>
                      <label htmlFor="dateAppointed">Date appointed</label>
                    </td>
                    <td>
                      <input
                        type="date"
                        id="dateAppointed"
                        name="dateAppointed"
                        value={dateAppointed}
                        onChange={(e) => setDateAppointed(e.target.value)}
                      ></input>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label htmlFor="isCeased">No longer in office?</label>
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        id="isCeased"
                        name="isCeased"
                        checked={isCeased}
                        onChange={(e) => setIsCeased(e.target.checked)}
                      ></input>
                    </td>
                  </tr>
                  {isCeased && (
                    <tr>
                      <td>
                        <label htmlFor="dateCeased">Date ceased</label>
                      </td>
                      <td>
                        <input
                          type="date"
                          id="dateCeased"
                          name="dateCeased"
                          value={dateCeased}
                          onChange={(e) => setDateCeased(e.target.value)}
                        ></input>
                      </td>
                    </tr>
                  )}
                </>
              )}
              {activeIndi && !activeIndi.isShareholder && (
                <tr>
                  <td>
                    <label htmlFor="isShareholder"> Designate as a shareholder?</label>
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="isShareholder"
                      name="isShareholder"
                      checked={isShareholder}
                      onChange={manageShareAllocation}
                    ></input>
                  </td>
                </tr>
              )}
              {activeIndi && activeIndi.isShareholder && (
                <tr>
                  <td>
                    <label htmlFor="isNotShareholder"> Remove as shareholder?</label>
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      id="isNotShareholder"
                      name="isNotShareholder"
                      checked={!isShareholder}
                      onChange={manageShareAllocation}
                    ></input>
                  </td>
                </tr>
              )}
              {isShareholder &&
                session.newClientPrelim.shareClasses.map((sC) => {
                  return (
                    <Fragment key={sC.shareClassNumber}>
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
                        <td>
                          <label htmlFor="allocation">Allocate to</label>
                        </td>
                        <td>
                          <input
                            type="number"
                            id="allocation"
                            name="allocation"
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
                    </Fragment>
                  );
                })}
            </tbody>
          </table>

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
              const isDirector = session.newClientPrelim.directors.find(
                (dir) => dir.individualId === indi.individualId
              );
              const isShareholder = session.newClientPrelim.shareholders.find(
                (sh) => sh.individualId === indi.individualId
              );
              return (
                <tr key={indi.individualId}>
                  <td>{`${indi.firstName} ${indi.lastName}`}</td>
                  <td>{isDirector ? "Yes" : "No"}</td>
                  <td>{isShareholder ? "Yes" : "No"}</td>
                  <td>
                    {(!activeIndi || indi.individualId !== activeIndi.individualId) && (
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
      <CerysButton buttonText={"Add new individual"} handleClick={handleNewIndi} />
      <CerysButton buttonText={"Finish"} handleClick={() => session.handleView(ADD_CORP_CLIENT_OPTIONS)} />
    </>
  );
};

export default AddCorpClientIndis;
