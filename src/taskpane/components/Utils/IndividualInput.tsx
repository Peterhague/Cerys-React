import * as React from "react";
import { useState } from "react";
import { Session } from "../../classes/session";
import { ExtendedIndividual } from "../../interfaces/interfaces";
import { NewIndividual } from "../../classes/new-individual";

interface IndividualInputProps {
  session: Session;
  selection: ExtendedIndividual[];
  activeIndi: NewIndividual;
  setActiveIndividual: (indi: ExtendedIndividual) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchDisplay: string;
  setSearchDisplay: (display: string) => void;
}

const IndividualInput = React.forwardRef<HTMLInputElement, IndividualInputProps>(
  (
    {
      session,
      selection,
      activeIndi,
      setActiveIndividual,
      searchTerm,
      setSearchTerm,
      searchDisplay,
      setSearchDisplay,
    }: IndividualInputProps,
    ref
  ) => {
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleChange = (value: string) => {
      if (activeIndi) {
        if (value.length > searchDisplay.length) {
          return;
        } else if (value.length < searchDisplay.length) {
          session.arrowIndex = -1;
          setSearchTerm("");
          setSearchDisplay("");
          setActiveIndividual(null);
        }
      } else {
        session.arrowIndex = -1;
        setSearchTerm(value);
        setSearchDisplay(value);
      }
    };

    const handleSelect = (indi: ExtendedIndividual) => {
      setActiveIndividual(indi);
      setSearchTerm(`${indi.firstName} ${indi.lastName}`);
      setSearchDisplay(`${indi.firstName} ${indi.lastName}`);
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
          const filteredSelection = selection.filter((indi) => {
            const fullName = `${indi.firstName} ${indi.lastName}`;
            let check = true;
            for (let i = 0; i < searchTerm.length; i++) {
              if (fullName[i] !== searchTerm[i]) check = false;
            }
            if (fullName.toLowerCase().includes(searchTerm.toLowerCase())) check = true;
            return searchTerm && check;
          });
          if (filteredSelection.length === 1) {
            const indi = filteredSelection[0];
            setSearchTerm(`${indi.firstName} ${indi.lastName}`);
            setSearchDisplay(`${indi.firstName} ${indi.lastName}`);
          }
        }
      }
    };

    const handleKeyDown = (e) => {
      if (showSuggestions) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          const filteredSelection = selection.filter((indi) => {
            const fullName = `${indi.firstName} ${indi.lastName}`;
            let check = true;
            for (let i = 0; i < searchTerm.length; i++) {
              if (fullName[i] !== searchTerm[i]) check = false;
            }
            if (fullName.toLowerCase().includes(searchTerm.toLowerCase())) check = true;
            return searchTerm && check;
          });
          if (e.key === "ArrowDown") {
            if (session.arrowIndex < filteredSelection.length - 1) {
              session.arrowIndex += 1;
              const indi = filteredSelection[session.arrowIndex];
              setActiveIndividual(indi);
              setSearchDisplay(`${indi.firstName} ${indi.lastName}`);
            }
          } else {
            if (session.arrowIndex > 0) {
              session.arrowIndex -= 1;
              const indi = filteredSelection[session.arrowIndex];
              setActiveIndividual(indi);
              setSearchDisplay(`${indi.firstName} ${indi.lastName}`);
            }
          }
        }
      }
    };

    return (
      <>
        <div onBlur={(e) => handleBlur(e)}>
          <input
            name="individual"
            id="individual"
            className="form-control"
            placeholder="Search individuals"
            ref={ref}
            value={searchDisplay}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => handleKeyDown(e)}
          ></input>
          <div>
            {showSuggestions &&
              selection
                .filter((indi) => {
                  if (searchTerm.length === 0) return indi;
                  const fullName = `${indi.firstName} ${indi.lastName}`;
                  let check = true;
                  for (let i = 0; i < searchTerm.length; i++) {
                    if (fullName[i] !== searchTerm[i]) check = false;
                  }
                  if (fullName.toLowerCase().includes(searchTerm.toLowerCase())) check = true;
                  return searchTerm && check;
                })
                .map((indi) => (
                  <div onClick={() => handleSelect(indi)} key={indi._id} tabIndex={-1}>
                    {`${indi.firstName} ${indi.lastName}`}
                  </div>
                ))}
          </div>
        </div>
      </>
    );
  }
);

IndividualInput.displayName = "IndividualInput";
export default IndividualInput;
