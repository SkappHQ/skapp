import { forwardRef } from "react";

import { FormMethods } from "~community/people/types/PeopleEditTypes";

interface Props {
  isInputsDisabled?: boolean;
  isReadOnly?: boolean;
}

const BillingDetailsSection = forwardRef<FormMethods, Props>(() => {
  return <></>;
});

BillingDetailsSection.displayName = "BillingDetailsSection";

export default BillingDetailsSection;
