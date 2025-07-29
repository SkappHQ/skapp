import { forwardRef } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import useEmergencyContactDetailsFormHandlers from "~community/people/hooks/useEmergencyContactDetailsFormHandlers";
import { FormMethods } from "~community/people/types/PeopleEditTypes";

import EmergencyContactDetailsSection from "./EmergencyContactDetailsSection";

interface Props {
  isReadOnly?: boolean;
  isInputsDisabled?: boolean;
}
const SecondaryContactDetailsSection = forwardRef<FormMethods, Props>(
  ({ isReadOnly = false, isInputsDisabled = false }: Props, ref) => {
    const translateText = useTranslator(
      "peopleModule",
      "addResource",
      "emergencyDetails"
    );

    const useSecondaryContactFormHandlers = () =>
      useEmergencyContactDetailsFormHandlers("secondaryEmergencyContact");

    return (
      <EmergencyContactDetailsSection
        isReadOnly={isReadOnly}
        isInputsDisabled={isInputsDisabled}
        ref={ref}
        titleKey={translateText(["secondaryTitle"])}
        formHandlersHook={useSecondaryContactFormHandlers}
      />
    );
  }
);

SecondaryContactDetailsSection.displayName = "SecondaryContactDetailsSection";

export default SecondaryContactDetailsSection;
