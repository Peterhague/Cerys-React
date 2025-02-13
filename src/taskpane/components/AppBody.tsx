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
import OpeningBalanceAdjustments from "./Assignment/Assignment-Management/OpeningBalanceAdjustments";
import {
  ADD_CLIENT_HOME,
  ADD_COPR_CLIENT_SHAREHOLDER_NEW,
  ADD_CORP_CLIENT_AMORTISATION,
  ADD_CORP_CLIENT_DEPRECIATION,
  ADD_CORP_CLIENT_DEPRECIATION_INV_PROP,
  ADD_CORP_CLIENT_DETAILS,
  ADD_CORP_CLIENT_DIR_NEW,
  ADD_CORP_CLIENT_DIRS_HOME,
  ADD_CORP_CLIENT_INDIS,
  ADD_CORP_CLIENT_OPTIONS,
  ADD_CORP_CLIENT_SHAREHOLDERS_HOME,
  ADD_CORP_CLIENT_SHARES,
  ADD_INDI_CLIENT_ASSOC_DIR,
  ADD_INDI_CLIENT_ASSOC_OPTIONS,
  ADD_INDI_CLIENT_ASSOC_SHAREHOLDER,
  ADD_INDI_CLIENT_DETAILS,
  ADD_INDI_DETAILS,
  ADD_USER,
  ASSIGNMENT_DASH_HOME,
  CLIENT_NOM_CODE_SELECTION,
  CUSTOMER_CLIENTS_HOME,
  CUSTOMER_DASH_HOME,
  CUSTOMER_INDIS_HOME,
  CUSTOMER_LOGIN,
  CUSTOMER_SIGN_UP,
  CUSTOMER_SIGN_UP_DETAILS,
  CUSTOMER_SIGN_UP_PLAN,
  DELETE_SHEET_PROMPT,
  ENTER_CLIENT_DATA_HOME,
  ENTER_JOURNAL,
  HANDLE_TRANS_UPDATES,
  INTRAY_DETAILS,
  INTRAY_NESTED_SUMMARY,
  INTRAY_SUMMARY,
  LANDING_PAGE,
  MANAGE_ASSIGNMENT_DASH_HOME,
  MAP_UNMAPPED_CODES,
  NEW_ASSIGNMENT_DETAILS,
  NEW_CUSTOMER_LANDING,
  NOM_CODE_SELECTION,
  OPENING_BALANCE_ADJUSTMENTS,
  PROMPT_ASSET_REGISTER_CREATION,
  REVIEW_CUSTOM_MAPPED_TRANS,
  REVIEW_TRANS_UPDATES,
  USER_ASSIGNMENTS_HOME,
  USER_CONFIRM_PROMPT,
  USER_DASH_HOME,
  USER_LOGIN,
} from "../static-values/views";
import AddCorpClientIndis from "./Add Client/Add Corporate Client/AddCorpClientIndis";
import { GlobalInterfaces } from "../interfaces/interfaces";
import { ViewOptions } from "../classes/view-options";
import { InTray, InTrayAndItem, InTrayAndParentInTray } from "../classes/in-trays/global";
import IntrayNestedSummary from "./Assignment/Intray/InTrayNestedSummary";
import IntraySummary from "./Assignment/Intray/InTraySummary";
import IntrayDetails from "./Assignment/Intray/InTrayDetails";

interface AppBodyProps {
  session: Session;
}

