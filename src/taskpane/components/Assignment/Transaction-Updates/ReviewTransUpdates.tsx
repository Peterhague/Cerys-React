import * as React from "react";
import { useState } from "react";
import CerysButton from "../../CerysButton";
import {
  convertExcelDate,
  convertMongoDate,
  convertValueToString,
  getUpdatedCerysCode,
  getUpdatedClientCodeMapping,
  getUpdatedDate,
  getUpdatedNarrative,
  getUpdatedTransactions,
} from "../../../utils/helper-functions";
import { submitTransactionUpdates } from "../../../utils/transactions/transactions";
import { Session } from "../../../classes/session";
import { ASSIGNMENT_DASH_HOME, HANDLE_TRANS_UPDATES } from "../../../static-values/views";

interface reviewTransUpdatesProps {
  handleView: (view: string) => void;
  session: Session;
}

const ReviewTransUpdates = ({ handleView, session }: reviewTransUpdatesProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const updatedTransactions = getUpdatedTransactions(session);
  // updatedTransactions.sort((a, b) => {
  //   return a.rowNumber - b.rowNumber;
  // });

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
            <td>{convertMongoDate(convertExcelDate(updatedTransactions[activeIndex].transactionDateExcel))}</td>
          </tr>
          {getUpdatedDate(updatedTransactions[activeIndex]) && (
            <tr>
              <td>Updated Date</td>
              <td>{convertMongoDate(getUpdatedDate(updatedTransactions[activeIndex]).mongoDate)}</td>
            </tr>
          )}
          <tr>
            <td>Narrative</td>
            <td>{updatedTransactions[activeIndex].narrative}</td>
          </tr>
          {getUpdatedNarrative(updatedTransactions[activeIndex]) && (
            <tr>
              <td>Updated Narrative</td>
              <td>{getUpdatedNarrative(updatedTransactions[activeIndex])}</td>
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
            {getUpdatedCerysCode(updatedTransactions[activeIndex]) && (
              <td>
                {updatedTransactions[activeIndex].cerysCode} {"=> "}
                {getUpdatedCerysCode(updatedTransactions[activeIndex])}
              </td>
            )}
            {!getUpdatedCerysCode(updatedTransactions[activeIndex]) && (
              <td>{updatedTransactions[activeIndex].cerysCode}</td>
            )}
          </tr>
          <tr>
            <td>Client mapping</td>
            {getUpdatedClientCodeMapping(updatedTransactions[activeIndex]) && (
              <td>
                {updatedTransactions[activeIndex].getClientMappingObj(session).clientCode} {"=> "}
                {getUpdatedClientCodeMapping(updatedTransactions[activeIndex])}
              </td>
            )}
            {!getUpdatedClientCodeMapping(updatedTransactions[activeIndex]) && (
              <td>{updatedTransactions[activeIndex].getClientMappingObj(session).clientCode}</td>
            )}
          </tr>
        </tbody>
      </table>
      {updatedTransactions.length > activeIndex + 1 && (
        <table>
          <tbody>
            <tr>
              <td>Date</td>
              <td>{convertMongoDate(convertExcelDate(updatedTransactions[activeIndex + 1].transactionDateExcel))}</td>
            </tr>
            {getUpdatedDate(updatedTransactions[activeIndex + 1]) && (
              <tr>
                <td>Updated Date</td>
                <td>{convertMongoDate(getUpdatedDate(updatedTransactions[activeIndex + 1]).mongoDate)}</td>
              </tr>
            )}
            <tr>
              <td>Narrative</td>
              <td>{updatedTransactions[activeIndex + 1].narrative}</td>
            </tr>
            {getUpdatedNarrative(updatedTransactions[activeIndex + 1]) && (
              <tr>
                <td>Updated Narrative</td>
                <td>{getUpdatedNarrative(updatedTransactions[activeIndex + 1])}</td>
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
              {getUpdatedCerysCode(updatedTransactions[activeIndex + 1]) && (
                <td>
                  {updatedTransactions[activeIndex + 1].cerysCode} {"=> "}
                  {getUpdatedCerysCode(updatedTransactions[activeIndex + 1])}
                </td>
              )}
              {!getUpdatedCerysCode(updatedTransactions[activeIndex + 1]) && (
                <td>{updatedTransactions[activeIndex + 1].cerysCode}</td>
              )}
            </tr>
            <tr>
              <td>Client mapping</td>
              {getUpdatedClientCodeMapping(updatedTransactions[activeIndex + 1]) && (
                <td>
                  {updatedTransactions[activeIndex + 1].getClientMappingObj(session).clientCode} {"=> "}
                  {getUpdatedClientCodeMapping(updatedTransactions[activeIndex + 1])}
                </td>
              )}
              {!getUpdatedClientCodeMapping(updatedTransactions[activeIndex + 1]) && (
                <td>{updatedTransactions[activeIndex + 1].getClientMappingObj(session).clientCode}</td>
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
        <button onClick={() => handleView(HANDLE_TRANS_UPDATES)}>Go back</button>
      </div>

      <CerysButton buttonText={"ASSIGNMENT HOME"} handleClick={() => handleView(ASSIGNMENT_DASH_HOME)} />
    </>
  );
};

export default ReviewTransUpdates;
