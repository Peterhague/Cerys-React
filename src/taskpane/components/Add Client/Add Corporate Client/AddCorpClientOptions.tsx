import * as React from "react";
import CerysButton from "../../CerysButton";

interface addCorpClientOptionsProps {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const AddCorpClientOptions: React.FC<addCorpClientOptionsProps> = ({
  updateSession,
  handleView,
  session,
}: addCorpClientOptionsProps) => {
  const handleSubmission = () => {
    delete session["newClientPrelim"];
    updateSession(session);
    console.log(session);
    handleView("customerDashHome");
  };

  return (
    <>
      <CerysButton buttonText={"ADD ANOTHER CLASS"} handleView={() => handleView("addCorpClientShares")} />
      <CerysButton buttonText={"ENTER AMORTISATION POLICIES"} handleView={() => handleView("addCorpClientAmort")} />
      <CerysButton buttonText={"ENTER DEPRECIATION POLICIES"} handleView={() => handleView("addCorpClientDepn")} />
      <CerysButton buttonText={"ENTER VAT DETAILS"} handleView={() => handleView("addClientHome")} />
      <CerysButton buttonText={"ADD INDIVIDUALS"} handleView={() => handleView("addCorpClientIndisHome")} />
      <CerysButton buttonText={"Submit client now"} handleView={() => handleSubmission()} />
    </>
  );
};

export default AddCorpClientOptions;
