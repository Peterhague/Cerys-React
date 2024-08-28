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

const AppBody: React.FC = () => {
  const [session, setSession] = useState({});
  const [view, setView] = useState<string>("landingPage");

  console.log(session);

  const updateSession = (update) => {
    setSession(update);
  };

  const handleView = (view) => {
    setView(view);
  };

  const bodyView = () => {
    switch (view) {
      case "landingPage":
        return <LandingPage handleView={handleView} />;
      case "userLogin":
        return <UserLogin handleView={handleView} updateSession={updateSession} session={session} />;
      case "userDashHome":
        return <UserDashHome handleView={handleView} />;
      case "customerLogin":
        return <CustomerLogin handleView={handleView} updateSession={updateSession} session={session} />;
      case "customerSignUp":
        return <CustomerSignUp handleView={handleView} updateSession={updateSession} session={session} />;
      case "customerSignUpDtls":
        return <CustomerSignUpDtls handleView={handleView} updateSession={updateSession} session={session} />;
      case "customerSignUpPlan":
        return <CustomerSignUpPlan handleView={handleView} updateSession={updateSession} session={session} />;
      case "newCustomerLanding":
        return <NewCustomerLanding handleView={handleView} updateSession={updateSession} session={session} />;
      case "addUser":
        return <AddUser handleView={handleView} updateSession={updateSession} session={session} />;
      case "customerDashHome":
        return <CustomerDashHome handleView={handleView} updateSession={updateSession} session={session} />;
      case "customerClientsHome":
        return <CustomerClientsHome handleView={handleView} updateSession={updateSession} session={session} />;
      case "addClientHome":
        return <AddClientHome handleView={handleView} updateSession={updateSession} session={session} />;
      case "addCorpClientDtls":
        return <AddCorpClientDtls handleView={handleView} updateSession={updateSession} session={session} />;
      case "addCorpClientShares":
        return <AddCorpClientShares handleView={handleView} updateSession={updateSession} session={session} />;
      case "addCorpClientOptions":
        return <AddCorpClientOptions handleView={handleView} updateSession={updateSession} session={session} />;
      case "addCorpClientIndisHome":
        return <AddCorpClientIndisHome handleView={handleView} updateSession={updateSession} session={session} />;
      case "addCorpClientIndiNew":
        return <AddCorpClientIndiNew handleView={handleView} updateSession={updateSession} session={session} />;
      case "addCorpClientDirsHome":
        return <AddCorpClientDirsHome handleView={handleView} updateSession={updateSession} session={session} />;
      case "addCorpClientDirNew":
        return <AddCorpClientDirNew handleView={handleView} updateSession={updateSession} session={session} />;
      case "addCorpClientSHHome":
        return <AddCorpClientSHHome handleView={handleView} updateSession={updateSession} session={session} />;
      case "addCorpClientSHNew":
        return <AddCorpClientSHNew handleView={handleView} updateSession={updateSession} session={session} />;
      case "addCorpClientAmort":
        return <AddCorpClientAmort handleView={handleView} updateSession={updateSession} session={session} />;
      case "addCorpClientDepn":
        return <AddCorpClientDepn handleView={handleView} updateSession={updateSession} session={session} />;
      case "addIndiClientDtls":
        return <AddIndiClientDtls handleView={handleView} updateSession={updateSession} session={session} />;
      case "addIndiClientAssocOptions":
        return <AddIndiClientAssocOptions handleView={handleView} updateSession={updateSession} session={session} />;
      case "addIndiClientAssocDir":
        return <AddIndiClientAssocDir handleView={handleView} updateSession={updateSession} session={session} />;
      default:
        return <LandingPage handleView={handleView} />;
    }
  };

  return <> {bodyView()}</>;
};

export default AppBody;
