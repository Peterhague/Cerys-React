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
import HandleTransUpdates from "./Assignment/Transaction-Updates/HandleTransUpdates";
import ReviewTransUpdates from "./Assignment/Transaction-Updates/ReviewTransUpdates";
import Footer from "./Footer";
import DeleteSheetPrompt from "./Assignment/Transaction-Updates/DeleteSheetPrompt";
import AddCorpClientDepnIP from "./Add Client/Add Corporate Client/AddCorpClientDepnIP";
import ManageAssignmentDashHome from "./Assignment/Assignment-Management/ManageAssignmentDashHome";
import UserConfirmPrompt from "./Utils/UserConfirmPrompt";
import MapUnmappedCodes from "./Assignment/MapUnmappedCodes";
import NomCodeSelection from "./Assignment/Utils/NomCodeSelection";
import { Session } from "../classes/session";
import PromptAssetRegisterCreation from "./Assignment/Asset-Registers/PromptAssetRegisterCreation";
import { BLANK_VIEW_OPTIONS } from "../static-values/view-options";
import ReviewCustomMappedTrans from "./Assignment/Transaction-Updates/ReviewCustomMappedTrans";

interface AppBodyProps {
  session: Session;
}

const AppBody = ({ session }: AppBodyProps) => {
  const [view, setView] = useState<string>("landingPage");
  const [editButton, setEditButton] = useState("off");
  const [options, setOptions] = useState(BLANK_VIEW_OPTIONS);

  console.log(session);

  const handleView = (view) => {
    session.currentView = view;
    setView(view);
  };

  const handleDynamicView = (view, options) => {
    setOptions(options);
    session.currentView = view;
    setView(view);
  };

  const bodyView = () => {
    let body;
    let footer = (
      <Footer handleView={handleView} setEditButton={setEditButton} editButton={editButton} session={session} />
    );
    switch (view) {
      case "landingPage":
        body = <LandingPage handleView={handleView} session={session} />;
        footer = null;
        break;
      case "userLogin":
        body = (
          <UserLogin
            handleView={handleView}
            handleDynamicView={handleDynamicView}
            session={session}
            setEditButton={setEditButton}
          />
        );
        footer = null;
        break;
      case "userDashHome":
        body = <UserDashHome handleView={handleView} />;
        session.nextView = view;
        break;
      case "customerLogin":
        body = (
          <CustomerLogin
            handleView={handleView}
            handleDynamicView={handleDynamicView}
            session={session}
            setEditButton={setEditButton}
          />
        );
        footer = null;
        break;
      case "customerSignUp":
        body = <CustomerSignUp handleView={handleView} session={session} />;
        footer = null;
        break;
      case "customerSignUpDtls":
        body = <CustomerSignUpDtls handleView={handleView} session={session} />;
        break;
      case "customerSignUpPlan":
        body = <CustomerSignUpPlan handleView={handleView} session={session} />;
        break;
      case "newCustomerLanding":
        body = <NewCustomerLanding handleView={handleView} session={session} />;
        break;
      case "addUser":
        body = <AddUser handleView={handleView} session={session} />;
        break;
      case "customerDashHome":
        body = <CustomerDashHome handleView={handleView} session={session} />;
        session.nextView = view;
        break;
      case "manageAssignmentDashHome":
        body = <ManageAssignmentDashHome handleView={handleView} session={session} />;
        session.nextView = view;
        break;
      case "nomCodeSelection":
        body = <NomCodeSelection handleView={handleView} session={session} chart={session.chart} />;
        break;
      case "clientNomCodeSelection":
        body = <NomCodeSelection handleView={handleView} session={session} chart={session.clientChart} />;
        break;
      case "userConfirmPrompt":
        body = <UserConfirmPrompt handleView={handleView} session={session} options={options} />;
        break;
      case "customerClientsHome":
        body = <CustomerClientsHome handleView={handleView} session={session} />;
        break;
      case "addClientHome":
        body = <AddClientHome handleView={handleView} session={session} />;
        break;
      case "addCorpClientDtls":
        body = <AddCorpClientDtls handleView={handleView} session={session} />;
        break;
      case "addCorpClientShares":
        body = <AddCorpClientShares handleView={handleView} session={session} />;
        break;
      case "addCorpClientOptions":
        body = <AddCorpClientOptions handleView={handleView} session={session} />;
        break;
      case "addCorpClientIndisHome":
        body = <AddCorpClientIndisHome handleView={handleView} session={session} />;
        break;
      case "addCorpClientIndiNew":
        body = <AddCorpClientIndiNew handleView={handleView} session={session} />;
        break;
      case "addCorpClientDirsHome":
        body = <AddCorpClientDirsHome handleView={handleView} session={session} />;
        break;
      case "addCorpClientDirNew":
        body = <AddCorpClientDirNew handleView={handleView} session={session} />;
        break;
      case "addCorpClientSHHome":
        body = <AddCorpClientSHHome handleView={handleView} session={session} />;
        break;
      case "addCorpClientSHNew":
        body = <AddCorpClientSHNew handleView={handleView} session={session} />;
        break;
      case "addCorpClientAmort":
        body = <AddCorpClientAmort handleView={handleView} session={session} />;
        break;
      case "addCorpClientDepn":
        body = <AddCorpClientDepn handleView={handleView} session={session} />;
        break;
      case "addCorpClientDepnIP":
        body = <AddCorpClientDepnIP handleView={handleView} session={session} />;
        break;
      case "addIndiClientDtls":
        body = <AddIndiClientDtls handleView={handleView} session={session} />;
        break;
      case "addIndiClientAssocOptions":
        body = <AddIndiClientAssocOptions handleView={handleView} session={session} />;
        break;
      case "addIndiClientAssocDir":
        body = <AddIndiClientAssocDir handleView={handleView} session={session} />;
        break;
      case "addIndiClientAssocSH":
        body = <AddIndiClientAssocSH handleView={handleView} session={session} />;
        break;
      case "customerIndisHome":
        body = <CustomerIndisHome handleView={handleView} session={session} />;
        break;
      case "addIndiDtls":
        body = <AddIndiDtls handleView={handleView} session={session} />;
        break;
      case "userAssignmentsHome":
        body = <UserAssignmentsHome handleView={handleView} session={session} />;
        break;
      case "newAssignmentDtls":
        body = <NewAssignmentDtls handleView={handleView} session={session} />;
        break;
      case "assignmentDashHome":
        body = <AssignmentDashHome handleView={handleView} session={session} />;
        session.nextView = view;
        break;
      case "enterClientDataHome":
        body = <EnterClientDataHome handleView={handleView} session={session} />;
        session.nextView = view;
        break;
      case "enterJournal":
        body = <EnterJournal handleView={handleView} session={session} chart={session.chart} />;
        break;
      case "promptAssetRegisterCreation":
        body = <PromptAssetRegisterCreation handleView={handleView} session={session} options={options} />;
        break;
      case "handleTransUpdates":
        body = <HandleTransUpdates handleView={handleView} session={session} />;
        break;
      case "reviewTransUpdates":
        body = <ReviewTransUpdates handleView={handleView} session={session} />;
        break;
      case "reviewCustomMappedTrans":
        body = <ReviewCustomMappedTrans handleView={handleView} session={session} options={options} />;
        break;
      case "deleteSheetPrompt":
        body = <DeleteSheetPrompt handleView={handleView} session={session} />;
        break;
      case "mapUnmappedCodes":
        body = <MapUnmappedCodes handleView={handleView} session={session} />;
        break;
      default:
        body = <LandingPage handleView={handleView} session={session} />;
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
