import * as React from "react";
import CerysButton from "../../CerysButton";

interface promptIPRCreationprops {
  updateSession: (update) => void;
  handleView: (view) => void;
  session: {};
}

const PromptIPRCreation: React.FC<promptIPRCreationprops> = ({ handleView }: promptIPRCreationprops) => {
  return (
    <>
      <p>Your data suggests this client owns investment property.</p>
      <p>You have not set up a relevant asset register.</p>
      <p>Would you like to create one automatically?</p>
      <CerysButton buttonText={"CREATE IP REGISTER"} handleView={() => handleView("customerSignUp")} />
      <CerysButton buttonText={"CONTINUE POSTING JOURNALS"} handleView={() => handleView("userLogin")} />
      <CerysButton buttonText={"ASSIGNMENT HOME"} handleView={() => handleView("customerSignUp")} />
    </>
  );
};

export default PromptIPRCreation;
