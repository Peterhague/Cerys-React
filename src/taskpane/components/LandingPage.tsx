import * as React from "react";
import CerysButton from "./CerysButton";

interface LandingPageProps {
  handleView: (view: string) => void;
}

const LandingPage = ({ handleView }: LandingPageProps) => {
  const handleClick = async (path: string) => {
    handleView(path);
  };

  return (
    <>
      <CerysButton buttonText={"Sign Up"} handleClick={() => handleClick("customerSignUp")} />
      <CerysButton buttonText={"Sign in as user"} handleClick={() => handleClick("userLogin")} />
      <CerysButton buttonText={"Sign in as customer"} handleClick={() => handleClick("customerLogin")} />
    </>
  );
};

export default LandingPage;
