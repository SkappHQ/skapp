import { Box } from "@mui/material";
import { useEffect } from "react";

import { useGetEmployee } from "~community/people/api/PeopleApi";
import useFormChangeDetector from "~community/people/hooks/useFormChangeDetector";
import useNavigationGuard from "~community/people/hooks/useNavigationGuard";
import { usePeopleStore } from "~community/people/store/store";

import CancelChangesModal from "../../molecules/CancelChangesModal/CancelChangesModal";
import DirectorySteppers from "../../molecules/DirectorySteppers/DirectorySteppers";
import EditAllInfoSkeleton from "../../molecules/EditAllInfoSkeleton/EditAllInfoSkeleton";
import EditInfoCard from "../../molecules/EditInfoCard/EditInfoCard";
import EditInfoCardSkeleton from "../../molecules/EditInfoCard/EditInfoCardSkeleton";
import TerminationModalController from "../../molecules/TerminationModalController/TerminationModalController";
import UnsavedChangesModal from "../../molecules/UnsavedChangesModal/UnsavedChangesModal";
import UserDeletionModalController from "../../molecules/UserDeletionModalController/UserDeletionModalController";
import PeopleFormSections from "../PeopleFormSections/PeopleFormSections";

interface Props {
  employeeId: number;
}

const DirectoryEditSectionWrapper = ({ employeeId }: Props) => {
  const { data: employee, isLoading } = useGetEmployee(employeeId);

  const {
    isUnsavedChangesModalOpen,
    currentStep,
    nextStep,
    isCancelChangesModalOpen,
    setIsUnsavedChangesModalOpen,
    setCurrentStep,
    setIsUnsavedModalSaveButtonClicked,
    setIsUnsavedModalDiscardButtonClicked,
    setEmployee,
    setIsCancelModalConfirmButtonClicked,
    setIsCancelChangesModalOpen
  } = usePeopleStore((state) => state);

  useEffect(() => {
    if (employee) {
      setEmployee(employee?.data?.results[0]);
    }
  }, [employee, setEmployee]);

  const { hasChanged } = useFormChangeDetector();

  const { proceedWithRouteChange } = useNavigationGuard({
    hasChanged,
    isUnsavedChangesModalOpen,
    setIsUnsavedChangesModalOpen
  });

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
      <Box sx={{ mt: "0.75rem" }}>
        {isLoading ? <EditInfoCardSkeleton /> : <EditInfoCard />}
      </Box>
      <DirectorySteppers employeeId={Number(employeeId)} />
      {isLoading ? (
        <EditAllInfoSkeleton />
      ) : (
        <PeopleFormSections employeeId={Number(employeeId)} />
      )}
      <TerminationModalController />
      <UserDeletionModalController />
      <UnsavedChangesModal
        isOpen={isUnsavedChangesModalOpen}
        onDiscard={async () => {
          setIsUnsavedModalDiscardButtonClicked(true);
          await proceedWithRouteChange();
        }}
        onSave={async () => {
          setIsUnsavedModalSaveButtonClicked(true);
          await proceedWithRouteChange();
        }}
      />
      <CancelChangesModal
        isOpen={isCancelChangesModalOpen}
        onCancel={() => {
          setIsCancelChangesModalOpen(false);
        }}
        onConfirm={() => {
          setIsCancelModalConfirmButtonClicked(true);
        }}
      />
    </>
  );
};

export default DirectoryEditSectionWrapper;
