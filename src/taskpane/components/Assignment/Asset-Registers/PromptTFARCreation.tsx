import * as React from "react";
import CerysButton from "../../CerysButton";

interface promptTFARCreationprops {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const PromptTFARCreation: React.FC<promptTFARCreationprops> = ({ handleView }: promptTFARCreationprops) => {
  return (
    <>
      <p>Your data suggests this client owns tangible fixed assets.</p>
      <p>You have not set up a relevant asset register.</p>
      <p>Would you like to create one automatically?</p>
      <CerysButton buttonText={"CREATE TFA REGISTER"} handleView={() => handleView("customerSignUp")} />
      <CerysButton buttonText={"CONTINUE POSTING JOURNALS"} handleView={() => handleView("userLogin")} />
      <CerysButton buttonText={"ASSIGNMENT HOME"} handleView={() => handleView("customerSignUp")} />
    </>
  );
};

export default PromptTFARCreation;
