import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import BoxStepper from "~community/common/components/molecules/BoxStepper/BoxStepper";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  AdminTypes,
  EmployeeTypes,
  ManagerTypes
} from "~community/common/types/AuthTypes";
import { useGetSupervisedByMe } from "~community/people/api/PeopleApi";
import { usePeopleStore } from "~community/people/store/store";
import { EditPeopleFormTypes } from "~community/people/types/PeopleEditTypes";

interface Props {
  employeeId: number;
  isIndividualView?: boolean;
  isAccountView?: boolean;
}

const DirectorySteppers = ({
  employeeId,
  isIndividualView,
  isAccountView
}: Props) => {
  const [isLeaveTabVisible, setIsLeaveTabVisible] = useState(false);
  const [isTimeTabVisible, setIsTimeTabVisible] = useState(false);
  const translateText = useTranslator("peopleModule");

  const { data: session } = useSession();

  const { setNextStep, currentStep } = usePeopleStore((state) => state);

  const { data: supervisedData, isLoading: supervisorDataLoading } =
    useGetSupervisedByMe(Number(employeeId));

  const isLeaveAdmin = session?.user.roles?.includes(AdminTypes.LEAVE_ADMIN);

  const isAttendanceAdmin = session?.user.roles?.includes(
    AdminTypes.ATTENDANCE_ADMIN
  );

  const isLeaveManager = session?.user.roles?.includes(
    ManagerTypes.LEAVE_MANAGER || AdminTypes.LEAVE_ADMIN
  );

  const isAttendanceManager = session?.user.roles?.includes(
    ManagerTypes.ATTENDANCE_MANAGER || AdminTypes.ATTENDANCE_ADMIN
  );

  useEffect(() => {
    if (supervisedData && !supervisorDataLoading) {
      if (isLeaveAdmin) {
        setIsLeaveTabVisible(true);
      } else if (supervisedData && isLeaveManager) {
        const isManager =
          supervisedData.isPrimaryManager ||
          supervisedData.isSecondaryManager ||
          supervisedData.isTeamSupervisor;
        setIsLeaveTabVisible(isManager);
      }

      if (isAttendanceAdmin) {
        setIsTimeTabVisible(true);
      } else if (supervisedData && isAttendanceManager) {
        const isManager =
          supervisedData.isPrimaryManager ||
          supervisedData.isSecondaryManager ||
          supervisedData.isTeamSupervisor;
        setIsTimeTabVisible(isManager);
      }
    }
  }, [supervisorDataLoading, supervisedData]);

  const steps = [
    translateText(["editAllInfo", "personal"]),
    ...(isIndividualView ? [] : [translateText(["editAllInfo", "emergency"])]),
    translateText(["editAllInfo", "employment"]),
    ...(isIndividualView || isAccountView
      ? []
      : [translateText(["editAllInfo", "systemPermissions"])]),
    ...(isIndividualView || isAccountView
      ? []
      : [translateText(["editAllInfo", "timeline"])]),
    ...(isLeaveTabVisible &&
    !isAccountView &&
    session?.user?.roles?.includes(EmployeeTypes.LEAVE_EMPLOYEE)
      ? [translateText(["editAllInfo", "leave"])]
      : []),
    ...(isTimeTabVisible &&
    !isAccountView &&
    session?.user?.roles?.includes(EmployeeTypes.ATTENDANCE_EMPLOYEE)
      ? [translateText(["editAllInfo", "timesheet"])]
      : [])
  ];

  const handleStepClick = (step: EditPeopleFormTypes) => {
    setNextStep(step);
    requestAnimationFrame(() => {
      const container = document.getElementById("people-form-section");
      if (container) {
        const focusableElements = container.querySelectorAll(
          'button, input, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
          (focusableElements[0] as HTMLElement).focus();
        }
      }
    });
  };

  return (
    <BoxStepper
      activeStep={currentStep}
      steps={steps}
      onStepClick={(step) => handleStepClick(step as EditPeopleFormTypes)}
      useStringIdentifier
      stepperStyles={{
        marginBottom: "1.75rem"
      }}
      isFullWidth={!(isIndividualView || isAccountView)}
    />
  );
};

export default DirectorySteppers;
