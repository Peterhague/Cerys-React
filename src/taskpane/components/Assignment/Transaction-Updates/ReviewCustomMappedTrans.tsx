import * as React from "react";
import { useState } from "react";
import CerysButton from "../../CerysButton";
import { Session } from "../../../classes/session";
import { ViewOptions } from "../../../interfaces/interfaces";
import {
  updateCerysCodeMappingIgnoreCustom,
  updateCerysCodeMappingIncludeCustom,
  updateCerysCodeMappingIncludeCustomAsSelected,
} from "../../../assignment/assignment-management/opening-balance-adjustments";

interface ReviewCustomMappedTransProps {
  handleView: (view) => void;
  session: Session;
  options: ViewOptions;
}

const ReviewCustomMappedTrans = ({ session, options }: ReviewCustomMappedTransProps) => {
  const [view, setView] = useState("main");
  const cerysCode = options.cerysCode;
  const remappedTransactions = session.assignment.transactions.filter(
    (tran) => tran.cerysCode === cerysCode && tran.clientMappingOverridden
  );
  const [proxyTranObjs, setProxyTranObjs] = useState(
    remappedTransactions.map((tran) => {
      const proxyOboj: { transactionId: string; narrative: string; included: boolean } = {
        transactionId: tran._id,
        narrative: tran.narrative,
        included: false,
      };
      return proxyOboj;
    })
  );
  const wsName = options.wsName;
  const nominalCode =
    typeof options.nominalCode === "string" || typeof options.nominalCode === "number" ? options.nominalCode : "";
  const nominalCodeName = typeof options.nominalCodeName === "string" ? options.nominalCodeName : "";

  const handleIgnoreAll = () => {
    updateCerysCodeMappingIgnoreCustom(session, nominalCode, nominalCodeName, cerysCode, wsName);
  };

  const handleIncludeAll = () => {
    updateCerysCodeMappingIncludeCustom(session, nominalCode, nominalCodeName, cerysCode, wsName);
  };

  const handleIncludeAsSelected = () => {
    const objsToUpdate = proxyTranObjs.filter((obj) => obj.included);
    updateCerysCodeMappingIncludeCustomAsSelected(
      session,
      nominalCode,
      nominalCodeName,
      cerysCode,
      wsName,
      objsToUpdate
    );
  };

  const handleTranChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    tran: { transactionId: string; narrative: string; included: boolean }
  ) => {
    proxyTranObjs.find((obj) => obj.transactionId === tran.transactionId).included = e.target.checked;
    const newArr = proxyTranObjs.map((obj) => obj);
    setProxyTranObjs(newArr);
  };

  const handleSelectAll = (arg: boolean) => {
    const newArr = proxyTranObjs.map((obj) => {
      obj.included = arg;
      return obj;
    });
    setProxyTranObjs(newArr);
  };

  return (
    <>
      {view === "main" && (
        <>
          <CerysButton buttonText={"VIEW TRANSACTIONS"} handleClick={() => setView("transactions")} />
          <CerysButton buttonText={"APPLY TO ALL"} handleClick={() => handleIncludeAll()} />
          <CerysButton buttonText={"IGNORE THESE TRANSACTIONS"} handleClick={() => handleIgnoreAll()} />
        </>
      )}
      {view === "transactions" && (
        <>
          <table>
            <thead>
              <tr>
                <th>Narrative</th>
                <th>Include</th>
              </tr>
            </thead>
            <tbody>
              {proxyTranObjs.map((tran, activeIndex) => (
                <tr key={tran.transactionId}>
                  <td>{tran.narrative}</td>
                  <td>
                    <input
                      name={`transaction${activeIndex}`}
                      type="checkbox"
                      id={`transaction${activeIndex}`}
                      checked={tran.included}
                      onChange={(e) => handleTranChange(e, tran)}
                    ></input>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" onClick={() => handleSelectAll(true)}>
            Include all
          </button>
          <button type="button" onClick={() => handleSelectAll(false)}>
            Ignore all
          </button>
          <button type="button" onClick={handleIncludeAsSelected}>
            Submit now
          </button>
          <CerysButton buttonText={"GO BACK"} handleClick={() => setView("main")} />
        </>
      )}
    </>
  );
};

export default ReviewCustomMappedTrans;
