import { useEffect, useRef } from "react";

import { useGetEmployee } from "~community/people/api/PeopleApi";
import { useGetAllTeams } from "~community/people/api/TeamApi";
import useFormChangeDetector from "~community/people/hooks/useFormChangeDetector";
import { usePeopleStore } from "~community/people/store/store";

import DirectorySteppers from "../../molecules/DirectorySteppers/DirectorySteppers";
import RouteChangeAreYouSureModal from "../../molecules/RouteChangeAreYouSureModal/RouteChangeAreYouSureModal";
import UnsavedChangesModal from "../../molecules/UnsavedChangesModal/UnsavedChangesModal";
import UserDetailsCentered from "../../molecules/UserDetailsCentered/UserDetailsCentered";
import PeopleAccountSection from "../PeopleAccountSection/PeopleAccountSection";

interface Props {
  employeeId: number;
}
const AccountSectionWrapper = ({ employeeId }: Props) => {
  const { data: employeeData } = useGetEmployee(employeeId);
  const { data: teamData, isLoading: isTeamsLoading } = useGetAllTeams();

  const accountSectionsRef = useRef<HTMLDivElement>(null);

  const {
    currentStep,
    nextStep,
    isUnsavedChangesModalOpen,
    employee,
    setIsUnsavedChangesModalOpen,
    setCurrentStep,
    setIsUnsavedModalSaveButtonClicked,
    setIsUnsavedModalDiscardButtonClicked,
    setEmployee,
    setProjectTeamNames
  } = usePeopleStore((state) => state);

  useEffect(() => {
    if (employeeData) {
      setEmployee(employeeData?.data?.results[0]);
    }
  }, [employeeData, setEmployee]);

  useEffect(() => {
    if (!isTeamsLoading && teamData) {
      setProjectTeamNames(
        teamData.map(({ teamId, teamName }) => ({ teamId, teamName }))
      );
    }
  }, [isTeamsLoading, teamData, setProjectTeamNames]);

  const { hasChanged } = useFormChangeDetector();

  useEffect(() => {
    if (hasChanged && currentStep !== nextStep) {
      setIsUnsavedChangesModalOpen(true);
    } else {
      setCurrentStep(nextStep);
    }
  }, [
    currentStep,
    hasChanged,
    nextStep,
    setCurrentStep,
    setIsUnsavedModalSaveButtonClicked,
    setIsUnsavedModalDiscardButtonClicked,
    setIsUnsavedChangesModalOpen
  ]);

  return (
    <>
      {employee && (
        <UserDetailsCentered
          selectedUser={employee}
          styles={{
            marginBottom: "1rem",
            marginTop: "1.5rem"
          }}
          enableEdit={true}
        />
      )}
      <DirectorySteppers
        employeeId={employeeId}
        formRef={accountSectionsRef}
        isAccountView
      />
      <PeopleAccountSection formRef={accountSectionsRef} />
      <UnsavedChangesModal
        isOpen={isUnsavedChangesModalOpen}
        onDiscard={() => {
          setIsUnsavedModalDiscardButtonClicked(true);
        }}
        onSave={() => {
          setIsUnsavedModalSaveButtonClicked(true);
        }}
      />
      <RouteChangeAreYouSureModal />
    </>
  );
};

export default AccountSectionWrapper;
