import * as React from "react";
import { useState } from "react";
import CerysButton from "../../CerysButton";
interface addIndiClientAssocSHProps {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const AddIndiClientAssocSH: React.FC<addIndiClientAssocSHProps> = ({
  updateSession,
  handleView,
  session,
}: addIndiClientAssocSHProps) => {
  const [clientId, setClientId] = useState({});
  const [shareClasses, setShareClasses] = useState(null);
  const [showShareClasses, setShowShareClasses] = useState(false);

  //const prelimClient = session["newIndiPrelim"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    updateSession(session);
    handleView("addIndiClientAssocOptions");
  };

  const handleClientSelection = (e) => {
    const activeClient = e.target.value;
    console.log(activeClient);
    let sClasses;
    session["customer"]["clients"].forEach((clt) => {
      console.log(clt);
      console.log(clt.shareClasses);
      if (clt._id === activeClient) {
        sClasses = clt.shareClasses;
        setClientId(clt);
      }
    });
    console.log(sClasses);
    setShareClasses(sClasses);
    console.log(shareClasses);
    setShowShareClasses(true);
    return activeClient;
  };

  const handleShareAllocation = (value, shareClassId) => {
    shareClasses.forEach((sClass) => {
      console.log(sClass);
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
        session["newIndiPrelim"]._clientShareholdings.forEach((interest) => {
          if (interest.shareClassId === shareClassId) {
            interest.interest = parseInt(value);
            allocationUpdated = true;
          }
        });
        !allocationUpdated && session["newIndiPrelim"]._clientShareholdings.push(allocation);
        console.log(session["newIndiPrelim"]);
      } else {
        console.log("There aren't enough shares available for this allocation");
      }
    });
  };

  //const handleShareAllocation = (value, shareClassNumber) => {
  //  session["newClientPrelim"]["shareClasses"].forEach((sClass) => {
  //    if (sClass.shareClassNumber === shareClassNumber && sClass.issuedNotAllocated >= value) {
  //      sClass["prelimAllocation"] = parseInt(value);
  //      const allocation = {
  //        key: shareClassNumber,
  //        clientName: session["newClientPrelim"]["clientName"],
  //        clientCode: session["newClientPrelim"]["clientCode"],
  //        clientId: session["newClientPrelim"]["_id"],
  //        shareClassName: sClass.shareClassName,
  //        shareClassNumber,
  //        interest: parseInt(value),
  //      };
  //      const updatedShareAllocations = [allocation];
  //      newShareAllocations.forEach((item) => {
  //        if (item.key !== shareClassNumber) {
  //          updatedShareAllocations.push(item);
  //        }
  //      });
  //      newShareAllocations = updatedShareAllocations;
  //      setShareAllocations(newShareAllocations);
  //    } else {
  //      console.log("There aren't enough shares available for this allocation");
  //    }
  //  });
  //};

  const finishSharesAllocation = () => {
    setShowShareClasses(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} id="addClientForm" action="">
        <h3>Add New Individual</h3>
        <>
          <div>
            <select name="client" id="client" className="form-control" onChange={(e) => handleClientSelection(e)}>
              <option>Please select</option>
              {session["customer"]["clients"].map((client) => (
                <option key={client._id} value={client._id}>
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
                        Allocate to {session["newIndiPrelim"].firstName} {session["newIndiPrelim"].lastName}
                      </td>
                      <td>
                        <input type="number" onChange={(e) => handleShareAllocation(e.target.value, sC._id)}></input>
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
      <CerysButton buttonText={"Return"} handleView={() => handleView("landingPage")} />
    </>
  );
};

export default AddIndiClientAssocSH;
