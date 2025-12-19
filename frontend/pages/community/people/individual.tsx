import { Stack } from "@mui/material";
import { NextPage } from "next";
import { useAuth } from "~community/common/context/AuthContext";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

import IndividualEmployeeTimeReportSection from "~community/attendance/components/molecules/IndividualEmployeeTimeReportBody/IndividualEmployeeTimeReportBody";
import BoxStepper from "~community/common/components/molecules/BoxStepper/BoxStepper";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  AdminTypes,
  EmployeeTypes,
  ManagerTypes
} from "~community/common/types/AuthTypes";
import IndividualEmployeeLeaveReportSection from "~community/leave/components/molecules/IndividualEmployeeLeaveReportSection/IndividualEmployeeLeaveReportSection";
import { useGetSupervisedByMe } from "~community/people/api/PeopleApi";
import EditAllInfoSkeleton from "~community/people/components/molecules/EditAllInfoSkeleton/EditAllInfoSkeleton";
import UserDetailsCentered from "~community/people/components/molecules/UserDetailsCentered/UserDetailsCentered";
import EmergencyDetailsForm from "~community/people/components/organisms/AddNewResourceFlow/EmergencyDetailsSection/EmergencyDetailsForm";
import PrimaryDetailsSection from "~community/people/components/organisms/AddNewResourceFlow/EmergencyDetailsSection/PrimaryDetailsSection";
import SecondaryDetailsSection from "~community/people/components/organisms/AddNewResourceFlow/EmergencyDetailsSection/SecondaryDetailsSection";
import EmploymentDetailsSection from "~community/people/components/organisms/AddNewResourceFlow/EmploymentDetailsSection/EmploymentDetailsSection";
import GeneralDetailsSection from "~community/people/components/organisms/AddNewResourceFlow/PersonalDetailsSection/GeneralDetailsSection";
import useGetEmployee from "~community/people/hooks/useGetEmployee";
import { EditAllInformationType } from "~community/people/types/EditEmployeeInfoTypes";
import { EmployeeDetails } from "~community/people/types/EmployeeTypes";

const Individual: NextPage = () => {
  const router = useRouter();
  const translateText = useTranslator("peopleModule");

  const { data } = useAuth();

  const { tab, viewEmployeeId } = router.query;

  const [isLeaveTabVisible, setIsLeaveTabVisible] = useState(false);
  const [isTimeTabVisible, setIsTimeTabVisible] = useState(false);

  const isLeaveAdmin = data?.user.roles?.includes(AdminTypes.LEAVE_ADMIN);

  const isAttendanceAdmin = data?.user.roles?.includes(
    AdminTypes.ATTENDANCE_ADMIN
  );

  const isLeaveManager = data?.user.roles?.includes(
    ManagerTypes.LEAVE_MANAGER || AdminTypes.LEAVE_ADMIN
  );

  const isAttendanceManager = data?.user.roles?.includes(
    ManagerTypes.ATTENDANCE_MANAGER || AdminTypes.ATTENDANCE_ADMIN
  );

  const isEmployee = data?.user.roles?.every((role) =>
    Object.values(EmployeeTypes).includes(role as EmployeeTypes)
  );

  const isManager = isLeaveManager || isAttendanceManager;

  const [formType, setFormType] = useState<EditAllInformationType>(
    EditAllInformationType.personal
  );

  const {
    employee,
    isSuccess,
    isLoading,
    setEmployeeData
  }: {
    employee: EmployeeDetails | undefined;
    isSuccess: boolean;
    isLoading: boolean;
    setEmployeeData: () => void;
    refetchEmployeeData: () => Promise<void>;
    discardEmployeeData: () => void;
  } = useGetEmployee({ id: Number(viewEmployeeId) });

  const { data: supervisedData, isLoading: supervisorDataLoading } =
    useGetSupervisedByMe(Number(viewEmployeeId));

  const steps = [
    translateText(["editAllInfo", "personal"]),
    translateText(["editAllInfo", "employment"]),
    ...(isLeaveTabVisible &&
    data?.user?.roles?.includes(EmployeeTypes.LEAVE_EMPLOYEE)
      ? [translateText(["editAllInfo", "leave"])]
      : []),
    ...(isTimeTabVisible &&
    data?.user?.roles?.includes(EmployeeTypes.ATTENDANCE_EMPLOYEE)
      ? [translateText(["editAllInfo", "timesheet"])]
      : [])
  ];

  const getComponent = useCallback(() => {
    switch (formType) {
      case EditAllInformationType.personal:
        return (
          <>
            <GeneralDetailsSection isManager={true} />
            {isManager && (
              <>
                <PrimaryDetailsSection isManager={true} />
                <SecondaryDetailsSection isManager={true} />
              </>
            )}
          </>
        );

      case EditAllInformationType.emergency:
        return (
          <EmergencyDetailsForm
            isUpdate={false}
            isSubmitDisabled={true}
            isLoading={false}
            onNext={function (): void {
              throw new Error("Function not implemented.");
            }}
            onBack={function (): void {
              throw new Error("Function not implemented.");
            }}
          />
        );
      case EditAllInformationType.employment:
        return (
          <>
            <EmploymentDetailsSection
              isManager={true}
              isEmployee={isEmployee}
            />
          </>
        );
      case EditAllInformationType.timesheeet:
        return (
          <>
            <IndividualEmployeeTimeReportSection
              selectedUser={Number(viewEmployeeId)}
            />
          </>
        );
      case EditAllInformationType.leave:
        return (
          <>
            <IndividualEmployeeLeaveReportSection
              selectedUser={Number(viewEmployeeId)}
              employeeLastName={employee?.lastName}
              employeeFirstName={employee?.firstName}
            />
          </>
        );
      default:
        <></>;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee, formType, viewEmployeeId]);

  useEffect(() => {
    if (isSuccess) {
      setEmployeeData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  useEffect(() => {
    if (tab && tab === "timesheet") {
      setFormType(EditAllInformationType.timesheeet);
    } else if (tab === "leave") {
      setFormType(EditAllInformationType.leave);
    }
  }, [tab]);

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
  return (
    <ContentLayout
      title={""}
      onBackClick={() => router.back()}
      pageHead={""}
      isBackButtonVisible
      isDividerVisible={false}
    >
      <Stack>
        <UserDetailsCentered
          selectedUser={employee as EmployeeDetails}
          styles={{
            marginBottom: "1rem",
            marginTop: "1.5rem"
          }}
          isLoading={isLoading}
          isSuccess={isSuccess}
          enableEdit={false}
        />
        {!supervisorDataLoading && (
          <BoxStepper
            activeStep={formType}
            steps={steps}
            onStepClick={(step) => setFormType(step as EditAllInformationType)}
            useStringIdentifier
            stepperStyles={{
              marginBottom: "1.75rem"
            }}
          />
        )}

        {isSuccess ? getComponent() : <EditAllInfoSkeleton />}
      </Stack>
    </ContentLayout>
  );
};

export default Individual;
