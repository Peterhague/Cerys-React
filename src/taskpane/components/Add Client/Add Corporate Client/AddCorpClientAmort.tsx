import * as React from "react";
import { useState } from "react";
import CerysButton from "../../CerysButton";
interface addCorpClientAmortProps {
  handleView: (view) => void;
  session: {};
}

const AddCorpClientAmort: React.FC<addCorpClientAmortProps> = ({ handleView, session }: addCorpClientAmortProps) => {
  const [amortBasisGwill, setAmortBasisGwill] = useState("SL");
  const [amortRateGwill, setAmortRateGwill] = useState("");
  const [amortBasisPatsLics, setAmortBasisPatsLics] = useState("SL");
  const [amortRatePatsLics, setAmortRatePatsLics] = useState("");
  const [amortBasisDevCosts, setAmortBasisDevCosts] = useState("SL");
  const [amortRateDevCosts, setAmortRateDevCosts] = useState("");
  const [amortBasisCompSware, setAmortBasisCompSware] = useState("SL");
  const [amortRateCompSware, setAmortRateCompSware] = useState("");

  const onAmortBasisGWChange = (e) => {
    setAmortBasisGwill(e.target.value);
  };

  const onAmortBasisPLChange = (e) => {
    setAmortBasisPatsLics(e.target.value);
  };

  const onAmortBasisDCChange = (e) => {
    setAmortBasisDevCosts(e.target.value);
  };

  const onAmortBasisCSChange = (e) => {
    setAmortBasisCompSware(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amortPols = {
      amortBasisGwill,
      amortRateGwill,
      amortBasisPatsLics,
      amortRatePatsLics,
      amortBasisDevCosts,
      amortRateDevCosts,
      amortBasisCompSware,
      amortRateCompSware,
    };
    const updatedObj = { ...session["newClientPrelim"], ...amortPols };
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
              <td>Goodwill</td>
              <td>
                <label htmlFor="calc-basis-gwill-SL">SL</label>
                <input
                  name="calcBasisGwill"
                  type="radio"
                  id="calc-basis-gwill-SL"
                  className="form-control"
                  value="SL"
                  checked
                  onChange={onAmortBasisGWChange}
                ></input>
              </td>
              <td>
                <label htmlFor="calc-basis-gwill-RB">RB</label>
                <input
                  name="calcBasisGwill"
                  type="radio"
                  id="calc-basis-gwill-RB"
                  className="form-control"
                  value="RB"
                  onChange={onAmortBasisGWChange}
                ></input>
              </td>
              <td>
                <input
                  name="amortRateGwill"
                  type="number"
                  id="amort-rate-gwill"
                  className="form-control input-depn-rate"
                  value={amortRateGwill}
                  onChange={(e) => setAmortRateGwill(e.target.value)}
                ></input>
              </td>
            </tr>
            <tr>
              <td>Patents & licences</td>
              <td>
                <label htmlFor="calc-basis-pats-lics-SL">SL</label>
                <input
                  name="calcBasisPatsLics"
                  type="radio"
                  id="calc-basis-pats-lics-SL"
                  className="form-control"
                  value="SL"
                  checked
                  onChange={onAmortBasisPLChange}
                ></input>
              </td>
              <td>
                <label htmlFor="calc-basis-pats-lics-RB">RB</label>
                <input
                  name="calcBasisPatsLics"
                  type="radio"
                  id="calc-basis-pats-lics-RB"
                  className="form-control"
                  value="RB"
                  onChange={onAmortBasisPLChange}
                ></input>
              </td>
              <td>
                <input
                  name="amortRatePatsLics"
                  type="number"
                  id="amort-rate-pats-lics"
                  className="form-control input-depn-rate"
                  value={amortRatePatsLics}
                  onChange={(e) => setAmortRatePatsLics(e.target.value)}
                ></input>
              </td>
            </tr>
            <tr>
              <td>Development costs</td>
              <td>
                <label htmlFor="calc-basis-dev-costs-SL">SL</label>
                <input
                  name="calcBasisDevCosts"
                  type="radio"
                  id="calc-basis-dev-costs-SL"
                  className="form-control"
                  value="SL"
                  checked
                  onChange={onAmortBasisDCChange}
                ></input>
              </td>
              <td>
                <label htmlFor="calc-basis-dev-costs-RB">RB</label>
                <input
                  name="calcBasisDevCosts"
                  type="radio"
                  id="calc-basis-dev-costs-RB"
                  className="form-control"
                  value="RB"
                  onChange={onAmortBasisDCChange}
                ></input>
              </td>
              <td>
                <input
                  name="amortRateDevCosts"
                  type="number"
                  id="amort-rate-dev-costs"
                  className="form-control input-depn-rate"
                  value={amortRateDevCosts}
                  onChange={(e) => setAmortRateDevCosts(e.target.value)}
                ></input>
              </td>
            </tr>
            <tr>
              <td>Computer software</td>
              <td>
                <label htmlFor="calc-basis-comp-sware-SL">SL</label>
                <input
                  name="calcBasisCompSware"
                  type="radio"
                  id="calc-basis-comp-sware-SL"
                  className="form-control"
                  value="SL"
                  checked
                  onChange={onAmortBasisCSChange}
                ></input>
              </td>
              <td>
                <label htmlFor="calc-basis-comp-sware-RB">RB</label>
                <input
                  name="calcBasisCompSware"
                  type="radio"
                  id="calc-basis-comp-sware-RB"
                  className="form-control"
                  value="RB"
                  onChange={onAmortBasisCSChange}
                ></input>
              </td>
              <td>
                <input
                  name="amortRateCompSware"
                  type="number"
                  id="amort-rate-comp-sware"
                  className="form-control input-depn-rate"
                  value={amortRateCompSware}
                  onChange={(e) => setAmortRateCompSware(e.target.value)}
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

export default AddCorpClientAmort;
