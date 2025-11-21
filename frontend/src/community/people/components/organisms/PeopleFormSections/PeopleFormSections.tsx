import { Box } from "@mui/material";
import { RefObject } from "react";


import IndividualEmployeeTimeReportSection from "~community/attendance/components/molecules/IndividualEmployeeTimeReportBody/IndividualEmployeeTimeReportBody";
import useSessionData from "~community/common/hooks/useSessionData";
import IndividualEmployeeLeaveReportSection from "~community/leave/components/molecules/IndividualEmployeeLeaveReportSection/IndividualEmployeeLeaveReportSection";
import { usePeopleStore } from "~community/people/store/store";
import { EditPeopleFormTypes } from "~community/people/types/PeopleEditTypes";

import PeopleTimeline from "../../molecules/PeopleTimeline/PeopleTimeline";
import EntitlementsDetailsForm from "../AddNewResourceFlow/EntitlementsDetailsSection/EntitlementsDetailsForm";
import EmergencyDetailsForm from "../EmergencyDetailsSection/EmergencyDetailsForm";
import EmploymentDetailsForm from "../EmploymentFormSection/EmploymentDetailsForm";
import PersonalDetailsForm from "../PersonDetailsSection/PersonalDetailsForm";
import SystemPermissionFormSection from "../SystemPermissionFormSection/SystemPermissionFormSection";
import IndividualEmployeeDocumentView from "~enterprise/people/components/molecules/IndividualEmployeeDocumentView/IndividualEmployeeDocumentView";

interface Props {
  employeeId?: number;
  isAddFlow?: boolean;
  formRef?: RefObject<HTMLDivElement>;
}

const PeopleFormSections = ({
  employeeId,
  isAddFlow = false,
  formRef
}: Props) => {
  const { currentStep, activeStep, employee } = usePeopleStore(
    (state) => state
  );

  const { isPeopleAdmin, userId, isPeopleManager, isSuperAdmin } =
    useSessionData();

  const isReadOnly = !isPeopleAdmin && userId !== employeeId;

  const isSystemPermissionsReadOnly = !isPeopleAdmin;

  const isPeopleManagerOnly =
    isPeopleManager && !isPeopleAdmin && !isSuperAdmin;

  const isPeopleAdminViewingOwnProfile =
    isPeopleAdmin && !isSuperAdmin && userId === employeeId;

  const getAddFlowSection = () => {
    switch (activeStep) {
      case 0:
        return <PersonalDetailsForm isAddFlow={isAddFlow} />;
      case 1:
        return <EmergencyDetailsForm isAddFlow={isAddFlow} />;
      case 2:
        return <EmploymentDetailsForm isAddFlow={isAddFlow} />;
      case 3:
        return <SystemPermissionFormSection isAddFlow={isAddFlow} />;
      case 4:
        return <EntitlementsDetailsForm />;
      default:
        return null;
    }
  };

  const getEditFlowSection = () => {
    switch (currentStep) {
      case EditPeopleFormTypes.personal:
        return (
          <PersonalDetailsForm isAddFlow={isAddFlow} isReadOnly={isReadOnly} />
        );
      case EditPeopleFormTypes.emergency:
        return (
          <EmergencyDetailsForm isAddFlow={isAddFlow} isReadOnly={isReadOnly} />
        );
      case EditPeopleFormTypes.employment:
        return (
          <EmploymentDetailsForm
            isAddFlow={isAddFlow}
            isReadOnly={isReadOnly}
            isProfileView={isPeopleManagerOnly}
            isUpdate
          />
        );
      case EditPeopleFormTypes.permission:
        return (
          <SystemPermissionFormSection
            isAddFlow={isAddFlow}
            isReadOnly={
              isSystemPermissionsReadOnly || isPeopleAdminViewingOwnProfile
            }
          />
        );
      case EditPeopleFormTypes.timeline:
        return <PeopleTimeline employeeId={employeeId} />;
      case EditPeopleFormTypes.leave:
        return (
          <IndividualEmployeeLeaveReportSection
            selectedUser={Number(employeeId)}
            employeeLastName={employee?.personal?.general?.lastName ?? ""}
            employeeFirstName={employee?.personal?.general?.firstName ?? ""}
          />
        );
      case EditPeopleFormTypes.timesheet:
        return (
          <IndividualEmployeeTimeReportSection
            selectedUser={Number(employeeId)}
          />
        );
      case EditPeopleFormTypes.documents:
        return (
          <IndividualEmployeeDocumentView selectedUser={Number(employeeId)} />
        ); 
      default:
        return null;
    }
  };

  return (
    <Box ref={formRef}>
      {isAddFlow ? getAddFlowSection() : getEditFlowSection()}
    </Box>
  );
};

export default PeopleFormSections;
