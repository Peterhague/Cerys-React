import * as React from "react";

export const bFPrevPeriodMessage: React.ReactNode = (
  <>
    <p>Do you want to post opening balances based on the previous period's data?</p>
  </>
);

export const getClientCodeMappingMessage = (nominalCode, nominalCodeName) => {
  const message: React.ReactNode = (
    <>
      <p>Apply this mapping change to all transactions assigned to {nominalCode + " " + nominalCodeName}?</p>
    </>
  );
  return message;
};
