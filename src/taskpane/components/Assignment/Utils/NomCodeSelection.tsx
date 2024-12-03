import * as React from "react";
import { useState, useRef, useEffect } from "react";
import CerysButton from "../../CerysButton";
interface nomCodeSelectionProps {
  handleView: (view) => void;
  session: {};
}

const NomCodeSelection: React.FC<nomCodeSelectionProps> = ({ handleView, session }: nomCodeSelectionProps) => {
  const [nominalCode, setNominalCode] = useState("");
  const [nominalCodeName, setNominalCodeName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDisplay, setSearchDisplay] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const chart = session["chart"];

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  const handleChange = (value) => {
    if (nominalCodeName) {
      if (value.length > searchDisplay.length) {
        return;
      } else if (value.length < searchDisplay.length) {
        session["arrowIndex"] = -1;
        setSearchTerm(nominalCode);
        setSearchDisplay(nominalCode);
        setNominalCode("");
        setNominalCodeName("");
      }
    } else {
      session["arrowIndex"] = -1;
      setSearchTerm(value);
      setSearchDisplay(value);
    }
  };

  const handleSelect = (cerysCodeObj) => {
    setNominalCode(cerysCodeObj.cerysCode.toString());
    setNominalCodeName(cerysCodeObj.cerysExcelName);
    setSearchTerm(`${cerysCodeObj.cerysCode} ${cerysCodeObj.cerysExcelName}`);
    setSearchDisplay(`${cerysCodeObj.cerysCode} ${cerysCodeObj.cerysExcelName}`);
    setShowSuggestions(false);
    session["arrowIndex"] = -1;
  };

  const handleBlur = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) {
      return;
    } else {
      setShowSuggestions(false);
      session["arrowIndex"] = -1;
      if (searchDisplay !== searchTerm) {
        setSearchTerm(searchDisplay);
      } else {
        chart.forEach((code) => {
          const codeStr = code.cerysCode.toString();
          let check = false;
          if (code.cerysName.toLowerCase() === searchTerm.toLowerCase() || codeStr === searchTerm) check = true;
          if (check) {
            setNominalCode(code.cerysCode.toString());
            setNominalCodeName(code.cerysExcelName);
            setSearchTerm(`${code.cerysCode} ${code.cerysExcelName}`);
            setSearchDisplay(`${code.cerysCode} ${code.cerysExcelName}`);
          }
        });
      }
    }
  };

  const handleKeyDown = (e) => {
    if (showSuggestions) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const filteredChart = chart.filter((code) => {
          const codeStr = code.cerysCode.toString();
          let check = true;
          for (let i = 0; i < searchTerm.length; i++) {
            if (codeStr[i] !== searchTerm[i]) check = false;
          }
          if (code.cerysName.toLowerCase().includes(searchTerm.toLowerCase())) check = true;
          return searchTerm && check;
        });
        if (e.key === "ArrowDown") {
          if (session["arrowIndex"] < filteredChart.length - 1) {
            session["arrowIndex"] += 1;
            setNominalCode(filteredChart[session["arrowIndex"]].cerysCode.toString());
            setNominalCodeName(filteredChart[session["arrowIndex"]].cerysExcelName);
            setSearchDisplay(
              `${filteredChart[session["arrowIndex"]].cerysCode} ${filteredChart[session["arrowIndex"]].cerysExcelName}`
            );
          }
        } else {
          if (session["arrowIndex"] > 0) {
            session["arrowIndex"] -= 1;
            setNominalCode(filteredChart[session["arrowIndex"]].cerysCode.toString());
            setNominalCodeName(filteredChart[session["arrowIndex"]].cerysExcelName);
            setSearchDisplay(
              `${filteredChart[session["arrowIndex"]].cerysCode} ${filteredChart[session["arrowIndex"]].cerysExcelName}`
            );
          }
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(nominalCode);
  };

  return (
    <>
      <form onSubmit={handleSubmit} id="nomcodeSelectionForm" action="">
        <h3>Select Nominal Code</h3>
        <div onBlur={(e) => handleBlur(e)}>
          <input
            name="nominalCodeType"
            id="nominalCodeSelect"
            className="form-control"
            value={searchDisplay}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => handleKeyDown(e)}
            ref={inputRef}
          ></input>
          <div>
            {showSuggestions &&
              chart
                .filter((code) => {
                  const codeStr = code.cerysCode.toString();
                  let check = true;
                  for (let i = 0; i < searchTerm.length; i++) {
                    if (codeStr[i] !== searchTerm[i]) check = false;
                  }
                  if (code.cerysName.toLowerCase().includes(searchTerm.toLowerCase())) check = true;
                  return searchTerm && check;
                })
                .map((code) => (
                  <div onClick={() => handleSelect(code)} key={code._id} tabIndex={-1}>
                    {code.cerysCode + " " + code.cerysExcelName}
                  </div>
                ))}
          </div>
          {/*<select*/}
          {/*  name="nominalCodeSelect"*/}
          {/*  id="nominalCodeSelect"*/}
          {/*  className="form-control"*/}
          {/*  value={nominalCode}*/}
          {/*  onChange={(e) => setNominalCode(e.target.value)}*/}
          {/*>*/}
          {/*  {session["chart"].map((code) => (*/}
          {/*    <option key={code._id} value={code.cerysCode}>*/}
          {/*      {code.cerysCode + " " + code.cerysExcelName}*/}
          {/*    </option>*/}
          {/*  ))}*/}
          {/*</select>*/}
        </div>
        <div>
          <button type="submit">Submit</button>
        </div>
      </form>
      <CerysButton buttonText={"Return"} handleView={() => handleView("landingPage")} />
    </>
  );
};

export default NomCodeSelection;
