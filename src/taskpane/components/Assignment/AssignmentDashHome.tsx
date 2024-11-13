import * as React from "react";
import CerysButton from "../CerysButton";

interface assignmentDashHomeProps {
  handleView: (view) => void;
  session: {};
}

const AssignmentDashHome: React.FC<assignmentDashHomeProps> = ({ handleView }: assignmentDashHomeProps) => {
  return (
    <>
      <CerysButton buttonText={"ENTER CLIENT DATA"} handleView={() => handleView("enterClientDataHome")} />
      <CerysButton buttonText={"EDIT ASSIGNMENT DATA"} handleView={() => handleView("customerIndisHome")} />
      <CerysButton buttonText={"ENTER JOURNAL"} handleView={() => handleView("enterJournal")} />
      <CerysButton buttonText={"ACCOUNTS & OTHER REPORTS"} handleView={() => handleView("customerSignUp")} />
      <CerysButton buttonText={"MANAGE ASSIGNMENT"} handleView={() => handleView("manageAssignmentDashHome")} />
      <CerysButton buttonText={"TAX"} handleView={() => handleView("customerSignUp")} />
      <CerysButton buttonText={"FIXED ASSET REGISTER"} handleView={() => handleView("userLogin")} />
      <CerysButton buttonText={"STATUTORY DATABASE"} handleView={() => handleView("customerSignUp")} />
      <CerysButton buttonText={"INDEX"} handleView={() => handleView("userLogin")} />
    </>
  );
};

export default AssignmentDashHome;
