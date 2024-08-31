import * as React from "react";
import { useState } from "react";
import CerysButton from "../../CerysButton";
import { addClientPrelimDepnUrl } from "../../../fetching/apiEndpoints";
import { fetchOptionsUpdateClientDepn } from "../../../fetching/generateOptions";
interface addCorpClientDepnProps {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const AddCorpClientDepn: React.FC<addCorpClientDepnProps> = ({
  updateSession,
  handleView,
  session,
}: addCorpClientDepnProps) => {
  const [depnBasisFHProp, setDepnBasisFHProp] = useState("");
  const [depnRateFHProp, setDepnRateFHProp] = useState("");
  const [depnBasisShortLH, setDepnBasisShortLH] = useState("");
  const [depnRateShortLH, setDepnRateShortLH] = useState("");
  const [depnBasisLongLH, setDepnBasisLongLH] = useState("");
  const [depnRateLongLH, setDepnRateLongLH] = useState("");
  const [depnBasisPlant, setDepnBasisPlant] = useState("");
  const [depnRatePlant, setDepnRatePlant] = useState("");
  const [depnBasisFixFit, setDepnBasisFixFit] = useState("");
  const [depnRateFixFit, setDepnRateFixFit] = useState("");
  const [depnBasisMV, setDepnBasisMV] = useState("");
  const [depnRateMV, setDepnRateMV] = useState("");
  const [depnBasisCompEquip, setDepnBasisCompEquip] = useState("");
  const [depnRateCompEquip, setDepnRateCompEquip] = useState("");
  const [depnBasisOfficeEquip, setDepnBasisOfficeEquip] = useState("");
  const [depnRateOfficeEquip, setDepnRateOfficeEquip] = useState("");

  const onDepnBasisFHPChange = (e) => {
    setDepnBasisFHProp(e.target.value);
  };

  const onDepnBasisSLHChange = (e) => {
    setDepnBasisShortLH(e.target.value);
  };

  const onDepnBasisLLHChange = (e) => {
    setDepnBasisLongLH(e.target.value);
  };

  const onDepnBasisPMChange = (e) => {
    setDepnBasisPlant(e.target.value);
  };

  const onDepnBasisFFChange = (e) => {
    setDepnBasisFixFit(e.target.value);
  };

  const onDepnBasisMVChange = (e) => {
    setDepnBasisMV(e.target.value);
  };

  const onDepnBasisCEChange = (e) => {
    setDepnBasisCompEquip(e.target.value);
  };

  const onDepnBasisOEChange = (e) => {
    setDepnBasisOfficeEquip(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const depnPols = {
      depnBasisFHProp,
      depnRateFHProp,
      depnBasisShortLH,
      depnRateShortLH,
      depnBasisLongLH,
      depnRateLongLH,
      depnBasisPlant,
      depnRatePlant,
      depnBasisFixFit,
      depnRateFixFit,
      depnBasisMV,
      depnRateMV,
      depnBasisCompEquip,
      depnRateCompEquip,
      depnBasisOfficeEquip,
      depnRateOfficeEquip,
    };
    //const updatedClient = await updateClientDb(depnPols);
    //console.log(updatedClient);
    //session["newClientPrelim"] = updatedClient;
    const updatedObj = { ...session["newClientPrelim"], ...depnPols };
    session["newClientPrelim"] = updatedObj;
    updateSession(session);
    handleView("addCorpClientOptions");
  };

  /*const updateClientDb = async (depnPols) => {
    console.log(depnPols);
    const options = fetchOptionsUpdateClientDepn(
      depnPols,
      session["customer"]["_id"],
      session["newClientPrelim"]["_id"]
    );
    const updatedClientDb = await fetch(addClientPrelimDepnUrl, options);
    const updatedClient = updatedClientDb.json();
    return updatedClient;
  };*/

  return (
    <>
      <form onSubmit={handleSubmit}>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Basis</th>
              <th>Rate</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Freehold property</td>
              <td>
                <label htmlFor="calc-basis-fhprop-SL">SL</label>
                <input
                  name="calcBasisFHProp"
                  type="radio"
                  id="calc-basis-fhprop-SL"
                  className="form-control"
                  value="SL"
                  onChange={onDepnBasisFHPChange}
                ></input>
              </td>
              <td>
                <label htmlFor="calc-basis-fhprop-RB">RB</label>
                <input
                  name="calcBasisFHProp"
                  type="radio"
                  id="calc-basis-fhprop-RB"
                  className="form-control"
                  value="RB"
                  onChange={onDepnBasisFHPChange}
                ></input>
              </td>
              <td>
                <input
                  name="depnRateFHProp"
                  type="number"
                  id="depn-rate-fhprop"
                  className="form-control input-depn-rate"
                  value={depnRateFHProp}
                  onChange={(e) => setDepnRateFHProp(e.target.value)}
                ></input>
              </td>
            </tr>
            <tr>
              <td>Short leasehold</td>
              <td>
                <label htmlFor="calc-basis-shortlh-SL">SL</label>
                <input
                  name="calcBasisShortLH"
                  type="radio"
                  id="calc-basis-shortlh-SL"
                  className="form-control"
                  value="SL"
                  onChange={onDepnBasisSLHChange}
                ></input>
              </td>
              <td>
                <label htmlFor="calc-basis-shortlh-RB">RB</label>
                <input
                  name="calcBasisShortLH"
                  type="radio"
                  id="calc-basis-shortlh-RB"
                  className="form-control"
                  value="RB"
                  onChange={onDepnBasisSLHChange}
                ></input>
              </td>
              <td>
                <input
                  name="depnRateShortLH"
                  type="number"
                  id="depn-rate-shortlh"
                  className="form-control input-depn-rate"
                  value={depnRateShortLH}
                  onChange={(e) => setDepnRateShortLH(e.target.value)}
                ></input>
              </td>
            </tr>
            <tr>
              <td>Long leasehold</td>
              <td>
                <label htmlFor="calc-basis-longlh-SL">SL</label>
                <input
                  name="calcBasisLongLH"
                  type="radio"
                  id="calc-basis-longlh-SL"
                  className="form-control"
                  value="SL"
                  onChange={onDepnBasisLLHChange}
                ></input>
              </td>
              <td>
                <label htmlFor="calc-basis-longlh-RB">RB</label>
                <input
                  name="calcBasisLongLH"
                  type="radio"
                  id="calc-basis-longlh-RB"
                  className="form-control"
                  value="RB"
                  onChange={onDepnBasisLLHChange}
                ></input>
              </td>
              <td>
                <input
                  name="depnRateLongLH"
                  type="number"
                  id="depn-rate-longlh"
                  className="form-control input-depn-rate"
                  value={depnRateLongLH}
                  onChange={(e) => setDepnRateLongLH(e.target.value)}
                ></input>
              </td>
            </tr>
            <tr>
              <td>Plant and machinery</td>
              <td>
                <label htmlFor="calc-basis-plant-SL">SL</label>
                <input
                  name="calcBasisPlant"
                  type="radio"
                  id="calc-basis-plant-SL"
                  className="form-control"
                  value="SL"
                  onChange={onDepnBasisPMChange}
                ></input>
              </td>
              <td>
                <label htmlFor="calc-basis-plant-RB">RB</label>
                <input
                  name="calcBasisPlant"
                  type="radio"
                  id="calc-basis-plant-RB"
                  className="form-control"
                  value="RB"
                  onChange={onDepnBasisPMChange}
                ></input>
              </td>
              <td>
                <input
                  name="depnRatePlant"
                  type="number"
                  id="depn-rate-plant"
                  className="form-control input-depn-rate"
                  value={depnRatePlant}
                  onChange={(e) => setDepnRatePlant(e.target.value)}
                ></input>
              </td>
            </tr>
            <tr>
              <td>Fixtures and fittings</td>
              <td>
                <label htmlFor="calc-basis-fixfit-SL">SL</label>
                <input
                  name="calcBasisFixFit"
                  type="radio"
                  id="calc-basis-fixfit-SL"
                  className="form-control"
                  value="SL"
                  onChange={onDepnBasisFFChange}
                ></input>
              </td>
              <td>
                <label htmlFor="calc-basis-fixfit-RB">RB</label>
                <input
                  name="calcBasisFixFit"
                  type="radio"
                  id="calc-basis-fixfit-RB"
                  className="form-control"
                  value="RB"
                  onChange={onDepnBasisFFChange}
                ></input>
              </td>
              <td>
                <input
                  name="depnRateFixFit"
                  type="number"
                  id="depn-rate-fixfit"
                  className="form-control input-depn-rate"
                  value={depnRateFixFit}
                  onChange={(e) => setDepnRateFixFit(e.target.value)}
                ></input>
              </td>
            </tr>
            <tr>
              <td>Motor vehicles</td>
              <td>
                <label htmlFor="calc-basis-mv-SL">SL</label>
                <input
                  name="calcBasisMV"
                  type="radio"
                  id="calc-basis-mv-SL"
                  className="form-control"
                  value="SL"
                  onChange={onDepnBasisMVChange}
                ></input>
              </td>
              <td>
                <label htmlFor="calc-basis-mv-RB">RB</label>
                <input
                  name="calcBasisMV"
                  type="radio"
                  id="calc-basis-mv-RB"
                  className="form-control"
                  value="RB"
                  onChange={onDepnBasisMVChange}
                ></input>
              </td>
              <td>
                <input
                  name="depnRateMV"
                  type="number"
                  id="depn-rate-mv"
                  className="form-control input-depn-rate"
                  value={depnRateMV}
                  onChange={(e) => setDepnRateMV(e.target.value)}
                ></input>
              </td>
            </tr>
            <tr>
              <td>Computer equipment</td>
              <td>
                <label htmlFor="calc-basis-comp-equip-SL">SL</label>
                <input
                  name="calcBasisCompEquip"
                  type="radio"
                  id="calc-basis-comp-equip-SL"
                  className="form-control"
                  value="SL"
                  onChange={onDepnBasisCEChange}
                ></input>
              </td>
              <td>
                <label htmlFor="calc-basis-comp-equip-RB">RB</label>
                <input
                  name="calcBasisCompEquip"
                  type="radio"
                  id="calc-basis-comp-equip-RB"
                  className="form-control"
                  value="RB"
                  onChange={onDepnBasisCEChange}
                ></input>
              </td>
              <td>
                <input
                  name="depnRateCompEquip"
                  type="number"
                  id="depn-rate-comp-equip"
                  className="form-control input-depn-rate"
                  value={depnRateCompEquip}
                  onChange={(e) => setDepnRateCompEquip(e.target.value)}
                ></input>
              </td>
            </tr>
            <tr>
              <td>Office equipment</td>
              <td>
                <label htmlFor="calc-basis-office-equip-SL">SL</label>
                <input
                  name="calcBasisOfficeEquip"
                  type="radio"
                  id="calc-basis-office-equip-SL"
                  className="form-control"
                  value="SL"
                  onChange={onDepnBasisOEChange}
                ></input>
              </td>
              <td>
                <label htmlFor="calc-basis-office-equip-RB">RB</label>
                <input
                  name="calcBasisOfficeEquip"
                  type="radio"
                  id="calc-basis-office-equip-RB"
                  className="form-control"
                  value="RB"
                  onChange={onDepnBasisOEChange}
                ></input>
              </td>
              <td>
                <input
                  name="depnRateOfficeEquip"
                  type="number"
                  id="depn-rate-office-equip"
                  className="form-control input-depn-rate"
                  value={depnRateOfficeEquip}
                  onChange={(e) => setDepnRateOfficeEquip(e.target.value)}
                ></input>
              </td>
            </tr>
          </tbody>
        </table>
        <div>
          <button type="submit">Submit details</button>
        </div>
      </form>
      <CerysButton buttonText={"Return"} handleView={() => handleView("landingPage")} />
    </>
  );
};

export default AddCorpClientDepn;
