import * as React from "react";
import { useState } from "react";
import CerysButton from "../../CerysButton";
import { Session } from "../../../classes/session";
import { ADD_CORP_CLIENT_SHARES, LANDING_PAGE } from "../../../static-values/views";
interface addCorpClientDtlsProps {
  handleView: (view: string) => void;
  session: Session;
}

const AddCorpClientDtls = ({ handleView, session }: addCorpClientDtlsProps) => {
  const [clientCode, setClientCode] = useState("");
  const [clientName, setClientName] = useState("");
  const [companyNumber, setCompanyNumber] = useState("");
  const [incorpDate, setIncorpDate] = useState("");
  const [accRefMonth, setAccRefMonth] = useState("");
  const [notMonthEnd, setNotMonthEnd] = useState(false);
  const [nominatedDay, setNominatedDay] = useState(0);
  const [_senior, set_Senior] = useState("");
  const [_manager, set_Manager] = useState("");
  const [_responsibleIndividual, set_ResponsibleIndividual] = useState("");
  const [clientSoftware, setClientSoftware] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newClientDtls = {
      clientCode,
      clientName,
      companyNumber,
      incorpDate,
      accRefMonth,
      accRefDate: generateAccRefDate(accRefMonth, nominatedDay),
      nominatedDay,
      _senior,
      _manager,
      _responsibleIndividual,
      clientSoftware,
      shareClasses: [],
      directors: [],
      shareholders: [],
      newIndividuals: [],
      existingIndividuals: [],
    };
    session.newClientPrelim = newClientDtls;
    handleView(ADD_CORP_CLIENT_SHARES);
  };

  const generateAccRefDate = (month, nominatedDay) => {
    switch (month) {
      case "January":
        return nominatedDay > 0 ? `-01-${nominatedDay}` : "-01-31";
      case "February":
        return nominatedDay > 0 ? `-02-${nominatedDay}` : "-02-28";
      case "March":
        return nominatedDay > 0 ? `-03-${nominatedDay}` : "-03-31";
      case "April":
        return nominatedDay > 0 ? `-04-${nominatedDay}` : "-04-30";
      case "May":
        return nominatedDay > 0 ? `-05-${nominatedDay}` : "-05-31";
      case "June":
        return nominatedDay > 0 ? `-06-${nominatedDay}` : "-06-30";
      case "July":
        return nominatedDay > 0 ? `-07-${nominatedDay}` : "-07-31";
      case "August":
        return nominatedDay > 0 ? `-08-${nominatedDay}` : "-08-31";
      case "September":
        return nominatedDay > 0 ? `-09-${nominatedDay}` : "-09-30";
      case "October":
        return nominatedDay > 0 ? `-10-${nominatedDay}` : "-10-31";
      case "November":
        return nominatedDay > 0 ? `-11-${nominatedDay}` : "-11-30";
      case "December":
        return nominatedDay > 0 ? `-12-${nominatedDay}` : "-12-31";
      default:
        return null;
    }
  };

  const shortMonths = ["February", "April", "June", "September", "November"];

  return (
    <>
      <form onSubmit={handleSubmit} id="addClientForm" action="">
        <h3>Add Client</h3>
        <div>
          <input
            name="clientCode"
            type="text"
            id="clientCode"
            className="form-control"
            placeholder="Enter client code..."
            value={clientCode}
            onChange={(e) => setClientCode(e.target.value)}
          ></input>
        </div>
        <div>
          <input
            name="clientName"
            type="text"
            id="clientName"
            className="form-control"
            placeholder="Enter client name..."
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          ></input>
        </div>
        <div>
          <input
            name="companyNumber"
            type="text"
            id="companyNumber"
            className="form-control"
            placeholder="Enter company number..."
            value={companyNumber}
            onChange={(e) => setCompanyNumber(e.target.value)}
          ></input>
        </div>
        <div>
          <label htmlFor="incorpDate">Incorporation date</label>
          <input
            type="date"
            id="incorpDate"
            name="incorpDate"
            value={incorpDate}
            onChange={(e) => setIncorpDate(e.target.value)}
          ></input>
        </div>
        <div>
          <select
            name="accRefMonth"
            id="accRefMonth"
            className="form-control"
            value={accRefMonth}
            onChange={(e) => setAccRefMonth(e.target.value)}
          >
            {!accRefMonth && <option>Please select</option>}
            <option key="January" value="January">
              January
            </option>
            <option key="February" value="February">
              February
            </option>
            <option key="March" value="March">
              March
            </option>
            <option key="April" value="April">
              April
            </option>
            <option key="May" value="May">
              May
            </option>
            <option key="June" value="June">
              June
            </option>
            <option key="July" value="July">
              July
            </option>
            <option key="August" value="August">
              August
            </option>
            <option key="September" value="September">
              September
            </option>
            <option key="October" value="October">
              October
            </option>
            <option key="November" value="November">
              November
            </option>
            <option key="December" value="December">
              December
            </option>
          </select>
        </div>
        <div>
          <label htmlFor="notMonthEnd">Reporting date not month end?</label>
          <input
            type="checkbox"
            id="notMonthEnd"
            name="notMonthEnd"
            checked={notMonthEnd}
            onChange={(e) => setNotMonthEnd(e.target.checked)}
          ></input>
        </div>
        {notMonthEnd && (
          <select
            name="nominatedDay"
            id="nominatedDay"
            className="form-control"
            value={nominatedDay}
            onChange={(e) => setNominatedDay(parseInt(e.target.value))}
          >
            {!nominatedDay && <option>Select reporting day</option>}
            <option key="1st" value="01">
              1st
            </option>
            <option key="2nd" value="02">
              2nd
            </option>
            <option key="3rd" value="03">
              3rd
            </option>
            <option key="4th" value="04">
              4th
            </option>
            <option key="5th" value="05">
              5th
            </option>
            <option key="6th" value="06">
              6th
            </option>
            <option key="7th" value="07">
              7th
            </option>
            <option key="8th" value="08">
              8th
            </option>
            <option key="9th" value="09">
              9th
            </option>
            <option key="10th" value="10">
              10th
            </option>
            <option key="11th" value="11">
              11th
            </option>
            <option key="12th" value="12">
              12th
            </option>
            <option key="13th" value="13">
              13th
            </option>
            <option key="14th" value="14">
              14th
            </option>
            <option key="15th" value="15">
              15th
            </option>
            <option key="16th" value="16">
              16th
            </option>
            <option key="17th" value="17">
              17th
            </option>
            <option key="18th" value="18">
              18th
            </option>
            <option key="19th" value="19">
              19th
            </option>
            <option key="20th" value="20">
              20th
            </option>
            <option key="21st" value="21">
              21st
            </option>
            <option key="22nd" value="22">
              22nd
            </option>
            <option key="23rd" value="23">
              23rd
            </option>
            <option key="24th" value="24">
              24th
            </option>
            <option key="25th" value="25">
              25th
            </option>
            <option key="26th" value="26">
              26th
            </option>
            <option key="27th" value="27">
              27th
            </option>
            {accRefMonth !== "February" && (
              <option key="28th" value="28">
                28th
              </option>
            )}
            {accRefMonth !== "February" && (
              <option key="29th" value="29">
                29th
              </option>
            )}
            {!shortMonths.includes(accRefMonth) && (
              <option key="30th" value="30">
                30th
              </option>
            )}
          </select>
        )}
        {session.customer.users.length > 0 && (
          <div>
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
          <label htmlFor="software">Client software</label>
          <select
            name="software"
            id="software"
            className="form-control"
            value={clientSoftware}
            onChange={(e) => setClientSoftware(e.target.value)}
          >
            {!clientSoftware && <option>Please select</option>}
            <option value="Sage Line 50">Sage Line 50</option>
            <option value="Sage One">Sage One</option>
            <option value="Xero">Xero</option>
            <option value="Quickbooks">Quickbooks</option>
            <option value="Kashflow">Kashflow</option>
            <option value="FreeAgent">FreeAgent</option>
          </select>
        </div>

        <div>
          <button type="submit">Add share classes</button>
        </div>
      </form>
      <CerysButton buttonText={"Return"} handleClick={() => handleView(LANDING_PAGE)} />
    </>
  );
};

export default AddCorpClientDtls;
