import * as React from "react";
import { useState } from "react";
import CerysButton from "../../CerysButton";
interface addCorpClientDepnProps {
  handleView: (view) => void;
  session: {};
}

const AddCorpClientDepn: React.FC<addCorpClientDepnProps> = ({ handleView, session }: addCorpClientDepnProps) => {
  const [depnBasisFholdProp, setDepnBasisFholdProp] = useState("SL");
  const [depnRateFholdProp, setDepnRateFholdProp] = useState("");
  const [depnBasisShortLhold, setDepnBasisShortLhold] = useState("SL");
  const [depnRateShortLhold, setDepnRateShortLhold] = useState("");
  const [depnBasisLongLhold, setDepnBasisLongLhold] = useState("SL");
  const [depnRateLongLhold, setDepnRateLongLhold] = useState("");
  const [depnBasisImprovements, setDepnBasisImprovements] = useState("SL");
  const [depnRateImprovements, setDepnRateImprovements] = useState("");
  const [depnBasisPlantMachinery, setDepnBasisPlantMachinery] = useState("SL");
  const [depnRatePlantMachinery, setDepnRatePlantMachinery] = useState("");
  const [depnBasisFixFittings, setDepnBasisFixFittings] = useState("SL");
  const [depnRateFixFittings, setDepnRateFixFittings] = useState("");
  const [depnBasisMotorVehicles, setDepnBasisMotorVehicles] = useState("SL");
  const [depnRateMotorVehicles, setDepnRateMotorVehicles] = useState("");
  const [depnBasisCompEquip, setDepnBasisCompEquip] = useState("SL");
  const [depnRateCompEquip, setDepnRateCompEquip] = useState("");
  const [depnBasisOfficeEquip, setDepnBasisOfficeEquip] = useState("SL");
  const [depnRateOfficeEquip, setDepnRateOfficeEquip] = useState("");

  const onDepnBasisFHPChange = (e) => {
    setDepnBasisFholdProp(e.target.value);
  };

  const onDepnBasisSLHChange = (e) => {
    setDepnBasisShortLhold(e.target.value);
  };

  const onDepnBasisLLHChange = (e) => {
    setDepnBasisLongLhold(e.target.value);
  };

  const onDepnBasisItoPChange = (e) => {
    setDepnBasisImprovements(e.target.value);
  };

  const onDepnBasisPMChange = (e) => {
    setDepnBasisPlantMachinery(e.target.value);
  };

  const onDepnBasisFFChange = (e) => {
    setDepnBasisFixFittings(e.target.value);
  };

  const onDepnBasisMVChange = (e) => {
    setDepnBasisMotorVehicles(e.target.value);
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
      depnBasisFholdProp,
      depnRateFholdProp,
      depnBasisShortLhold,
      depnRateShortLhold,
      depnBasisLongLhold,
      depnRateLongLhold,
      depnBasisImprovements,
      depnRateImprovements,
      depnBasisPlantMachinery,
      depnRatePlantMachinery,
      depnBasisFixFittings,
      depnRateFixFittings,
      depnBasisMotorVehicles,
      depnRateMotorVehicles,
      depnBasisCompEquip,
      depnRateCompEquip,
      depnBasisOfficeEquip,
      depnRateOfficeEquip,
    };
    const updatedObj = { ...session["newClientPrelim"], ...depnPols };
    session["newClientPrelim"] = updatedObj;
    handleView("addCorpClientOptions");
  };

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
                  checked
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
                  value={depnRateFholdProp}
                  onChange={(e) => setDepnRateFholdProp(e.target.value)}
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
                  checked
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
                  value={depnRateShortLhold}
                  onChange={(e) => setDepnRateShortLhold(e.target.value)}
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
                  checked
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
                  value={depnRateLongLhold}
                  onChange={(e) => setDepnRateLongLhold(e.target.value)}
                ></input>
              </td>
            </tr>
            <tr>
              <td>Property improvements</td>
              <td>
                <label htmlFor="calc-basis-improvements-SL">SL</label>
                <input
                  name="calcBasisImprovements"
                  type="radio"
                  id="calc-basis-improvements-SL"
                  className="form-control"
                  value="SL"
                  checked
                  onChange={onDepnBasisItoPChange}
                ></input>
              </td>
              <td>
                <label htmlFor="calc-basis-improvements-RB">RB</label>
                <input
                  name="calcBasisImprovements"
                  type="radio"
                  id="calc-basis-improvements-RB"
                  className="form-control"
                  value="RB"
                  onChange={onDepnBasisItoPChange}
                ></input>
              </td>
              <td>
                <input
                  name="depnRateImprovements"
                  type="number"
                  id="depn-rate-improvements"
                  className="form-control input-depn-rate"
                  value={depnRateImprovements}
                  onChange={(e) => setDepnRateImprovements(e.target.value)}
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
                  checked
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
                  value={depnRatePlantMachinery}
                  onChange={(e) => setDepnRatePlantMachinery(e.target.value)}
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
                  checked
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
                  value={depnRateFixFittings}
                  onChange={(e) => setDepnRateFixFittings(e.target.value)}
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
                  checked
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
                  value={depnRateMotorVehicles}
                  onChange={(e) => setDepnRateMotorVehicles(e.target.value)}
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
                  checked
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
                  checked
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
      <CerysButton buttonText={"Return"} handleClick={() => handleView("landingPage")} />
    </>
  );
};

export default AddCorpClientDepn;
