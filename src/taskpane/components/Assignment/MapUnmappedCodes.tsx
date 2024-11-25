import * as React from "react";
import { useState } from "react";
import CerysButton from "../CerysButton";

interface mapUnmappedCodes {
  handleView: (view) => void;
  session: {};
}

const MapUnmappedCodes: React.FC<mapUnmappedCodes> = ({ handleView, session }: mapUnmappedCodes) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [codeObjects, setCodeObjects] = useState(session["unmappedCodeObjects"]);
  //const [nameOne, setNameOne] = useState("");
  //const [nameTwo, setNameTwo] = useState("");
  //const [nameThree, setNameThree] = useState("");

  //const handleCodeMappingOne = (value, clientCode) => {
  //  codeObjects.forEach((obj) => {
  //    if (obj.code === clientCode) {
  //      console.log("matched");
  //      obj.cerysCode = value;
  //    }
  //  });
  //  setCodeObjects(codeObjects);
  //  let matched = false;
  //  session["chart"].forEach((code) => {
  //    if (code.cerysCode === parseInt(value)) {
  //      setNameOne(code.cerysShortName);
  //      matched = true;
  //      console.log(nameOne);
  //    }
  //  });
  //  if (!matched) setNameOne("");
  //  };

  //const handleCodeMappingOne = (value, clientCode) => {
  //  codeObjects.forEach((obj) => {
  //    if (obj.code === clientCode) {
  //      console.log("matched");
  //      obj.cerysCode = value;
  //      let matched = false;
  //      session["chart"].forEach((code) => {
  //        if (code.cerysCode === parseInt(value)) {
  //          setNameOne(code.cerysShortName);
  //          matched = true;
  //          console.log(nameOne);
  //          obj.cerysShortName = code.cerysShortName;
  //        }
  //      });
  //      if (!matched) setNameOne("");
  //    }
  //  });
  //  setCodeObjects(codeObjects);
  //};

  //const handleCodeMappingTwo = (value, clientCode) => {
  //  codeObjects.forEach((obj) => {
  //    if (obj.code === clientCode) {
  //      obj.cerysCode = value;
  //    }
  //  });
  //  setCodeObjects(codeObjects);
  //  let matched = false;
  //  session["chart"].forEach((code) => {
  //    if (code.cerysCode === parseInt(value)) {
  //      setNameTwo(code.cerysShortName);
  //      matched = true;
  //    }
  //  });
  //  if (!matched) setNameOne("");
  //};

  //const handleCodeMappingThree = (value, clientCode) => {
  //  codeObjects.forEach((obj) => {
  //    if (obj.code === clientCode) {
  //      obj.cerysCode = value;
  //    }
  //  });
  //  setCodeObjects(codeObjects);
  //  let matched = false;
  //  session["chart"].forEach((code) => {
  //    if (code.cerysCode === parseInt(value)) {
  //      setNameThree(code.cerysShortName);
  //      matched = true;
  //      console.log(nameOne);
  //    }
  //  });
  //  if (!matched) setNameOne("");
  //  };

  const handleCodeMappingOne = (value, clientCode) => {
    codeObjects.forEach((obj) => {
      if (obj.code === clientCode) {
        obj.cerysCode = value;
        const newArr = [...codeObjects];
        setCodeObjects(newArr);
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
    const newArr = [...codeObjects];
    setCodeObjects(newArr);
  };

  //const handleCodeMappingTwo = (value, clientCode) => {
  //  codeObjects.forEach((obj) => {
  //    if (obj.code === clientCode) {
  //      obj.cerysCode = value;
  //    }
  //  });
  //  setCodeObjects(codeObjects);
  //  let matched = false;
  //  session["chart"].forEach((code) => {
  //    if (code.cerysCode === parseInt(value)) {
  //      matched = true;
  //    }
  //  });
  //};

  //const handleCodeMappingThree = (value, clientCode) => {
  //  codeObjects.forEach((obj) => {
  //    if (obj.code === clientCode) {
  //      obj.cerysCode = value;
  //    }
  //  });
  //  setCodeObjects(codeObjects);
  //  let matched = false;
  //  session["chart"].forEach((code) => {
  //    if (code.cerysCode === parseInt(value)) {
  //      setNameThree(code.cerysShortName);
  //      matched = true;
  //      console.log(nameOne);
  //    }
  //  });
  //  if (!matched) setNameOne("");
  //};

  const handlePrevious = () => {
    setActiveIndex(activeIndex - 3);
  };

  const handleNext = () => {
    setActiveIndex(activeIndex + 3);
  };

  const handleSubmit = async () => {
    console.log("submitted");
    console.log(codeObjects);
  };

  return (
    <>
      <table>
        <tbody>
          <tr>
            <td>Client code</td>
            <td>{codeObjects[activeIndex].code}</td>
          </tr>
          <tr>
            <td></td>
            <td>{codeObjects[activeIndex].name}</td>
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
                onChange={(e) => handleCodeMappingOne(e.target.value, codeObjects[activeIndex].code)}
                list="chart"
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
              <td>{codeObjects[activeIndex + 1].code}</td>
            </tr>
            <tr>
              <td></td>
              <td>{codeObjects[activeIndex + 1].name}</td>
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
                  onChange={(e) => handleCodeMappingOne(e.target.value, codeObjects[activeIndex + 1].code)}
                  list="chart"
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
              <td>{codeObjects[activeIndex + 2].code}</td>
            </tr>
            <tr>
              <td></td>
              <td>{codeObjects[activeIndex + 2].name}</td>
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
                  onChange={(e) => handleCodeMappingOne(e.target.value, codeObjects[activeIndex + 2].code)}
                  list="chart"
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

      <CerysButton buttonText={"ASSIGNMENT HOME"} handleView={() => handleView("assignmentDashHome")} />
    </>
  );
};

export default MapUnmappedCodes;
