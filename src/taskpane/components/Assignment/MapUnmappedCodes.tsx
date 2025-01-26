import * as React from "react";
import { useState } from "react";
import CerysButton from "../CerysButton";
import { fetchOptionsUpdateClientChart } from "../../fetching/generateOptions";
import { updateClientChartUrl } from "../../fetching/apiEndpoints";
import { enterTB } from "../../client-data-processing/trial-balance";
import { Session } from "../../classes/session";
import { ASSIGNMENT_DASH_HOME } from "../../static-values/views";
import { ClientCodeObject } from "../../classes/client-codes";
import { ClientCodeObjectProps } from "../../interfaces/interfaces";

interface mapUnmappedCodes {
  handleView: (view: string) => void;
  session: Session;
}

const MapUnmappedCodes = ({ handleView, session }: mapUnmappedCodes) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [codeObjects, setCodeObjects] = useState(session.unmappedCodeObjects);

  const handleCodeMapping = (value: string, codeObject) => {
    codeObject.cerysCode = parseInt(value);
    const newArr = [...codeObjects];
    setCodeObjects(newArr);
    const anotherNewArr = [...codeObjects];
    setCodeObjects(anotherNewArr);
  };

  const handlePrevious = () => {
    setActiveIndex(activeIndex - 3);
  };

  const handleNext = () => {
    setActiveIndex(activeIndex + 3);
  };

  const handleSubmit = async () => {
    const options = fetchOptionsUpdateClientChart(codeObjects, session);
    const updatedCustAndClientDb = await fetch(updateClientChartUrl, options);
    const { client } = await updatedCustAndClientDb.json();
    session.clientChart = client.clientChart.map((i: ClientCodeObjectProps) => new ClientCodeObject(i));
    enterTB(session);
  };

  return (
    <>
      <table>
        <tbody>
          <tr>
            <td>Client code</td>
            <td>{codeObjects[activeIndex].clientCode}</td>
          </tr>
          <tr>
            <td></td>
            <td>{codeObjects[activeIndex].clientCodeName}</td>
          </tr>
          <tr>
            <td>Cerys mapping</td>
            <td>
              <input
                name="nominalCode"
                type="text"
                id="nominalCode"
                className="form-control"
                placeholder="Enter nominal code"
                value={codeObjects[activeIndex].cerysCode > 0 ? codeObjects[activeIndex].cerysCode : ""}
                onChange={(e) => handleCodeMapping(e.target.value, codeObjects[activeIndex])}
              ></input>
            </td>
          </tr>
          <tr>
            <td></td>
            <td>
              {codeObjects[activeIndex].getCerysCodeObj(session).cerysShortName
                ? codeObjects[activeIndex].getCerysCodeObj(session).cerysShortName
                : ""}
            </td>
          </tr>
        </tbody>
      </table>
      {codeObjects[activeIndex + 1] && (
        <table>
          <tbody>
            <tr>
              <td>Client code</td>
              <td>{codeObjects[activeIndex + 1].clientCode}</td>
            </tr>
            <tr>
              <td></td>
              <td>{codeObjects[activeIndex + 1].clientCodeName}</td>
            </tr>
            <tr>
              <td>Cerys mapping</td>
              <td>
                <input
                  name="nominalCode"
                  type="text"
                  id="nominalCode"
                  className="form-control"
                  placeholder="Enter nominal code"
                  value={codeObjects[activeIndex + 1].cerysCode > 0 ? codeObjects[activeIndex + 1].cerysCode : ""}
                  onChange={(e) => handleCodeMapping(e.target.value, codeObjects[activeIndex + 1])}
                ></input>
              </td>
            </tr>
            <tr>
              <td></td>
              <td>
                {codeObjects[activeIndex + 1].getCerysCodeObj(session).cerysShortName
                  ? codeObjects[activeIndex + 1].getCerysCodeObj(session).cerysShortName
                  : ""}
              </td>
            </tr>
          </tbody>
        </table>
      )}
      {codeObjects[activeIndex + 2] && (
        <table>
          <tbody>
            <tr>
              <td>Client code</td>
              <td>{codeObjects[activeIndex + 2].clientCode}</td>
            </tr>
            <tr>
              <td></td>
              <td>{codeObjects[activeIndex + 2].clientCodeName}</td>
            </tr>
            <tr>
              <td>Cerys mapping</td>
              <td>
                <input
                  name="nominalCode"
                  type="text"
                  id="nominalCode"
                  className="form-control"
                  placeholder="Enter nominal code"
                  value={codeObjects[activeIndex + 2].cerysCode > 0 ? codeObjects[activeIndex + 2].cerysCode : ""}
                  onChange={(e) => handleCodeMapping(e.target.value, codeObjects[activeIndex + 2])}
                ></input>
              </td>
            </tr>
            <tr>
              <td></td>
              <td>
                {codeObjects[activeIndex + 2].getCerysCodeObj(session).cerysShortName
                  ? codeObjects[activeIndex + 2].getCerysCodeObj(session).cerysShortName
                  : ""}
              </td>
            </tr>
          </tbody>
        </table>
      )}

      <datalist id="chart">
        {session.chart.map((code) => (
          <option key={code._id} value={code.cerysCode}>{`${code.cerysCode} ${code.cerysName}`}</option>
        ))}
      </datalist>

      {(codeObjects.length > activeIndex + 3 || activeIndex > 0) && (
        <div>
          {activeIndex > 0 && <button onClick={() => handlePrevious()}>Previous</button>}
          {codeObjects.length > activeIndex + 3 && (
            <button type="button" onClick={() => handleNext()}>
              Next
            </button>
          )}
        </div>
      )}
      <div>
        <button onClick={() => handleSubmit()}>Submit changes</button>
      </div>

      <CerysButton buttonText={"ASSIGNMENT HOME"} handleClick={() => handleView(ASSIGNMENT_DASH_HOME)} />
    </>
  );
};

export default MapUnmappedCodes;
