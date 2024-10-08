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
  const activeJournal = session["activeJournal"];

  const handleSubmit = async () => {
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
              {activeJournal.journals[activeIndex].cerysCode} {"=>"}
              {activeJournal.journals[activeIndex + 1].cerysCode}
            </td>
          </tr>
        </tbody>
      </table>
      {activeJournal.journals.length && activeIndex + 2 && (
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
                {activeJournal.journals[activeIndex + 2].cerysCode} {"=>"}
                {activeJournal.journals[activeIndex + 3].cerysCode}
              </td>
            </tr>
          </tbody>
        </table>
      )}

      {(activeJournal.journals.length > activeIndex + 4 || activeIndex > 0) && (
        <div>
          {activeIndex > 0 && <button onClick={() => setActiveIndex(activeIndex - 4)}>Previous</button>}
          {activeJournal.journals.length > activeIndex + 4 && (
            <button onClick={() => setActiveIndex(activeIndex + 4)}>Next</button>
          )}
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
