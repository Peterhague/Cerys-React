import * as React from "react";
import { useState } from "react";
import LandingPage from "./LandingPage";
import UserLogin from "./UserLogin";
import CustomerLogin from "./CustomerLogin";
import CustomerSignUp from "./CustomerSignUp";
import UserDashHome from "./UserDashHome";
import CustomerSignUpDtls from "./CustomerSignUpDtls";
import CustomerSignUpPlan from "./CustomerSignUpPlan";
import NewCustomerLanding from "./NewCustomerLanding";
import AddUser from "./AddUser";
import CustomerDashHome from "./CustomerDashHome";
import CustomerClientsHome from "./CustomerClientsHome";
import AddClientHome from "./Add Client/AddClientHome";
import AddCorpClientDtls from "./Add Client/Add Corporate Client/AddCorpClientDtls";
import AddIndiClientDtls from "./Add Client/Add Individual Client/AddIndiClientDtls";
import AddCorpClientShares from "./Add Client/Add Corporate Client/AddCorpClientShares";
import AddCorpClientOptions from "./Add Client/Add Corporate Client/AddCorpClientOptions";
import AddCorpClientIndisHome from "./Add Client/Add Corporate Client/AddCorpClientIndisHome";
import AddCorpClientIndiNew from "./Add Client/Add Corporate Client/AddCorpClientIndiNew";
import AddCorpClientDirsHome from "./Add Client/Add Corporate Client/AddCorpClientDirsHome";
import AddCorpClientDirNew from "./Add Client/Add Corporate Client/AddCorpClientDirNew";
import AddCorpClientSHHome from "./Add Client/Add Corporate Client/AddCorpClientSHHome";
import AddCorpClientSHNew from "./Add Client/Add Corporate Client/AddCorpClientSHNew";
import AddCorpClientAmort from "./Add Client/Add Corporate Client/AddCorpClientAmort";
import AddCorpClientDepn from "./Add Client/Add Corporate Client/AddCorpClientDepn";
import AddIndiClientAssocOptions from "./Add Client/Add Individual Client/AddIndiClientAssocOptions";
import AddIndiClientAssocDir from "./Add Client/Add Individual Client/AddIndiClientAssocDir";
import AddIndiClientAssocSH from "./Add Client/Add Individual Client/AddIndiClientAssocSH";
import CustomerIndisHome from "./CustomerIndisHome";
import AddIndiDtls from "./Add Non-client Individual/AddIndiDtls";
import UserAssignmentsHome from "./UserAssignmentsHome";
import NewAssignmentDtls from "./New Assignment/NewAssignmentDtls";
import AssignmentDashHome from "./Assignment/AssignmentDashHome";
import EnterClientDataHome from "./Assignment/EnterClientDataHome";
import EnterJournal from "./Assignment/EnterJournal";
import PromptIFARCreation from "./Assignment/Asset-Registers/PromptIFARCreation";
import PromptTFARCreation from "./Assignment/Asset-Registers/PromptTFARCreation";
import PromptIPRCreation from "./Assignment/Asset-Registers/PromptIPRCreation";
import HandleTransUpdates from "./Assignment/Transaction-Updates/HandleTransUpdates";
import ReviewTransUpdates from "./Assignment/Transaction-Updates/ReviewTransUpdates";
import Footer from "./Footer";

