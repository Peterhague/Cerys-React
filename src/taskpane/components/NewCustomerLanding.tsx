import * as React from "react";
import CerysButton from "./CerysButton";

interface newCustomerLandingProps {
  handleView: (view) => void;
  session: {};
}

const NewCustomerLanding: React.FC<newCustomerLandingProps> = ({ handleView, session }: newCustomerLandingProps) => {
  const unusedLicences = session["customer"]["unusedLicences"];
  return (
    <>
      <h4>Thank you for registering with Cerys</h4>
      {unusedLicences > 0 && <h4>You currently have {unusedLicences} unused licences</h4>}
      {unusedLicences > 0 && <CerysButton buttonText={"Add User"} handleView={() => handleView("addUser")} />}
      {session["newUserAccount"] && (
        <CerysButton buttonText={"Log in with this account"} handleView={() => handleView("userDashHome")} />
      )}
      <CerysButton buttonText={"Dashboard"} handleView={() => handleView("customerDashHome")} />
    </>
  );
};

export default NewCustomerLanding;
