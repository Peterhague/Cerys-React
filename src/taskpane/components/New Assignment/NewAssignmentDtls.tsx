import * as React from "react";
import { useState } from "react";
import CerysButton from "../CerysButton";
import { fetchOptionsNewAssignment } from "../../fetching/generateOptions";
import { assignmentUrl } from "../../fetching/apiEndpoints";
import { addPrimarySheets, postOpBalJnls } from "../../assignment/assignmentInit";
import { calculateDiffInDays } from "../../utils/helper-functions";
import { bFPrevPeriodMessage } from "../../utils/messages";
import { Session } from "../../classes/session";
import { Assignment, PreliminaryAssignment } from "../../classes/assignment";
import { ASSIGNMENT_DASH_HOME, LANDING_PAGE, USER_CONFIRM_PROMPT } from "../../static-values/views";
import { Customer } from "../../classes/customer";
import { Client } from "../../classes/client";
import { ClientCodeObject } from "../../classes/client-codes";
import { ClientCerysCodeObjectProps, ClientCodeObjectProps } from "../../interfaces/interfaces";
import { ClientCerysCodeObject } from "../../classes/cerys-codes";
import { AssetRegister } from "../../classes/asset-register";

interface newAssignmentDtlsProps {
  handleView: (view: string) => void;
  session: Session;
}

