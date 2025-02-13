import * as React from "react";
import { useState } from "react";
import CerysButton from "../../CerysButton";
import { Session } from "../../../classes/session";
import { ADD_INDI_CLIENT_ASSOC_OPTIONS, LANDING_PAGE } from "../../../static-values/views";
interface addIndiClientAssocSHProps {
  handleView: (view: string) => void;
  session: Session;
}

const AddIndiClientAssocSH = ({ handleView, session }: addIndiClientAssocSHProps) => {
  const [clientId, setClientId] = useState({});
  const [shareClasses, setShareClasses] = useState(null);
  const [showShareClasses, setShowShareClasses] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleView(ADD_INDI_CLIENT_ASSOC_OPTIONS);
  };

  const handleClientSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const activeClient = e.target.value;
    const client = session.customer.clients.find((i) => i.clientId === activeClient);
    setClientId(client);
    setShareClasses(client.shareClasses);
    setShowShareClasses(true);
    return activeClient;
  };

  const handleShareAllocation = (value, shareClassId) => {
    shareClasses.forEach((sClass) => {
      if (sClass._id === shareClassId && sClass.issuedNotAllocated >= value) {
        sClass["prelimAllocation"] = parseInt(value);
        const allocation = {
          clientName: clientId["clientName"],
          clientCode: clientId["clientCode"],
          clientId: clientId["_id"],
          shareClassId: sClass._id,
          shareClassName: sClass.shareClassName,
          shareClassNumber: sClass.shareClassNumber,
          interest: parseInt(value),
        };
        let allocationUpdated = false;
        session.newIndiPrelim._clientShareholdings.forEach((interest) => {
          if (interest.shareClassId === shareClassId) {
            interest.interest = parseInt(value);
            allocationUpdated = true;
          }
        });
        !allocationUpdated && session.newIndiPrelim._clientShareholdings.push(allocation);
      } else {
        console.log("There aren't enough shares available for this allocation");
      }
    });
  };

  const finishSharesAllocation = () => {
    setShowShareClasses(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} id="addClientForm" action="">
        <h3>Add New Individual</h3>
        <>
          <div>
            <select
              name="client"
              id="client"
              title="client"
              className="form-control"
              onChange={(e) => handleClientSelection(e)}
            >
              <option>Please select</option>
              {session.customer.clients.map((client) => (
                <option key={client.clientId} value={client.clientId}>
                  {client.clientName}
                </option>
              ))}
            </select>
          </div>
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
                        <label htmlFor="allocateTo">
                          Allocate to {session.newIndiPrelim.firstName} {session.newIndiPrelim.lastName}
                        </label>
                      </td>
                      <td>
                        <input
                          id="allocateTo"
                          name="allocateTo"
                          type="number"
                          onChange={(e) => handleShareAllocation(e.target.value, sC._id)}
                        ></input>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </>
            ))}
          {showShareClasses && <button onClick={finishSharesAllocation}>Next</button>}

          <div>
            <button type="submit">Submit details</button>
          </div>
        </>
      </form>
      <CerysButton buttonText={"Return"} handleClick={() => handleView(LANDING_PAGE)} />
    </>
  );
};

export default AddIndiClientAssocSH;
