import * as React from "react";
import { useState } from "react";
import CerysButton from "../CerysButton";
import { fetchOptionsUpdateClientChart } from "../../fetching/generateOptions";
import { updateClientChartUrl } from "../../fetching/apiEndpoints";
import { enterTB } from "../../client-data-processing/trial-balance";

interface mapUnmappedCodes {
  handleView: (view) => void;
  session: {};
}

const MapUnmappedCodes: React.FC<mapUnmappedCodes> = ({ handleView, session }: mapUnmappedCodes) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [codeObjects, setCodeObjects] = useState(session["unmappedCodeObjects"]);

  const handleCodeMapping = (value, codeObject) => {
    codeObject.cerysCode = parseInt(value);
    const newArr = [...codeObjects];
    setCodeObjects(newArr);
    codeObjects.forEach((obj) => {
      if (obj.clientCode === codeObject.clientCode) {
        let matched = false;
        session["chart"].forEach((code) => {
          if (code.cerysCode === parseInt(value)) {
            obj.cerysShortName = code.cerysShortName;
            matched = true;
          }
        });
        if (!matched) obj.cerysShortName = "";
      }
    });
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
    const { customer, client } = await updatedCustAndClientDb.json();
    session["customer"] = customer;
    session["clientChart"] = client.clientChart;
    console.log(session);
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
            <td>{codeObjects[activeIndex].cerysShortName}</td>
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
              <td>{codeObjects[activeIndex + 1].cerysShortName}</td>
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
              <td>{codeObjects[activeIndex + 2].cerysShortName}</td>
            </tr>
          </tbody>
        </table>
      )}

      <datalist id="chart">
        {session["chart"].map((code) => (
          <option key={code._id} value={code.cerysCode}>{`${code.cerysCode} ${code.cerysName}`}</option>
        ))}
      </datalist>

      {(codeObjects.length > activeIndex + 3 || activeIndex > 0) && (
        <div>
          {activeIndex > 0 && <button onClick={() => handlePrevious()}>Previous</button>}
          {codeObjects.length > activeIndex + 3 && <button onClick={() => handleNext()}>Next</button>}
        </div>
      )}
      <div>
        <button onClick={() => handleSubmit()}>Submit changes</button>
      </div>

      <CerysButton buttonText={"ASSIGNMENT HOME"} handleClick={() => handleView("assignmentDashHome")} />
    </>
  );
};

export default MapUnmappedCodes;
