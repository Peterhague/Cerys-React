import * as React from "react";
import CerysButton from "../../CerysButton";

interface promptIFARCreationprops {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const PromptIFARCreation: React.FC<promptIFARCreationprops> = ({ handleView }: promptIFARCreationprops) => {
  return (
    <>
      <p>Your data suggests this client owns intangible fixed assets.</p>
      <p>You have not set up a relevant asset register.</p>
      <p>Would you like to create one automatically?</p>
      <CerysButton buttonText={"CREATE IFA REGISTER"} handleView={() => handleView("customerSignUp")} />
      <CerysButton buttonText={"CONTINUE POSTING JOURNALS"} handleView={() => handleView("userLogin")} />
      <CerysButton buttonText={"ASSIGNMENT HOME"} handleView={() => handleView("customerSignUp")} />
    </>
  );
};

export default PromptIFARCreation;
