import { Modal, Stack } from "@mui/material";
import { useRouter } from "next/router";
import { type NextPage } from "next/types";
import { useCallback, useEffect, useState } from "react";

import { useUploadImages } from "~community/common/api/FileHandleApi";
import BoxStepper from "~community/common/components/molecules/BoxStepper/BoxStepper";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { accountPageTestId } from "~community/common/constants/testIds";
import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { ToastType } from "~community/common/enums/ComponentEnums";
import useGetProfileDetails from "~community/common/hooks/useGetProfileDetails";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { EditAllInfoErrorTypes } from "~community/common/types/ErrorTypes";
import { useUpdatePersonalDetails } from "~community/people/api/PeopleApi";
import DiscardChangeApprovalModal from "~community/people/components/molecules/DiscardChangeApprovalModal/DiscardChangeApprovalModal";
import EditAllInfoSkeleton from "~community/people/components/molecules/EditAllInfoSkeleton/EditAllInfoSkeleton";
import UserDetailsCentered from "~community/people/components/molecules/UserDetailsCentered/UserDetailsCentered";
import EmergencyDetailsForm from "~community/people/components/organisms/AddNewResourceFlow/EmergencyDetailsSection/EmergencyDetailsForm";
import EmploymentDetailsForm from "~community/people/components/organisms/AddNewResourceFlow/EmploymentDetailsSection/EmploymentDetailsForm";
import PersonalDetailsForm from "~community/people/components/organisms/AddNewResourceFlow/PersonalDetailsSection/PersonalDetailsForm";
import { DiscardTypeEnums } from "~community/people/enums/DirectoryEnums";
import useDetectProfileChange from "~community/people/hooks/useDetectProfileChange";
import { usePeopleStore } from "~community/people/store/store";
import { EmployeeType } from "~community/people/types/AddNewResourceTypes";
import {
  DiscardChangeModalType,
  EditAllInformationFormStatus,
  EditAllInformationType
} from "~community/people/types/EditEmployeeInfoTypes";
import {
  EmployeeDetails,
  contractStates
} from "~community/people/types/EmployeeTypes";
import uploadImage from "~community/people/utils/image/uploadImage";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";
import useS3Download from "~enterprise/common/hooks/useS3Download";