const AppBody = ({ session }: AppBodyProps) => {
  const [view, setView] = useState<string>("landingPage");
  const [editButton, setEditButton] = useState("off");
  const [options, setOptions] = useState<GlobalInterfaces["viewOptions"]>(BLANK_VIEW_OPTIONS);

  const handleView = (view: string) => {
    session.currentView = view;
    setView(view);
  };

  const handleDynamicView = (view: string, options: GlobalInterfaces["viewOptions"]) => {
    setOptions(options);
    session.currentView = view;
    setView(view);
  };

  const bodyView = () => {
    let body: React.JSX.Element;
    let footer = (
      <Footer handleView={handleView} setEditButton={setEditButton} editButton={editButton} session={session} />
    );
    switch (view) {
      case LANDING_PAGE:
        body = <LandingPage handleView={handleView} session={session} />;
        footer = null;
        break;
      case USER_LOGIN:
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
      case USER_DASH_HOME:
        body = <UserDashHome handleView={handleView} />;
        session.nextView = view;
        break;
      case CUSTOMER_LOGIN:
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
      case CUSTOMER_SIGN_UP:
        body = <CustomerSignUp handleView={handleView} session={session} />;
        footer = null;
        break;
      case CUSTOMER_SIGN_UP_DETAILS:
        body = <CustomerSignUpDtls handleView={handleView} session={session} />;
        break;
      case CUSTOMER_SIGN_UP_PLAN:
        body = <CustomerSignUpPlan handleView={handleView} session={session} />;
        break;
      case NEW_CUSTOMER_LANDING:
        body = <NewCustomerLanding handleView={handleView} session={session} />;
        break;
      case ADD_USER:
        body = <AddUser handleView={handleView} session={session} />;
        break;
      case CUSTOMER_DASH_HOME:
        body = <CustomerDashHome handleView={handleView} session={session} />;
        session.nextView = view;
        break;
      case MANAGE_ASSIGNMENT_DASH_HOME:
        body = <ManageAssignmentDashHome handleView={handleView} session={session} />;
        session.nextView = view;
        break;
      case INTRAY_SUMMARY:
        if (options instanceof InTray)
          body = <IntraySummary handleView={handleView} session={session} intray={options} />;
        break;
      case INTRAY_NESTED_SUMMARY:
        if (options instanceof InTrayAndParentInTray)
          body = <IntrayNestedSummary handleView={handleView} session={session} inTrayAndParentInTray={options} />;
        break;
      case INTRAY_DETAILS:
        if (options instanceof InTrayAndItem)
          body = <IntrayDetails handleView={handleView} session={session} options={options} />;
        break;
      case OPENING_BALANCE_ADJUSTMENTS:
        body = <OpeningBalanceAdjustments handleView={handleView} session={session} />;
        session.nextView = view;
        break;
      case NOM_CODE_SELECTION:
        body = <NomCodeSelection handleView={handleView} session={session} chart={session.chart} />;
        break;
      case CLIENT_NOM_CODE_SELECTION:
        body = <NomCodeSelection handleView={handleView} session={session} chart={session.clientChart} />;
        break;
      case USER_CONFIRM_PROMPT:
        if (options instanceof ViewOptions)
          body = <UserConfirmPrompt handleView={handleView} session={session} options={options} />;
        break;
      case CUSTOMER_CLIENTS_HOME:
        body = <CustomerClientsHome handleView={handleView} session={session} />;
        break;
      case ADD_CLIENT_HOME:
        body = <AddClientHome handleView={handleView} session={session} />;
        break;
      case ADD_CORP_CLIENT_DETAILS:
        body = <AddCorpClientDtls handleView={handleView} session={session} />;
        break;
      case ADD_CORP_CLIENT_SHARES:
        body = <AddCorpClientShares handleView={handleView} session={session} />;
        break;
      case ADD_CORP_CLIENT_OPTIONS:
        body = <AddCorpClientOptions handleView={handleView} session={session} />;
        break;
      case ADD_CORP_CLIENT_INDIS:
        body = <AddCorpClientIndis handleView={handleView} session={session} />;
        break;
      case ADD_CORP_CLIENT_DIRS_HOME:
        body = <AddCorpClientDirsHome handleView={handleView} session={session} />;
        break;
      case ADD_CORP_CLIENT_DIR_NEW:
        body = <AddCorpClientDirNew handleView={handleView} session={session} />;
        break;
      case ADD_CORP_CLIENT_SHAREHOLDERS_HOME:
        body = <AddCorpClientSHHome handleView={handleView} session={session} />;
        break;
      case ADD_COPR_CLIENT_SHAREHOLDER_NEW:
        body = <AddCorpClientSHNew handleView={handleView} session={session} />;
        break;
      case ADD_CORP_CLIENT_AMORTISATION:
        body = <AddCorpClientAmort handleView={handleView} session={session} />;
        break;
      case ADD_CORP_CLIENT_DEPRECIATION:
        body = <AddCorpClientDepn handleView={handleView} session={session} />;
        break;
      case ADD_CORP_CLIENT_DEPRECIATION_INV_PROP:
        body = <AddCorpClientDepnIP handleView={handleView} session={session} />;
        break;
      case ADD_INDI_CLIENT_DETAILS:
        body = <AddIndiClientDtls handleView={handleView} session={session} />;
        break;
      case ADD_INDI_CLIENT_ASSOC_OPTIONS:
        body = <AddIndiClientAssocOptions handleView={handleView} session={session} />;
        break;
      case ADD_INDI_CLIENT_ASSOC_DIR:
        body = <AddIndiClientAssocDir handleView={handleView} session={session} />;
        break;
      case ADD_INDI_CLIENT_ASSOC_SHAREHOLDER:
        body = <AddIndiClientAssocSH handleView={handleView} session={session} />;
        break;
      case CUSTOMER_INDIS_HOME:
        body = <CustomerIndisHome handleView={handleView} session={session} />;
        break;
      case ADD_INDI_DETAILS:
        body = <AddIndiDtls handleView={handleView} session={session} />;
        break;
      case USER_ASSIGNMENTS_HOME:
        body = <UserAssignmentsHome handleView={handleView} session={session} />;
        break;
      case NEW_ASSIGNMENT_DETAILS:
        body = <NewAssignmentDtls handleView={handleView} session={session} />;
        break;
      case ASSIGNMENT_DASH_HOME:
        body = <AssignmentDashHome handleView={handleView} session={session} />;
        session.nextView = view;
        break;
      case ENTER_CLIENT_DATA_HOME:
        body = <EnterClientDataHome handleView={handleView} session={session} />;
        session.nextView = view;
        break;
      case ENTER_JOURNAL:
        body = <EnterJournal handleView={handleView} session={session} chart={session.chart} />;
        break;
      case PROMPT_ASSET_REGISTER_CREATION:
        if (options instanceof ViewOptions)
          body = <PromptAssetRegisterCreation handleView={handleView} session={session} options={options} />;
        break;
      case HANDLE_TRANS_UPDATES:
        body = <HandleTransUpdates handleView={handleView} session={session} />;
        break;
      case REVIEW_TRANS_UPDATES:
        body = <ReviewTransUpdates handleView={handleView} session={session} />;
        break;
      case REVIEW_CUSTOM_MAPPED_TRANS:
        if (options instanceof ViewOptions)
          body = <ReviewCustomMappedTrans handleView={handleView} session={session} options={options} />;
        break;
      case DELETE_SHEET_PROMPT:
        body = <DeleteSheetPrompt handleView={handleView} session={session} />;
        break;
      case MAP_UNMAPPED_CODES:
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
