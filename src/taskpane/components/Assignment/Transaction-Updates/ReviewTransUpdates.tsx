import * as React from "react";
import { useState } from "react";
import CerysButton from "../../CerysButton";
import { checkAssetRegStatus, processTransBatch } from "../../../utils.ts/transactions/transactions";
import { convertMongoDate, convertValueToString } from "../../../utils.ts/helperFunctions";

interface reviewTransUpdatesProps {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const ReviewTransUpdates: React.FC<reviewTransUpdatesProps> = ({ handleView, session }: reviewTransUpdatesProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  session["activeJournal"]["journals"].sort((a, b) => {
    return a.rowNumberIndex - b.rowNumberIndex;
  });

  const initNarratives = (transformer) => {
    const narr1 = initNarrOne(transformer);
    const narr2 = initNarrTwo(transformer);
    setNarrativeOne(narr1);
    setNarrativeTwo(narr2);
  };

  const initNarrOne = (transformer) => {
    if (transformer === "plus") {
      return activeJournal.journals[activeIndex + 4].narrative;
    } else if (transformer === "minus") {
      return activeJournal.journals[activeIndex - 4].narrative;
    } else {
      return activeJournal.journals[activeIndex].narrative;
    }
  };

  const initNarrTwo = (transformer) => {
    if (transformer === "plus") {
      return activeJournal.journals[activeIndex + 6] ? activeJournal.journals[activeIndex + 6].narrative : "";
    } else if (transformer === "minus") {
      return activeJournal.journals[activeIndex - 2].narrative;
    } else {
      return activeJournal.journals[activeIndex + 2] ? activeJournal.journals[activeIndex + 2].narrative : "";
    }
  };

  const activeJournal = session["activeJournal"];
  const [narrativeOne, setNarrativeOne] = useState(activeJournal.journals[activeIndex].narrative);
  const [narrativeTwo, setNarrativeTwo] = useState(() => initNarrTwo("neutral"));

  const onBlurNarrativeOne = () => {
    activeJournal.journals[activeIndex].narrative = narrativeOne;
    activeJournal.journals[activeIndex + 1].narrative = narrativeOne;
    console.log(activeJournal);
  };

  const onBlurNarrativeTwo = () => {
    activeJournal.journals[activeIndex + 2].narrative = narrativeTwo;
    activeJournal.journals[activeIndex + 3].narrative = narrativeTwo;
  };

  const handlePrevious = () => {
    activeJournal.journals[activeIndex].narrative = narrativeOne;
    activeJournal.journals[activeIndex + 1].narrative = narrativeOne;
    if (activeJournal.journals[activeIndex + 2]) {
      activeJournal.journals[activeIndex + 2].narrative = narrativeTwo;
      activeJournal.journals[activeIndex + 3].narrative = narrativeTwo;
    }
    setActiveIndex(activeIndex - 4);
    initNarratives("minus");
  };

  const handleNext = () => {
    activeJournal.journals[activeIndex].narrative = narrativeOne;
    activeJournal.journals[activeIndex + 1].narrative = narrativeOne;
    if (activeJournal.journals[activeIndex + 2]) {
      activeJournal.journals[activeIndex + 2].narrative = narrativeTwo;
      activeJournal.journals[activeIndex + 3].narrative = narrativeTwo;
    }
    setActiveIndex(activeIndex + 4);
    initNarratives("plus");
  };

  const handleSubmit = async () => {
    activeJournal.journals[activeIndex].narrative = narrativeOne;
    activeJournal.journals[activeIndex + 1].narrative = narrativeOne;
    if (activeJournal.journals[activeIndex + 2]) {
      activeJournal.journals[activeIndex + 2].narrative = narrativeTwo;
      activeJournal.journals[activeIndex + 3].narrative = narrativeTwo;
    }
    console.log(activeJournal);
    session["activeJournal"] = activeJournal;
    await processTransBatch(session);
    checkAssetRegStatus(session, handleView);
  };

  return (
    <>
      <table>
        <tbody>
          <tr>
            <td>Date</td>
            <td>{convertMongoDate(activeJournal.journals[activeIndex].transactionDate)}</td>
          </tr>
          <tr>
            <td>Narrative</td>
            <td>{activeJournal.journals[activeIndex].origNarrative}</td>
          </tr>
          <tr>
            <td>Narrative</td>
            <td>
              <input
                name="narrativeOne"
                type="text"
                id="narrativeOne"
                className="form-control"
                value={narrativeOne}
                onChange={(e) => setNarrativeOne(e.target.value)}
                onBlur={() => onBlurNarrativeOne()}
              ></input>
            </td>
          </tr>
          <tr>
            <td>Value</td>
            <td>
              {activeJournal.journals[activeIndex].value < 0
                ? `${convertValueToString(activeJournal.journals[activeIndex].value)} DR`
                : `${convertValueToString(activeJournal.journals[activeIndex].value)} CR`}
            </td>
          </tr>
          <tr>
            <td>Nominal code</td>
            <td>
              {activeJournal.journals[activeIndex].cerysCode} {"=> "}
              {activeJournal.journals[activeIndex + 1].cerysCode}
            </td>
          </tr>
        </tbody>
      </table>
      {activeJournal.journals.length > activeIndex + 2 && (
        <table>
          <tbody>
            <tr>
              <td>Date</td>
              <td>{convertMongoDate(activeJournal.journals[activeIndex + 2].transactionDate)}</td>
            </tr>
            <tr>
              <td>Narrative</td>
              <td>{activeJournal.journals[activeIndex + 2].origNarrative}</td>
            </tr>
            <tr>
              <td>Narrative</td>
              <td>
                <input
                  name="narrativeTwo"
                  type="text"
                  id="narrativeTwo"
                  className="form-control"
                  value={narrativeTwo}
                  onChange={(e) => setNarrativeTwo(e.target.value)}
                  onBlur={() => onBlurNarrativeTwo()}
                ></input>
              </td>
            </tr>
            <tr>
              <td>Value</td>
              <td>
                {activeJournal.journals[activeIndex + 2].value < 0
                  ? `${convertValueToString(activeJournal.journals[activeIndex + 2].value)} DR`
                  : `${convertValueToString(activeJournal.journals[activeIndex + 2].value)} CR`}
              </td>
            </tr>
            <tr>
              <td>Nominal code</td>
              <td>
                {activeJournal.journals[activeIndex + 2].cerysCode} {"=> "}
                {activeJournal.journals[activeIndex + 3].cerysCode}
              </td>
            </tr>
          </tbody>
        </table>
      )}

      {(activeJournal.journals.length > activeIndex + 4 || activeIndex > 0) && (
        <div>
          {activeIndex > 0 && <button onClick={() => handlePrevious()}>Previous</button>}
          {activeJournal.journals.length > activeIndex + 4 && <button onClick={() => handleNext()}>Next</button>}
        </div>
      )}
      <div>
        <button onClick={() => handleSubmit()}>Submit changes</button>
      </div>

      <CerysButton buttonText={"ASSIGNMENT HOME"} handleView={() => handleView("assignmentDashHome")} />
    </>
  );
};

export default ReviewTransUpdates;
