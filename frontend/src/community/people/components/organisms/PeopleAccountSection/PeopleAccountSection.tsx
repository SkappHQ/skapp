import { Box } from "@mui/material";
import { RefObject } from "react";

import useSessionData from "~community/common/hooks/useSessionData";
import { usePeopleStore } from "~community/people/store/store";
import { EditPeopleFormTypes } from "~community/people/types/PeopleEditTypes";
import IndividualEmployeeDocumentView from "~enterprise/people/components/molecules/IndividualEmployeeDocumentView/IndividualEmployeeDocumentView";

import EmergencyDetailsForm from "../EmergencyDetailsSection/EmergencyDetailsForm";
import EmploymentDetailsForm from "../EmploymentFormSection/EmploymentDetailsForm";
import PersonalDetailsForm from "../PersonDetailsSection/PersonalDetailsForm";

interface Props {
  formRef?: RefObject<HTMLDivElement>;
}

const PeopleAccountSection = ({ formRef }: Props) => {
  const { currentStep } = usePeopleStore((state) => state);
  const { userId } = useSessionData();

  const getSections = () => {
    switch (currentStep) {
      case EditPeopleFormTypes.personal:
        return <PersonalDetailsForm isUpdate />;
      case EditPeopleFormTypes.emergency:
        return <EmergencyDetailsForm />;
      case EditPeopleFormTypes.employment:
        return <EmploymentDetailsForm isUpdate isProfileView />;
      case EditPeopleFormTypes.documents:
        return <IndividualEmployeeDocumentView selectedUser={userId!} />;
      default:
        return;
    }
  };

  return <Box ref={formRef}>{getSections()}</Box>;
};

export default PeopleAccountSection;
