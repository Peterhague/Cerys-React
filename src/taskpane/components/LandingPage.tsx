import * as React from "react";
import CerysButton from "./CerysButton";
import { getExcelContext } from "../utils.ts/helperFunctions";

interface LandingPageProps {
  handleView: (view) => void;
  session: {};
}

const LandingPage: React.FC<LandingPageProps> = ({ handleView }: LandingPageProps) => {
  const handleClick = async (path) => {
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
