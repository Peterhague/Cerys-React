import * as React from "react";
import CerysButton from "./CerysButton";

interface LandingPageProps {
  handleView: (view) => void;
}

const LandingPage: React.FC<LandingPageProps> = (props: LandingPageProps) => {
  return (
    <>
      <CerysButton buttonText={"Sign Up"} handleView={() => props.handleView("customerSignUp")} />
      <CerysButton buttonText={"Sign in as user"} handleView={() => props.handleView("userLogin")} />
      <CerysButton buttonText={"Sign in as customer"} handleView={() => props.handleView("customerLogin")} />
    </>
  );
};

export default LandingPage;
