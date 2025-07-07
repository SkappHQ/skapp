import { Box } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetEmployee } from "~community/people/api/PeopleApi";
import useFormChangeDetector from "~community/people/hooks/useFormChangeDetector";
import { usePeopleStore } from "~community/people/store/store";
import { EditPeopleFormTypes } from "~community/people/types/PeopleEditTypes";

import CancelChangesModal from "../../molecules/CancelChangesModal/CancelChangesModal";
import DirectorySteppers from "../../molecules/DirectorySteppers/DirectorySteppers";
import EditAllInfoSkeleton from "../../molecules/EditAllInfoSkeleton/EditAllInfoSkeleton";
import EditInfoCard from "../../molecules/EditInfoCard/EditInfoCard";
import EditInfoCardSkeleton from "../../molecules/EditInfoCard/EditInfoCardSkeleton";
import RouteChangeAreYouSureModal from "../../molecules/RouteChangeAreYouSureModal/RouteChangeAreYouSureModal";
import TerminationModalController from "../../molecules/TerminationModalController/TerminationModalController";
import UnsavedChangesModal from "../../molecules/UnsavedChangesModal/UnsavedChangesModal";
import UserDeletionModalController from "../../molecules/UserDeletionModalController/UserDeletionModalController";
import PeopleFormSections from "../PeopleFormSections/PeopleFormSections";

interface Props {
  employeeId: number;
}

const DirectoryEditSectionWrapper = ({ employeeId }: Props) => {
  const { data: employeeData, isLoading } = useGetEmployee(employeeId);
  const translateAria = useTranslator("peopleAria", "directory");
  const router = useRouter();
  const { tab } = router.query;

  const peopleFormSectionsRef = useRef<HTMLDivElement>(null);

  const {
    isUnsavedChangesModalOpen,
    currentStep,
    nextStep,
    isCancelChangesModalOpen,
    employee,
    setIsUnsavedChangesModalOpen,
    setCurrentStep,
    setNextStep,
    setIsUnsavedModalSaveButtonClicked,
    setIsUnsavedModalDiscardButtonClicked,
    setEmployee,
    setIsCancelModalConfirmButtonClicked,
    setIsCancelChangesModalOpen
  } = usePeopleStore((state) => state);

  useEffect(() => {
    if (employeeData) {
      setEmployee(employeeData?.data?.results[0]);
    }
  }, [employeeData, setEmployee]);

  useEffect(() => {
    if (
      tab === EditPeopleFormTypes.leave.toLowerCase() &&
      nextStep !== EditPeopleFormTypes.leave
    ) {
      setNextStep(EditPeopleFormTypes.leave);
    } else if (
      tab === EditPeopleFormTypes.timesheet.toLowerCase() &&
      nextStep !== EditPeopleFormTypes.timesheet
    ) {
      setNextStep(EditPeopleFormTypes.timesheet);
    }
  }, []);

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
    <Box
      role="region"
      aria-label={translateAria(["userProfile"], {
        name: `${employee?.personal?.general?.firstName} ${employee?.personal?.general?.lastName}`
      })}
    >
      <Box sx={{ mt: "0.75rem" }}>
        {isLoading ? <EditInfoCardSkeleton /> : <EditInfoCard />}
      </Box>
      <DirectorySteppers
        employeeId={Number(employeeId)}
        formRef={peopleFormSectionsRef}
      />
      {isLoading ? (
        <EditAllInfoSkeleton />
      ) : (
        <PeopleFormSections
          employeeId={Number(employeeId)}
          formRef={peopleFormSectionsRef}
        />
      )}
      <TerminationModalController />
      <UserDeletionModalController />
      <UnsavedChangesModal
        isOpen={isUnsavedChangesModalOpen}
        onDiscard={() => {
          setIsUnsavedModalDiscardButtonClicked(true);
        }}
        onSave={() => {
          setIsUnsavedModalSaveButtonClicked(true);
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
      <RouteChangeAreYouSureModal />
    </Box>
  );
};

export default DirectoryEditSectionWrapper;
