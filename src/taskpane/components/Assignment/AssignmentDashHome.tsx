import * as React from "react";
import CerysButton from "../CerysButton";

interface assignmentDashHomeProps {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const AssignmentDashHome: React.FC<assignmentDashHomeProps> = (props: assignmentDashHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"ENTER CLIENT DATA"} handleView={() => props.handleView("enterClientDataHome")} />
      <CerysButton buttonText={"EDIT ASSIGNMENT DATA"} handleView={() => props.handleView("customerIndisHome")} />
      <CerysButton buttonText={"ENTER JOURNAL"} handleView={() => props.handleView("enterJournal")} />
      <CerysButton buttonText={"ACCOUNTS & OTHER REPORTS"} handleView={() => props.handleView("customerSignUp")} />
      <CerysButton buttonText={"TAX"} handleView={() => props.handleView("customerSignUp")} />
      <CerysButton buttonText={"FIXED ASSET REGISTER"} handleView={() => props.handleView("userLogin")} />
      <CerysButton buttonText={"STATUTORY DATABASE"} handleView={() => props.handleView("customerSignUp")} />
      <CerysButton buttonText={"INDEX"} handleView={() => props.handleView("userLogin")} />
    </>
  );
};

export default AssignmentDashHome;
