import * as React from "react";
import { useState } from "react";
import CerysButton from "../../CerysButton";
import { Session } from "../../../classes/session";
import { ADD_CORP_CLIENT_OPTIONS, LANDING_PAGE } from "../../../static-values/views";
import { Client } from "../../../classes/client";

interface addCorpClientDepnIPProps {
  handleView: (view) => void;
  session: Session;
}

const AddCorpClientDepnIP = ({ handleView, session }: addCorpClientDepnIPProps) => {
  const [depnBasisIPOwned, setDepnBasisIPOwned] = useState("");
  const [depnRateIPOwned, setDepnRateIPOwned] = useState("");
  const [depnBasisIPLeased, setDepnBasisIPLeased] = useState("");
  const [depnRateIPLeased, setDepnRateIPLeased] = useState("");

  const onDepnBasisIPOChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDepnBasisIPOwned(e.target.value);
  };

  const onDepnBasisIPLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDepnBasisIPLeased(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const depnPols = {
      depnBasisIPOwned,
      depnRateIPOwned,
      depnBasisIPLeased,
      depnRateIPLeased,
    };
    const updatedObj = { ...session.newClientPrelim, ...depnPols };
    session.newClientPrelim = new Client(updatedObj);
    handleView(ADD_CORP_CLIENT_OPTIONS);
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
              <td>Investment property - owned</td>
              <td>
                <label htmlFor="calc-basis-ipo-SL">SL</label>
                <input
                  name="calcBasisIPOwned"
                  type="radio"
                  id="calc-basis-ipo-SL"
                  className="form-control"
                  value="SL"
                  onChange={onDepnBasisIPOChange}
                ></input>
              </td>
              <td>
                <label htmlFor="calc-basis-ipo-RB">RB</label>
                <input
                  name="calcBasisIPOwned"
                  type="radio"
                  id="calc-basis-ipo-RB"
                  className="form-control"
                  value="RB"
                  onChange={onDepnBasisIPOChange}
                ></input>
              </td>
              <td>
                <input
                  name="depnRateIPOwned"
                  type="number"
                  id="depn-rate-ipo"
                  className="form-control input-depn-rate"
                  value={depnRateIPOwned}
                  onChange={(e) => setDepnRateIPOwned(e.target.value)}
                ></input>
              </td>
            </tr>
            <tr>
              <td>Investment property - leased</td>
              <td>
                <label htmlFor="calc-basis-ipl-SL">SL</label>
                <input
                  name="calcBasisIPLeased"
                  type="radio"
                  id="calc-basis-ipl-SL"
                  className="form-control"
                  value="SL"
                  onChange={onDepnBasisIPLChange}
                ></input>
              </td>
              <td>
                <label htmlFor="calc-basis-ipl-RB">RB</label>
                <input
                  name="calcBasisIPLeased"
                  type="radio"
                  id="calc-basis-ipl-RB"
                  className="form-control"
                  value="RB"
                  onChange={onDepnBasisIPLChange}
                ></input>
              </td>
              <td>
                <input
                  name="depnRateIPLeased"
                  type="number"
                  id="depn-rate-ipl"
                  className="form-control input-depn-rate"
                  value={depnRateIPLeased}
                  onChange={(e) => setDepnRateIPLeased(e.target.value)}
                ></input>
              </td>
            </tr>
          </tbody>
        </table>
        <div>
          <button type="submit">Submit details</button>
        </div>
      </form>
      <CerysButton buttonText={"Return"} handleClick={() => handleView(LANDING_PAGE)} />
    </>
  );
};

export default AddCorpClientDepnIP;