const NewAssignmentDtls = ({ handleView, session }: newAssignmentDtlsProps) => {
  const [view, setView] = useState("main");
  const [clientId, setClientId] = useState("");
  const [clientObject, setClientObject] = useState<Client>(null);
  const [assignmentType, setAssignmentType] = useState("");
  const [_senior, set_Senior] = useState("");
  const [_manager, set_Manager] = useState("");
  const [_responsibleIndividual, set_ResponsibleIndividual] = useState("");
  const [clientSoftware, setClientSoftware] = useState("");
  const [reportingDate, setReportingDate] = useState("");
  const [periodStartConverted, setPeriodStartConverted] = useState("");
  const [periodStart, setPeriodStart] = useState("");

  const date = new Date();
  const fullyear = date.getFullYear();

  const handleClientSelection = (clientId: string) => {
    setClientId(clientId);
    const clientObj = session.customer.clients.find((i) => i._id === clientId);
    setClientObject(clientObj);
    clientObj._senior ? set_Senior(clientObj._senior) : set_Senior("");
    clientObj._manager ? set_Manager(clientObj._manager) : set_Manager("");
    clientObj._responsibleIndividual
      ? set_ResponsibleIndividual(clientObj._responsibleIndividual)
      : set_ResponsibleIndividual("");
    clientObj.clientSoftware ? setClientSoftware(clientObj.clientSoftware) : setClientSoftware("");
    const dateEst = calculateDateEst(clientObj);
    clientObj.accRefDate ? handleReportingDate(dateEst, clientObj) : handleReportingDate("", clientObj);
  };

  const calculateDateEst = (clientObj: Client) => {
    if (clientObj.currentReportingPeriod) {
      const periodEnd = clientObj.currentReportingPeriod.periodEnd.split("T")[0].split("-");
      const currentYear = periodEnd[0];
      const nextYear = parseInt(currentYear) + 1;
      const iteratedPeriod = `${nextYear}-${periodEnd[1]}-${periodEnd[2]}`;
      return iteratedPeriod;
    } else {
      let dateEst = `${fullyear}${clientObj.accRefDate}`;
      const test = calculateDiffInDays(date, dateEst);
      if (test > 0) dateEst = `${fullyear - 1}${clientObj.accRefDate}`;
      const test2 = calculateDiffInDays(clientObj.incorpDate, dateEst);
      if (test2 < 0) dateEst = `${fullyear}${clientObj.accRefDate}`;
      return dateEst;
    }
  };

  const handleReportingDate = (date: string, clientObj: Client) => {
    setReportingDate(date);
    const dayOne = calculatePeriodStart(date, clientObj);
    const periodStartSplit = dayOne.split("/");
    const periodStartJS = `${periodStartSplit[2]}-${periodStartSplit[1]}-${periodStartSplit[0]}`;
    setPeriodStartConverted(dayOne);
    setPeriodStart(periodStartJS);
  };

  const calculatePeriodStart = (date: string, clientObj: Client) => {
    const dateSplit = date.split("-");
    const month = calculateMonth(dateSplit[1]);
    let prelimPeriodStart;
    if (month === "01") {
      prelimPeriodStart = `01/${month}/${parseInt(dateSplit[0])}`;
    } else {
      prelimPeriodStart = `01/${month}/${parseInt(dateSplit[0]) - 1}`;
    }
    const splitPeriodStart = prelimPeriodStart.split("/");
    const convertedPeriodStart = `${splitPeriodStart[2]}-${splitPeriodStart[1]}-${splitPeriodStart[0]}`;
    const test = calculateDiffInDays(clientObj.incorpDate, convertedPeriodStart);
    const incorpDateSplit = clientObj.incorpDate.split("T");
    const furtherSplit = incorpDateSplit[0].split("-");
    const incDateConverted = `${furtherSplit[2]}/${furtherSplit[1]}/${furtherSplit[0]}`;
    return test < 0 ? incDateConverted : prelimPeriodStart;
  };

  const calculateMonth = (month: string) => {
    let rawMonth = parseInt(month) + 1;
    if (rawMonth > 12) rawMonth = 1;
    return rawMonth < 10 ? `0${rawMonth}` : rawMonth;
  };

  const handleNext = (e: React.FormEvent) => {
    setView("confirm");
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const senior = session.customer.users.find((i) => i._id === _senior);
    const manager = session.customer.users.find((i) => i._id === _manager);
    const responsibleIndividual = session.customer.users.find((i) => i._id === _responsibleIndividual);
    const prelimAssignment = new PreliminaryAssignment({
      clientId: clientObject._id,
      clientCode: clientObject.clientCode,
      clientName: clientObject.clientName,
      assignmentType,
      senior,
      manager,
      responsibleIndividual,
      clientSoftware,
      reportingDate,
      periodStart,
      transactionsPosted: false,
    });
    const { customer, assignment, IFARegister, TFARegister, client, clientBFwdTB } =
      await processNewAssignment(prelimAssignment);
    session.customer = new Customer(customer);
    session.assignment = new Assignment(assignment);
    session.clientChart = client.clientChart.map((i: ClientCodeObjectProps) => new ClientCodeObject(i));
    session.IFARegister = IFARegister && new AssetRegister(session, IFARegister, "Intangible");
    session.TFARegister = TFARegister && new AssetRegister(session, TFARegister, "Tangible");
    session.clientBFwdTB = clientBFwdTB;
    addPrimarySheets(session);
    if (session.assignment.reportingPeriod.bFTB.length > 0) {
      const options = {
        handleYes: () => postOpBalJnls(session),
        handleNo: () => session.handleView(ASSIGNMENT_DASH_HOME),
        message: bFPrevPeriodMessage,
      };
      session.handleDynamicView(USER_CONFIRM_PROMPT, options);
    } else {
      handleView(ASSIGNMENT_DASH_HOME);
    }
  };

  const processNewAssignment = async (prelimAssignment: PreliminaryAssignment) => {
    const customerId = session.customer._id;
    const options = fetchOptionsNewAssignment(prelimAssignment, customerId);
    const updatedCustAndNewAssDb = await fetch(assignmentUrl, options);
    const updatedCustAndNewAss = await updatedCustAndNewAssDb.json();
    console.log(updatedCustAndNewAss);
    session.chart = updatedCustAndNewAss.chart.map((i: ClientCerysCodeObjectProps) => new ClientCerysCodeObject(i));
    return updatedCustAndNewAss;
  };

  return (
    <>
      <form id="addClientForm" action="">
        {view === "main" && (
          <>
            <h3>Enter Assignment Data</h3>
            <div>
              <label htmlFor="clientId">Select client</label>
              <select
                name="clientId"
                id="clientId"
                className="form-control"
                value={clientId}
                onChange={(e) => handleClientSelection(e.target.value)}
              >
                {!clientId && <option>Please select</option>}
                {session.customer.clients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.clientCode + " " + client.clientName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="assType">Job type</label>
              <select
                name="assType"
                id="assType"
                className="form-control"
                value={assignmentType}
                onChange={(e) => setAssignmentType(e.target.value)}
              >
                {!assignmentType && <option>Please select</option>}
                <option value="Annual accounts">Annual accounts</option>
                <option value="Management accounts">Management accounts</option>
              </select>
            </div>
            {session.customer.users.length > 0 && (
              <div>
                <label htmlFor="senior">Senior</label>
                <select
                  name="senior"
                  id="senior"
                  className="form-control"
                  value={_senior}
                  onChange={(e) => set_Senior(e.target.value)}
                >
                  {!_senior && <option>Please select</option>}
                  {session.customer.users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.firstName + " " + user.lastName}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {session.customer.users.length > 0 && (
              <div>
                <label htmlFor="manager">Manager</label>
                <select
                  name="manager"
                  id="manager"
                  className="form-control"
                  value={_manager}
                  onChange={(e) => set_Manager(e.target.value)}
                >
                  {!_manager && <option>Please select</option>}
                  {session.customer.users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.firstName + " " + user.lastName}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {session.customer.users.length > 0 && (
              <div>
                <label htmlFor="RI">Partner</label>
                <select
                  name="RI"
                  id="RI"
                  className="form-control"
                  value={_responsibleIndividual}
                  onChange={(e) => set_ResponsibleIndividual(e.target.value)}
                >
                  {!_responsibleIndividual && <option>Please select</option>}
                  {session.customer.users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.firstName + " " + user.lastName}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label htmlFor="clientSoftware">Client software</label>
              <select
                name="clientSoftware"
                id="clientSoftware"
                className="form-control"
                value={clientSoftware}
                onChange={(e) => setClientSoftware(e.target.value)}
              >
                {!clientSoftware && <option>Please select</option>}
                <option value="Sage Line 50">Sage Line 50</option>
                <option value="Xero">Xero</option>
                <option value="Quickbooks">Quickbooks</option>
                <option value="Kashflow">Kashflow</option>
                <option value="FreeAgent">FreeAgent</option>
              </select>
            </div>
            <div>
              <label htmlFor="reportingDate">Reporting date</label>
              <input
                name="reportingDate"
                type="date"
                id="reportingDate"
                className="form-control"
                placeholder=""
                value={reportingDate}
                onChange={(e) => handleReportingDate(e.target.value, clientObject)}
              ></input>
            </div>

            <div>
              <button onClick={handleNext} type="button">
                Next
              </button>
            </div>
          </>
        )}
        {view === "confirm" && (
          <>
            <div>
              <p>{periodStartConverted} will be entered as the first day of the accounting period. Is this correct?</p>
            </div>
            <div>
              <button onClick={handleSubmit} type="button">
                Yes
              </button>
              <button onClick={() => setView("nominate")} type="button">
                No
              </button>
            </div>
          </>
        )}
        {view === "nominate" && (
          <>
            <div>
              <p>Please nominate the first day of the accounting period</p>
            </div>
            <div>
              <input
                name="nominatedDay"
                type="date"
                id="nominatedDay"
                className="form-control"
                placeholder=""
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              ></input>
            </div>
            <div>
              <button onClick={handleSubmit} type="button">
                Confirm
              </button>
            </div>
          </>
        )}
      </form>
      <CerysButton buttonText={"Return"} handleClick={() => handleView(LANDING_PAGE)} />
    </>
  );
};

export default NewAssignmentDtls;