const Account: NextPage = () => {
  const router = useRouter();

  const environment = useGetEnvironment();

  const { forceRefetch } = useS3Download();

  const { setToastMessage } = useToast();

  const translateText = useTranslator("peopleModule");
  const translateToastText = useTranslator(
    "peopleModule",
    "addResource",
    "commonText"
  );

  const {
    employeeGeneralDetails,
    employeeContactDetails,
    employeeFamilyDetails,
    employeeEducationalDetails,
    employeeSocialMediaDetails,
    employeeHealthAndOtherDetails,
    employeeEmergencyContactDetails,
    employeeEmploymentDetails,
    employeeCareerDetails,
    employeeIdentificationAndDiversityDetails,
    employeePreviousEmploymentDetails,
    employeeVisaDetails,
    employeeDataChanges,
    setEmployeeGeneralDetails,
    userRoles
  } = usePeopleStore((state) => state);

  const { id } = router.query;

  const {
    employee,
    isSuccess,
    isLoading,
    setEmployeeData,
    refetchProfileData,
    discardEmployeeData
  }: {
    employee: EmployeeDetails | undefined;
    isSuccess: boolean;
    isLoading: boolean;
    setEmployeeData: () => void;
    refetchProfileData: () => Promise<void>;
    discardEmployeeData: () => void;
  } = useGetProfileDetails();

  const { isValuesChanged } = useDetectProfileChange();

  const [formType, setFormType] = useState<EditAllInformationType>(
    EditAllInformationType.personal
  );

  const [updateEmployeeStatus, setUpdateEmployeeStatus] =
    useState<EditAllInformationFormStatus>(
      EditAllInformationFormStatus.PENDING
    );

  const [isDiscardChangesModal, setIsDiscardChangesModal] =
    useState<DiscardChangeModalType>({
      isModalOpen: false,
      modalType: "",
      modalOpenedFrom: ""
    });

  const [isProbation, setIsProbation] = useState<boolean>(
    (employee?.contractState === contractStates.PROBATION &&
      Boolean(employee?.periodResponseDto)) ||
      false
  );

  const steps = [
    translateText(["editAllInfo", "personal"]),
    translateText(["editAllInfo", "emergency"]),
    translateText(["editAllInfo", "employment"])
  ];

  const onSuccess = async () => {
    if (isDiscardChangesModal.isModalOpen) {
      setUpdateEmployeeStatus(EditAllInformationFormStatus.UPDATED);
    } else {
      setUpdateEmployeeStatus(EditAllInformationFormStatus.PENDING);
    }
    setToastMessage({
      toastType: ToastType.SUCCESS,
      title: translateToastText(["editToastTitle"]),
      description: translateToastText(["editProfileToastDescription"]),
      open: true
    });
    await refetchProfileData();
  };

  const onError = (error: string) => {
    setUpdateEmployeeStatus(EditAllInformationFormStatus.UPDATE_ERROR);
    const toastContent = {
      toastType: ToastType.ERROR,
      title: translateText(["editAllInfo", "editAllInfoErrors", "title"]),
      description: translateText(
        ["editAllInfo", "editAllInfoErrors", "description"],
        {
          employee:
            employee?.name ??
            translateText(["editAllInfo", "editAllInfoErrors", "employee"])
        }
      ),
      open: true
    };
    const errors = {
      [EditAllInfoErrorTypes.REALOCATE_INDIVIDUAL_SUPERVISOR_ERROR]:
        translateText([
          "editAllInfo",
          "editAllInfoErrors",
          "realocateIndividualSupervisorError"
        ]),
      [EditAllInfoErrorTypes.REALOCATE_TEAM_SUPERVISOR_ERROR]: translateText([
        "editAllInfo",
        "editAllInfoErrors",
        "realocateTeamSupervisorError"
      ]),
      [EditAllInfoErrorTypes.REALOCATE_INIDIVIDUAL_AND_TEAM_SUPERVISOR_ERROR]:
        translateText([
          "editAllInfo",
          "editAllInfoErrors",
          "realocateIndividualAndTeamSupervisorError"
        ]),
      [EditAllInfoErrorTypes.UPLOAD_PROFILE_PICTURE_ERROR]: translateText([
        "editAllInfo",
        "editAllInfoErrors",
        "uploadError"
      ])
    };
    toastContent.description =
      errors[error as EditAllInfoErrorTypes] ?? toastContent.description;
    setToastMessage(toastContent);
  };

  const {
    mutate,
    isPending: isEditingEmployeeLoading,
    isSuccess: isEditingEmployeeSuccess
  } = useUpdatePersonalDetails(onSuccess, onError);

  const handleBackBtnClick = () =>
    isValuesChanged() && !isDiscardChangesModal.isModalOpen
      ? setIsDiscardChangesModal({
          isModalOpen: true,
          modalType: DiscardTypeEnums.LEAVE_FORM,
          modalOpenedFrom: formType
        })
      : router.back();

  const handleCancelBtnClick = () => {
    if (isValuesChanged()) {
      setIsDiscardChangesModal({
        isModalOpen: true,
        modalType: DiscardTypeEnums.CANCEL_FORM,
        modalOpenedFrom: formType
      });
    }
  };

  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (isValuesChanged()) {
      e.preventDefault();
      return "";
    }
  };

  const handleRouteChange = () => {
    if (isValuesChanged() && !isDiscardChangesModal.isModalOpen) {
      setIsDiscardChangesModal({
        isModalOpen: true,
        modalType: DiscardTypeEnums.LEAVE_FORM,
        modalOpenedFrom: formType
      });
      router.events.emit("routeChangeError");
      throw "routeChange aborted";
    }
  };

  useEffect(() => {
    router.events.on("routeChangeStart", handleRouteChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [handleRouteChange, handleBeforeUnload]);

  const handleComponentChange = (step: EditAllInformationType) => {
    if (isValuesChanged() && isSuccess) {
      setIsDiscardChangesModal({
        isModalOpen: true,
        modalType: DiscardTypeEnums.LEAVE_TAB,
        modalOpenedFrom: step
      });
    } else {
      setFormType(step);
    }
  };

  const { mutateAsync: imageUploadMutate } = useUploadImages();

  const handleSave = async () => {
    const newAuthPicURL = await uploadImage({
      isAnExistingResource: true,
      environment,
      authPic: employeeGeneralDetails?.authPic,
      thumbnail: employeeGeneralDetails?.thumbnail,
      imageUploadMutate,
      onError: () => onError(EditAllInfoErrorTypes.UPLOAD_PROFILE_PICTURE_ERROR)
    });

    forceRefetch(newAuthPicURL);

    setEmployeeGeneralDetails("authPic", newAuthPicURL);
    setEmployeeGeneralDetails("thumbnail", "");

    const updatedEmployeeData: EmployeeType = {
      employeeId: employee?.employeeId,
      generalDetails: {
        ...employeeGeneralDetails,
        authPic: newAuthPicURL
      },
      contactDetails: employeeContactDetails,
      familyDetails: employeeFamilyDetails,
      educationalDetails: employeeEducationalDetails,
      socialMediaDetails: employeeSocialMediaDetails,
      healthAndOtherDetails: employeeHealthAndOtherDetails,
      emergencyDetails: employeeEmergencyContactDetails,
      employmentDetails: employeeEmploymentDetails,
      careerDetails: employeeCareerDetails,
      identificationAndDiversityDetails:
        employeeIdentificationAndDiversityDetails,
      previousEmploymentDetails: employeePreviousEmploymentDetails,
      visaDetails: employeeVisaDetails,
      userRoles: userRoles
    };

    mutate(updatedEmployeeData);
  };

  const getComponent = useCallback(() => {
    switch (formType) {
      case EditAllInformationType.personal:
        return (
          <PersonalDetailsForm
            onNext={handleSave}
            onBack={handleCancelBtnClick}
            isUpdate
            isSubmitDisabled={!isValuesChanged()}
            isLoading={false}
            updateEmployeeStatus={updateEmployeeStatus}
            setUpdateEmployeeStatus={setUpdateEmployeeStatus}
          />
        );

      case EditAllInformationType.emergency:
        return (
          <EmergencyDetailsForm
            onNext={handleSave}
            onBack={handleCancelBtnClick}
            isUpdate={true}
            isSubmitDisabled={!isValuesChanged()}
            isLoading={false}
            updateEmployeeStatus={updateEmployeeStatus}
            setUpdateEmployeeStatus={setUpdateEmployeeStatus}
          />
        );
      case EditAllInformationType.employment:
        return (
          <EmploymentDetailsForm
            onNext={handleSave}
            onBack={handleCancelBtnClick}
            isUpdate
            isSubmitDisabled={!isValuesChanged()}
            isLoading={false}
            updateEmployeeStatus={updateEmployeeStatus}
            setUpdateEmployeeStatus={setUpdateEmployeeStatus}
            isProfileView={true}
          />
        );

      default:
        <PersonalDetailsForm
          onNext={handleSave}
          onBack={handleCancelBtnClick}
          isUpdate
          isSubmitDisabled={!isValuesChanged()}
          isLoading={false}
        />;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    employee,
    formType,
    id,
    isEditingEmployeeSuccess,
    isEditingEmployeeLoading,
    isProbation,
    handleBackBtnClick,
    mutate
  ]);

  useEffect(() => {
    setIsProbation(
      (employee?.contractState === contractStates.PROBATION &&
        Boolean(employee?.periodResponseDto)) ||
        false
    );
  }, [employee]);

  useEffect(() => {
    if (employeeDataChanges === 0 && employee) {
      setEmployeeData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee, employeeDataChanges]);

  useEffect(() => {
    return () => {
      discardEmployeeData();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <ContentLayout
        onBackClick={handleBackBtnClick}
        pageHead={translateText(["editAllInfo", "tabTitle"])}
        title={""}
      >
        <Stack direction={"column"}>
          <UserDetailsCentered
            selectedUser={employee as EmployeeDetails}
            styles={{
              marginBottom: "1rem",
              marginTop: "1.5rem"
            }}
            isLoading={isLoading}
            isSuccess={isSuccess}
            enableEdit={true}
          />
          <BoxStepper
            activeStep={formType}
            steps={steps}
            onStepClick={(step) =>
              handleComponentChange(step as EditAllInformationType)
            }
            useStringIdentifier
            stepperStyles={{
              marginBottom: "1.75rem"
            }}
            data-testid={accountPageTestId.BoxStepperStepsId}
          />
          {isSuccess ? getComponent() : <EditAllInfoSkeleton />}
        </Stack>
      </ContentLayout>
      {isDiscardChangesModal.isModalOpen && (
        <Modal
          open={isDiscardChangesModal.isModalOpen}
          onClose={() => {
            setIsDiscardChangesModal({
              isModalOpen: false,
              modalType: "",
              modalOpenedFrom: ""
            });
            setUpdateEmployeeStatus(EditAllInformationFormStatus.PENDING);
          }}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: ZIndexEnums.MODAL
          }}
        >
          <DiscardChangeApprovalModal
            setFormType={setFormType}
            isDiscardChangesModal={isDiscardChangesModal}
            setIsDiscardChangesModal={setIsDiscardChangesModal}
            functionOnLeave={setEmployeeData}
            updateEmployeeStatus={updateEmployeeStatus}
            setUpdateEmployeeStatus={setUpdateEmployeeStatus}
          />
        </Modal>
      )}
    </>
  );
};

export default Account;
