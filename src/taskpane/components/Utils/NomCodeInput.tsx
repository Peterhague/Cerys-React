import * as React from "react";
import { useState } from "react";
import { Session } from "../../classes/session";

interface nomCodeInputProps {
  session: Session;
  chart: [
    {
      cerysCode: number;
      cerysName: string;
      cerysExcelName: string;
      clientCode: number;
      clientCodeName: string;
      _id: string;
    },
  ];
  nominalCode: string;
  setNominalCode: (code) => void;
  nominalCodeName: string;
  setNominalCodeName: (name) => void;
  searchTerm: string;
  setSearchTerm: (term) => void;
  searchDisplay: string;
  setSearchDisplay: (display) => void;
}

const NomCodeInput = React.forwardRef<HTMLInputElement, nomCodeInputProps>(
  (
    {
      session,
      chart,
      nominalCode,
      setNominalCode,
      nominalCodeName,
      setNominalCodeName,
      searchTerm,
      setSearchTerm,
      searchDisplay,
      setSearchDisplay,
    }: nomCodeInputProps,
    ref
  ) => {
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleChange = (value) => {
      if (nominalCodeName) {
        if (value.length > searchDisplay.length) {
          return;
        } else if (value.length < searchDisplay.length) {
          session.arrowIndex = -1;
          setSearchTerm(nominalCode);
          setSearchDisplay(nominalCode);
          setNominalCode("");
          setNominalCodeName("");
        }
      } else {
        session.arrowIndex = -1;
        setSearchTerm(value);
        setSearchDisplay(value);
      }
    };

    const handleSelect = (codeObj) => {
      setNominalCode(codeObj.clientCode ? codeObj.clientCode.toString() : codeObj.cerysCode.toString());
      setNominalCodeName(codeObj.cerysExcelName ? codeObj.cerysExcelName : codeObj.clientCodeName);
      setSearchTerm(
        codeObj.clientCode
          ? `${codeObj.clientCode} ${codeObj.clientCodeName}`
          : `${codeObj.cerysCode} ${codeObj.cerysExcelName}`
      );
      setSearchDisplay(
        codeObj.clientCode
          ? `${codeObj.clientCode} ${codeObj.clientCodeName}`
          : `${codeObj.cerysCode} ${codeObj.cerysExcelName}`
      );
      setShowSuggestions(false);
      session.arrowIndex = -1;
    };

    const handleBlur = (e) => {
      if (e.currentTarget.contains(e.relatedTarget)) {
        return;
      } else {
        setShowSuggestions(false);
        session.arrowIndex = -1;
        if (searchDisplay !== searchTerm) {
          setSearchTerm(searchDisplay);
        } else {
          chart.forEach((code) => {
            const codeStr = code.clientCode ? code.clientCode.toString() : code.cerysCode.toString();
            const name = code.cerysName ? code.cerysName : code.clientCodeName;
            const shortName = code.cerysExcelName ? code.cerysExcelName : code.clientCodeName;
            let check = false;
            if (name.toLowerCase() === searchTerm.toLowerCase() || codeStr === searchTerm) check = true;
            if (check) {
              setNominalCode(codeStr);
              setNominalCodeName(shortName);
              setSearchTerm(`${codeStr} ${shortName}`);
              setSearchDisplay(`${codeStr} ${shortName}`);
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
            const codeStr = code.clientCode ? code.clientCode.toString() : code.cerysCode.toString();
            const name = code.cerysName ? code.cerysName : code.clientCodeName;
            let check = true;
            for (let i = 0; i < searchTerm.length; i++) {
              if (codeStr[i] !== searchTerm[i]) check = false;
            }
            if (name.toLowerCase().includes(searchTerm.toLowerCase())) check = true;
            return searchTerm && check;
          });
          if (e.key === "ArrowDown") {
            if (session.arrowIndex < filteredChart.length - 1) {
              session.arrowIndex += 1;
              const codeStr = filteredChart[session.arrowIndex].clientCode
                ? filteredChart[session.arrowIndex].clientCode.toString()
                : filteredChart[session.arrowIndex].cerysCode.toString();
              const shortName = filteredChart[session.arrowIndex].cerysExcelName
                ? filteredChart[session.arrowIndex].cerysExcelName
                : filteredChart[session.arrowIndex].clientCodeName;
              setNominalCode(codeStr);
              setNominalCodeName(shortName);
              setSearchDisplay(`${codeStr} ${shortName}`);
            }
          } else {
            if (session.arrowIndex > 0) {
              session.arrowIndex -= 1;
              const codeStr = filteredChart[session.arrowIndex].clientCode
                ? filteredChart[session.arrowIndex].clientCode.toString()
                : filteredChart[session.arrowIndex].cerysCode.toString();
              const shortName = filteredChart[session.arrowIndex].cerysExcelName
                ? filteredChart[session.arrowIndex].cerysExcelName
                : filteredChart[session.arrowIndex].clientCodeName;
              setNominalCode(codeStr);
              setNominalCodeName(shortName);
              setSearchDisplay(`${codeStr} ${shortName}`);
            }
          }
        }
      }
    };

    const getSuggestion = (code) => {
      return code.clientCode ? `${code.clientCode} ${code.clientCodeName}` : `${code.cerysCode} ${code.cerysExcelName}`;
    };

    return (
      <>
        <div onBlur={(e) => handleBlur(e)}>
          <input
            name="nominalCodeType"
            id="nominalCodeSelect"
            className="form-control"
            placeholder="Search nominal codes"
            ref={ref}
            value={searchDisplay}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => handleKeyDown(e)}
          ></input>
          <div>
            {showSuggestions &&
              chart
                .filter((code) => {
                  const codeStr = code.clientCode ? code.clientCode.toString() : code.cerysCode.toString();
                  const name = code.cerysName ? code.cerysName : code.clientCodeName;
                  let check = true;
                  for (let i = 0; i < searchTerm.length; i++) {
                    if (codeStr[i] !== searchTerm[i]) check = false;
                  }
                  if (name.toLowerCase().includes(searchTerm.toLowerCase())) check = true;
                  return searchTerm && check;
                })
                .map((code) => (
                  <div onClick={() => handleSelect(code)} key={code._id} tabIndex={-1}>
                    {getSuggestion(code)}
                  </div>
                ))}
          </div>
        </div>
      </>
    );
  }
);

NomCodeInput.displayName = "NomCodeInput";
export default NomCodeInput;
