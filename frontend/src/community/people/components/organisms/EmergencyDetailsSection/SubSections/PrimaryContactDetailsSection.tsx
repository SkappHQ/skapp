import { forwardRef } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import useEmergencyContactDetailsFormHandlers from "~community/people/hooks/useEmergencyContactDetailsFormHandlers";
import { FormMethods } from "~community/people/types/PeopleEditTypes";

import EmergencyContactDetailsSection from "./EmergencyContactDetailsSection";

interface Props {
  isReadOnly?: boolean;
  isInputsDisabled?: boolean;
}

const PrimaryContactDetailsSection = forwardRef<FormMethods, Props>(
  ({ isReadOnly = false, isInputsDisabled = false }: Props, ref) => {
    const translateText = useTranslator(
      "peopleModule",
      "addResource",
      "emergencyDetails"
    );

    const usePrimaryContactFormHandlers = () =>
      useEmergencyContactDetailsFormHandlers("primaryEmergencyContact");

    return (
      <EmergencyContactDetailsSection
        isReadOnly={isReadOnly}
        isInputsDisabled={isInputsDisabled}
        ref={ref}
        titleKey={translateText(["primaryTitle"])}
        formHandlersHook={usePrimaryContactFormHandlers}
      />
    );
  }
);

PrimaryContactDetailsSection.displayName = "PrimaryContactDetailsSection";

export default PrimaryContactDetailsSection;
