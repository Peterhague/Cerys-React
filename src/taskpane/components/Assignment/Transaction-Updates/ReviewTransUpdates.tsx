import * as React from "react";
import { useState } from "react";
import CerysButton from "../../CerysButton";
import { convertExcelDate, convertMongoDate, convertValueToString } from "../../../utils.ts/helperFunctions";
import { submitTransactionUpdates } from "../../../utils.ts/worksheet-editing";

interface reviewTransUpdatesProps {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const ReviewTransUpdates: React.FC<reviewTransUpdatesProps> = ({ handleView, session }: reviewTransUpdatesProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  session["updatedTransactions"].sort((a, b) => {
    return a.rowNumber - b.rowNumber;
  });

  const updatedTransactions = session["updatedTransactions"];

  const handlePrevious = () => {
    setActiveIndex(activeIndex - 2);
  };

  const handleNext = () => {
    setActiveIndex(activeIndex + 2);
  };

  const handleSubmit = async () => {
    await submitTransactionUpdates(session);
  };

  return (
    <>
      <table>
        <tbody>
          <tr>
            <td>Date</td>
            <td>{convertMongoDate(updatedTransactions[activeIndex].date)}</td>
          </tr>
          {updatedTransactions[activeIndex].updatedDate && (
            <tr>
              <td>Updated Date</td>
              <td>{convertMongoDate(convertExcelDate(updatedTransactions[activeIndex].updatedDate))}</td>
            </tr>
          )}
          <tr>
            <td>Narrative</td>
            <td>{updatedTransactions[activeIndex].narrative}</td>
          </tr>
          {updatedTransactions[activeIndex].updatedNarrative && (
            <tr>
              <td>Updated Narrative</td>
              <td>{updatedTransactions[activeIndex].updatedNarrative}</td>
            </tr>
          )}
          <tr>
            <td>Value</td>
            <td>
              {updatedTransactions[activeIndex].value > 0
                ? `${convertValueToString(updatedTransactions[activeIndex].value)} DR`
                : `${convertValueToString(updatedTransactions[activeIndex].value)} CR`}
            </td>
          </tr>
          <tr>
            <td>Nominal code</td>
            {updatedTransactions[activeIndex].updatedCode && (
              <td>
                {updatedTransactions[activeIndex].code} {"=> "}
                {updatedTransactions[activeIndex].updatedCode}
              </td>
            )}
            {!updatedTransactions[activeIndex].updatedCode && <td>{updatedTransactions[activeIndex].code}</td>}
          </tr>
        </tbody>
      </table>
      {updatedTransactions.length > activeIndex + 1 && (
        <table>
          <tbody>
            <tr>
              <td>Date</td>
              <td>{convertMongoDate(updatedTransactions[activeIndex + 1].date)}</td>
            </tr>
            {updatedTransactions[activeIndex + 1].updatedDate && (
              <tr>
                <td>Updated Date</td>
                <td>{convertMongoDate(convertExcelDate(updatedTransactions[activeIndex + 1].updatedDate))}</td>
              </tr>
            )}
            <tr>
              <td>Narrative</td>
              <td>{updatedTransactions[activeIndex + 1].narrative}</td>
            </tr>
            {updatedTransactions[activeIndex + 1].updatedNarrative && (
              <tr>
                <td>Updated Narrative</td>
                <td>{updatedTransactions[activeIndex + 1].updatedNarrative}</td>
              </tr>
            )}
            <tr>
              <td>Value</td>
              <td>
                {updatedTransactions[activeIndex + 1].value > 0
                  ? `${convertValueToString(updatedTransactions[activeIndex + 1].value)} DR`
                  : `${convertValueToString(updatedTransactions[activeIndex + 1].value)} CR`}
              </td>
            </tr>
            <tr>
              <td>Nominal code</td>
              {updatedTransactions[activeIndex + 1].updatedCode && (
                <td>
                  {updatedTransactions[activeIndex + 1].code} {"=> "}
                  {updatedTransactions[activeIndex + 1].updatedCode}
                </td>
              )}
              {!updatedTransactions[activeIndex + 1].updatedCode && (
                <td>{updatedTransactions[activeIndex + 1].code}</td>
              )}
            </tr>
          </tbody>
        </table>
      )}

      {(updatedTransactions.length > activeIndex + 2 || activeIndex > 0) && (
        <div>
          {activeIndex > 0 && <button onClick={() => handlePrevious()}>Previous</button>}
          {updatedTransactions.length > activeIndex + 2 && <button onClick={() => handleNext()}>Next</button>}
        </div>
      )}
      <div>
        <button onClick={() => handleSubmit()}>Submit changes</button>
        <button onClick={() => handleView("handleTransUpdates")}>Go back</button>
      </div>

      <CerysButton buttonText={"ASSIGNMENT HOME"} handleView={() => handleView("assignmentDashHome")} />
    </>
  );
};

export default ReviewTransUpdates;
