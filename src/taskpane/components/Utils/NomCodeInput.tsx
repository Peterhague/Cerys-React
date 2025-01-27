import * as React from "react";
import { useState } from "react";
import { Session } from "../../classes/session";
import { ClientCodeObject } from "../../classes/client-codes";
import { ClientCerysCodeObject } from "../../classes/cerys-codes";

interface nomCodeInputProps {
  session: Session;
  chart: ClientCerysCodeObject[] | ClientCodeObject[];
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

    const handleChange = (value: string) => {
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

    const handleSelect = (codeObj: ClientCerysCodeObject | ClientCodeObject) => {
      setNominalCode(
        codeObj instanceof ClientCodeObject ? codeObj.clientCode.toString() : codeObj.cerysCode.toString()
      );
      setNominalCodeName(codeObj instanceof ClientCerysCodeObject ? codeObj.cerysExcelName : codeObj.clientCodeName);
      setSearchTerm(
        codeObj instanceof ClientCodeObject
          ? `${codeObj.clientCode} ${codeObj.clientCodeName}`
          : `${codeObj.cerysCode} ${codeObj.cerysExcelName}`
      );
      setSearchDisplay(
        codeObj instanceof ClientCodeObject
          ? `${codeObj.clientCode} ${codeObj.clientCodeName}`
          : `${codeObj.cerysCode} ${codeObj.cerysExcelName}`
      );
      setShowSuggestions(false);
      session.arrowIndex = -1;
    };

    const handleBlur = (e: React.FocusEvent) => {
      console.log(searchTerm.trim());
      if (e.currentTarget.contains(e.relatedTarget)) {
        return;
      } else {
        const searchTermTrimmed = searchTerm.trim();
        const searchTermTrimmedLower = searchTermTrimmed.toLowerCase();
        setShowSuggestions(false);
        session.arrowIndex = -1;
        if (searchDisplay !== searchTerm) {
          setSearchTerm(searchDisplay);
        } else {
          const filteredChart = chart.filter((code) => {
            const codeStr = code instanceof ClientCodeObject ? code.clientCode.toString() : code.cerysCode.toString();
            const name = code instanceof ClientCerysCodeObject ? code.cerysName : code.clientCodeName;
            let check = true;
            for (let i = 0; i < searchTermTrimmed.length; i++) {
              if (codeStr[i] !== searchTermTrimmed[i]) check = false;
            }
            if (name.toLowerCase().includes(searchTermTrimmed.toLowerCase())) check = true;
            return check;
          });
          if (filteredChart.length === 1) {
            const codeObj = filteredChart[0];
            const codeStr = "clientCode" in codeObj ? codeObj.clientCode.toString() : codeObj.cerysCode.toString();
            const shortName = "cerysExcelName" in codeObj ? codeObj.cerysExcelName : codeObj.clientCodeName;
            setNominalCode(codeStr);
            setNominalCodeName(shortName);
            setSearchTerm(`${codeStr} ${shortName}`);
            setSearchDisplay(`${codeStr} ${shortName}`);
          } else if (
            filteredChart.find(
              (code) => code instanceof ClientCerysCodeObject && code.cerysCode === parseInt(searchTermTrimmed)
            ) ||
            filteredChart.find(
              (code) => code instanceof ClientCodeObject && code.clientCode === parseInt(searchTermTrimmed)
            )
          ) {
            let codeObj = filteredChart.find(
              (code) => code instanceof ClientCerysCodeObject && code.cerysCode === parseInt(searchTermTrimmed)
            );
            if (!codeObj)
              codeObj = filteredChart.find(
                (code) => code instanceof ClientCodeObject && code.clientCode === parseInt(searchTermTrimmed)
              );
            const codeStr =
              codeObj instanceof ClientCodeObject ? codeObj.clientCode.toString() : codeObj.cerysCode.toString();
            const shortName = "cerysExcelName" in codeObj ? codeObj.cerysExcelName : codeObj.clientCodeName;
            setNominalCode(codeStr);
            setNominalCodeName(shortName);
            setSearchTerm(`${codeStr} ${shortName}`);
            setSearchDisplay(`${codeStr} ${shortName}`);
          } else if (
            filteredChart.find(
              (code) =>
                code instanceof ClientCerysCodeObject &&
                (code.cerysName.toLocaleUpperCase() === searchTermTrimmedLower ||
                  code.cerysShortName.toLowerCase() === searchTermTrimmedLower ||
                  code.cerysExcelName.toLowerCase() === searchTermTrimmedLower)
            ) ||
            filteredChart.find(
              (code) => code instanceof ClientCodeObject && code.clientCodeName.toLowerCase() === searchTermTrimmedLower
            )
          ) {
            let codeObj = filteredChart.find(
              (code) =>
                code instanceof ClientCerysCodeObject &&
                (code.cerysExcelName.toLowerCase() === searchTermTrimmedLower ||
                  code.cerysShortName.toLowerCase() === searchTermTrimmedLower ||
                  code.cerysName.toLowerCase() === searchTermTrimmedLower)
            );
            if (!codeObj)
              codeObj = filteredChart.find(
                (code) =>
                  code instanceof ClientCodeObject && code.clientCodeName.toLowerCase() === searchTermTrimmedLower
              );
            const codeStr =
              codeObj instanceof ClientCodeObject ? codeObj.clientCode.toString() : codeObj.cerysCode.toString();
            const shortName = "cerysExcelName" in codeObj ? codeObj.cerysExcelName : codeObj.clientCodeName;
            setNominalCode(codeStr);
            setNominalCodeName(shortName);
            setSearchTerm(`${codeStr} ${shortName}`);
            setSearchDisplay(`${codeStr} ${shortName}`);
          }
        }
      }
    };

    const handleKeyDown = (e) => {
      if (showSuggestions) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          const filteredChart = chart.filter((code) => {
            const codeStr = "clientCode" in code ? code.clientCode.toString() : code.cerysCode.toString();
            const name = "cerysName" in code ? code.cerysName : code.clientCodeName;
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
              const code = filteredChart[session.arrowIndex];
              const codeStr = "clientCode" in code ? code.clientCode.toString() : code.cerysCode.toString();
              const shortName = "cerysExcelName" in code ? code.cerysExcelName : code.clientCodeName;
              setNominalCode(codeStr);
              setNominalCodeName(shortName);
              setSearchDisplay(`${codeStr} ${shortName}`);
            }
          } else {
            if (session.arrowIndex > 0) {
              session.arrowIndex -= 1;
              const code = filteredChart[session.arrowIndex];
              const codeStr = "clientCode" in code ? code.clientCode.toString() : code.cerysCode.toString();
              const shortName = "cerysExcelName" in code ? code.cerysExcelName : code.clientCodeName;
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
                  if (searchTerm.length === 0) return code;
                  const codeStr = "clientCode" in code ? code.clientCode.toString() : code.cerysCode.toString();
                  const name = "cerysName" in code ? code.cerysName : code.clientCodeName;
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