const AppBody: React.FC = () => {
  const [session, setSession] = useState({});
  const [view, setView] = useState<string>("landingPage");
  const [editButton, setEditButton] = useState("off");

  console.log(session);

  const updateSession = (update) => {
    setSession(update);
  };

  const handleView = (view) => {
    session["currentView"] = view;
    setView(view);
  };

  const bodyView = () => {
    let body;
    let footer = (
      <Footer handleView={handleView} setEditButton={setEditButton} editButton={editButton} session={session} />
    );
    switch (view) {
      case "landingPage":
        body = <LandingPage handleView={handleView} />;
        footer = null;
        break;
      case "userLogin":
        body = (
          <UserLogin
            handleView={handleView}
            updateSession={updateSession}
            session={session}
            setEditButton={setEditButton}
          />
        );
        footer = null;
        break;
      case "userDashHome":
        body = <UserDashHome handleView={handleView} />;
        break;
      case "customerLogin":
        body = (
          <CustomerLogin
            handleView={handleView}
            updateSession={updateSession}
            session={session}
            setEditButton={setEditButton}
          />
        );
        footer = null;
        break;
      case "customerSignUp":
        body = <CustomerSignUp handleView={handleView} updateSession={updateSession} session={session} />;
        footer = null;
        break;
      case "customerSignUpDtls":
        body = <CustomerSignUpDtls handleView={handleView} updateSession={updateSession} session={session} />;
        break;
      case "customerSignUpPlan":
        body = <CustomerSignUpPlan handleView={handleView} updateSession={updateSession} session={session} />;
        break;
      case "newCustomerLanding":
        body = <NewCustomerLanding handleView={handleView} updateSession={updateSession} session={session} />;
        break;
      case "addUser":
        body = <AddUser handleView={handleView} updateSession={updateSession} session={session} />;
        break;
      case "customerDashHome":
        body = <CustomerDashHome handleView={handleView} updateSession={updateSession} session={session} />;
        break;
      case "customerClientsHome":
        body = <CustomerClientsHome handleView={handleView} updateSession={updateSession} session={session} />;
        break;
      case "addClientHome":
        body = <AddClientHome handleView={handleView} updateSession={updateSession} session={session} />;
        break;
      case "addCorpClientDtls":
        body = <AddCorpClientDtls handleView={handleView} updateSession={updateSession} session={session} />;
        break;
      case "addCorpClientShares":
        body = <AddCorpClientShares handleView={handleView} updateSession={updateSession} session={session} />;
        break;
      case "addCorpClientOptions":
        body = <AddCorpClientOptions handleView={handleView} updateSession={updateSession} session={session} />;
        break;
      case "addCorpClientIndisHome":
        body = <AddCorpClientIndisHome handleView={handleView} updateSession={updateSession} session={session} />;
        break;
      case "addCorpClientIndiNew":
        body = <AddCorpClientIndiNew handleView={handleView} updateSession={updateSession} session={session} />;
        break;
      case "addCorpClientDirsHome":
        body = <AddCorpClientDirsHome handleView={handleView} updateSession={updateSession} session={session} />;
        break;
      case "addCorpClientDirNew":
        body = <AddCorpClientDirNew handleView={handleView} updateSession={updateSession} session={session} />;
        break;
      case "addCorpClientSHHome":
        body = <AddCorpClientSHHome handleView={handleView} updateSession={updateSession} session={session} />;
        break;
      case "addCorpClientSHNew":
        body = <AddCorpClientSHNew handleView={handleView} updateSession={updateSession} session={session} />;
        break;
      case "addCorpClientAmort":
        body = <AddCorpClientAmort handleView={handleView} updateSession={updateSession} session={session} />;
        break;
      case "addCorpClientDepn":
        body = <AddCorpClientDepn handleView={handleView} updateSession={updateSession} session={session} />;
        break;
      case "addIndiClientDtls":
        body = <AddIndiClientDtls handleView={handleView} updateSession={updateSession} session={session} />;
        break;
      case "addIndiClientAssocOptions":
        body = <AddIndiClientAssocOptions handleView={handleView} updateSession={updateSession} session={session} />;
        break;
      case "addIndiClientAssocDir":
        body = <AddIndiClientAssocDir handleView={handleView} updateSession={updateSession} session={session} />;
        break;
      case "addIndiClientAssocSH":
        body = <AddIndiClientAssocSH handleView={handleView} updateSession={updateSession} session={session} />;
        break;
      case "customerIndisHome":
        body = <CustomerIndisHome handleView={handleView} updateSession={updateSession} session={session} />;
        break;
      case "addIndiDtls":
        body = <AddIndiDtls handleView={handleView} updateSession={updateSession} session={session} />;
        break;
      case "userAssignmentsHome":
        body = <UserAssignmentsHome handleView={handleView} updateSession={updateSession} session={session} />;
        break;
      case "newAssignmentDtls":
        body = <NewAssignmentDtls handleView={handleView} updateSession={updateSession} session={session} />;
        break;
      case "assignmentDashHome":
        body = <AssignmentDashHome handleView={handleView} updateSession={updateSession} session={session} />;
        break;
      case "enterClientDataHome":
        body = <EnterClientDataHome handleView={handleView} updateSession={updateSession} session={session} />;
        break;
      case "enterJournal":
        body = <EnterJournal handleView={handleView} updateSession={updateSession} session={session} />;
        break;
      case "promptIFARCreation":
        body = <PromptIFARCreation handleView={handleView} updateSession={updateSession} session={session} />;
        break;
      case "promptTFARCreation":
        body = <PromptTFARCreation handleView={handleView} updateSession={updateSession} session={session} />;
        break;
      case "promptIPRCreation":
        body = <PromptIPRCreation handleView={handleView} updateSession={updateSession} session={session} />;
        break;
      case "handleTransUpdates":
        body = <HandleTransUpdates handleView={handleView} updateSession={updateSession} session={session} />;
        break;
      case "reviewTransUpdates":
        body = <ReviewTransUpdates handleView={handleView} updateSession={updateSession} session={session} />;
        break;
      default:
        body = <LandingPage handleView={handleView} />;
    }
    return (
      <>
        <p>Header</p>
        {body}
        {footer && footer}
      </>
    );
  };

  return <> {bodyView()}</>;
};

export default AppBody;
