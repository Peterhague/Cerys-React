import * as React from "react";
import { useState } from "react";
import CerysButton from "./CerysButton";
import { fetchOptionsGetUser } from "../fetching/generateOptions";
import { getChartUrl } from "../fetching/apiEndpoints";
import { registerWorksheetDeletionHandler } from "../utils.ts/helperFunctions";

interface userLoginProps {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
  setEditButton: (state) => void;
}

const UserLogin: React.FC<userLoginProps> = ({ updateSession, handleView, session, setEditButton }: userLoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userDetails = { email, password };
    const options = fetchOptionsGetUser(userDetails);
    const userAndCustomerFromDb = await fetch("http://localhost:4000/api/user/get-user", options);
    if (userAndCustomerFromDb) await processUser(userAndCustomerFromDb);
  };

  const processUser = async (userAndCustomerFromDb) => {
    const chartDB = await fetch(getChartUrl);
    const chart = await chartDB.json();
    session["chart"] = chart;
    const userAndCustomerObject = await userAndCustomerFromDb.json();
    session["user"] = userAndCustomerObject.user;
    session["customer"] = userAndCustomerObject.customer;
    const activeJournal = { journals: [], netValue: 0, journalType: "journal", journal: true, clientTB: false };
    session["activeJournal"] = activeJournal;
    session["editableSheets"] = [];
    session["updatedTransactions"] = [];
    session["handleView"] = handleView;
    session["setEditButton"] = setEditButton;
    session["options"] = { IFARCreationSetting: "main", TFARCreationSetting: "main", allowDepnChgEdit: false };
    session["nextViewButOne"] = "";
    updateSession(session);
    await registerWorksheetDeletionHandler(session);
    handleView("userDashHome");
  };
  return (
    <>
      <form onSubmit={handleSubmit} id="login" action="">
        <h3>Sign in as user</h3>
        <div>
          <input
            name="email"
            type="email"
            id="login-email"
            className="form-control"
            placeholder="Enter your email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          ></input>
        </div>
        <div>
          <input
            name="password"
            type="password"
            id="login-password"
            className="form-control"
            placeholder="Enter your password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          ></input>
        </div>
        <div>
          <button type="submit">Next</button>
        </div>
      </form>
      <CerysButton buttonText={"Return"} handleView={() => handleView("landingPage")} />
    </>
  );
};

export default UserLogin;
