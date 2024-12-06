import * as React from "react";
import CerysButton from "../CerysButton";

interface assignmentDashHomeProps {
  handleView: (view) => void;
  session: {};
}

const AssignmentDashHome = ({ handleView }: assignmentDashHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"ENTER CLIENT DATA"} handleClick={() => handleView("enterClientDataHome")} />
      <CerysButton buttonText={"EDIT ASSIGNMENT DATA"} handleClick={() => handleView("customerIndisHome")} />
      <CerysButton buttonText={"ENTER JOURNAL"} handleClick={() => handleView("enterJournal")} />
      <CerysButton buttonText={"ACCOUNTS & OTHER REPORTS"} handleClick={() => handleView("customerSignUp")} />
      <CerysButton buttonText={"MANAGE ASSIGNMENT"} handleClick={() => handleView("manageAssignmentDashHome")} />
      <CerysButton buttonText={"TAX"} handleClick={() => handleView("customerSignUp")} />
      <CerysButton buttonText={"FIXED ASSET REGISTER"} handleClick={() => handleView("userLogin")} />
      <CerysButton buttonText={"STATUTORY DATABASE"} handleClick={() => handleView("customerSignUp")} />
      <CerysButton buttonText={"INDEX"} handleClick={() => handleView("userLogin")} />
    </>
  );
};

export default AssignmentDashHome;
