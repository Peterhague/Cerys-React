import * as React from "react";
import { useState } from "react";
import CerysButton from "./CerysButton";
import { fetchOptionsGetUser } from "../fetching/generateOptions";
import { registerWorksheetDeletionHandler, resetEdSheetCallBack } from "../utils.ts/helperFunctions";
import { createEditableCell } from "../classes/editable-cell";

interface userLoginProps {
  handleView: (view) => void;
  handleDynamicView: (view, props) => void;
  session: {};
  setEditButton: (state) => void;
}

const UserLogin = ({ handleView, handleDynamicView, session, setEditButton }: userLoginProps) => {
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
    const userAndCustomerObject = await userAndCustomerFromDb.json();
    session["user"] = userAndCustomerObject.user;
    session["customer"] = userAndCustomerObject.customer;
    console.log(session);
    const activeJournal = { journals: [], netValue: 0, journalType: "journal", journal: true, clientTB: false };
    session["activeJournal"] = activeJournal;
    session["newFATransactions"] = [];
    session["editableSheets"] = [];
    session["updatedTransactions"] = [];
    session["IFARegister"] = [];
    session["handleView"] = handleView;
    session["handleDynamicView"] = handleDynamicView;
    session["setEditButton"] = setEditButton;
    session["unmappedCodeObjects"] = [];
    session["arrowIndex"] = -1;
    session["activeEditableCell"] = createEditableCell(null, null, null);
    session["options"] = {
      IFARCreationSetting: "main",
      TFARCreationSetting: "main",
      IPRCreationSetting: "main",
      autoFillOverride: false,
      updatedTransactions: [],
      editableSheetCallback: resetEdSheetCallBack(),
      allowEffects: 0,
    };
    session["nextViewButOne"] = "";
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
      <CerysButton buttonText={"Return"} handleClick={() => handleView("landingPage")} />
    </>
  );
};

export default UserLogin;
