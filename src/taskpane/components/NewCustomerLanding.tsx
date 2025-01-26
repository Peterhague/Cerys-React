import * as React from "react";
import CerysButton from "./CerysButton";
import { Session } from "../classes/session";
import { ADD_USER, CUSTOMER_DASH_HOME, USER_DASH_HOME } from "../static-values/views";

interface newCustomerLandingProps {
  handleView: (view: string) => void;
  session: Session;
}

const NewCustomerLanding = ({ handleView, session }: newCustomerLandingProps) => {
  const unusedLicences = session.customer.unusedLicences;
  return (
    <>
      <h4>Thank you for registering with Cerys</h4>
      {unusedLicences > 0 && <h4>You currently have {unusedLicences} unused licences</h4>}
      {unusedLicences > 0 && <CerysButton buttonText={"Add User"} handleClick={() => handleView(ADD_USER)} />}
      {session.newUserAccount && (
        <CerysButton buttonText={"Log in with this account"} handleClick={() => handleView(USER_DASH_HOME)} />
      )}
      <CerysButton buttonText={"Dashboard"} handleClick={() => handleView(CUSTOMER_DASH_HOME)} />
    </>
  );
};

export default NewCustomerLanding;
