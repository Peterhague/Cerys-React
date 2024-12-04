import * as React from "react";
import CerysButton from "./CerysButton";
import { getExcelContext } from "../utils.ts/helperFunctions";

interface LandingPageProps {
  handleView: (view) => void;
  session: {};
}

const LandingPage: React.FC<LandingPageProps> = ({ session, handleView }: LandingPageProps) => {
  const handleClick = async (path) => {
    session["context"] = await getExcelContext();
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
