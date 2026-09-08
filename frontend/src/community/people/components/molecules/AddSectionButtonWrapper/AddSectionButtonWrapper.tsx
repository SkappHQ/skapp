import { Stack } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { useRouter } from "next/navigation";
import { useShallow } from "zustand/react/shallow";

import { useUploadImages } from "~community/common/api/FileHandleApi";
import Icon from "~community/common/components/atoms/Icon/Icon";
import ROUTES from "~community/common/constants/routes";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import {
  useAddEmployee,
  useCreateCustomSkills
} from "~community/people/api/PeopleApi";
import useStepper from "~community/people/hooks/useStepper";
import { usePeopleStore } from "~community/people/store/store";
import { SkillType } from "~community/people/types/PeopleTypes";
import { handleError } from "~community/people/utils/directoryUtils/addNewResourceFlowUtils/addNewResourceUtils";
import uploadImage from "~community/people/utils/image/uploadImage";
import {
  buildResolvedSkillUpdates,
  getNewCustomSkills
} from "~community/people/utils/skillsUtils";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";

interface Props {
  isSaveDisabled?: boolean;
  onNextClick?: () => void;
  setIsSuccess?: (value: boolean) => void;
}

const AddSectionButtonWrapper = ({
  isSaveDisabled = false,
  onNextClick,
  setIsSuccess
}: Props) => {
  const translateText = useTranslator(
    "peopleModule",
    "addResource",
    "commonText"
  );

  const { handleBack, activeStep, isLastStep } = useStepper();

  const { setToastMessage } = useToast();

  const router = useRouter();

  const onSuccess = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["employeeAddSuccessToastTitle"]),
      description: translateText(["employeeAddSuccessToastDescription"])
    });
    setIsSuccess && setIsSuccess(true);
    resetPeopleSlice();
    router.push(ROUTES.PEOPLE.DIRECTORY);
  };

  const onError = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["employeeAddErrorToastTitle"]),
      description: translateText(["employeeAddErrorToastDescription"])
    });
  };

  const { mutate } = useAddEmployee(onSuccess, onError);

  const { mutateAsync: handleUploadImagesAsync } = useUploadImages();

  const { mutate: createCustomSkills } = useCreateCustomSkills();

  const {
    employee,
    profilePic,
    thumbnail,
    setCommonDetails,
    resetPeopleSlice
  } = usePeopleStore(
    useShallow((state) => ({
      employee: state.employee,
      profilePic: state.profilePic,
      thumbnail: state.thumbnail,
      setCommonDetails: state.setCommonDetails,
      resetPeopleSlice: state.resetPeopleSlice
    }))
  );

  const environment = useGetEnvironment();

  const translateError = useTranslator("peopleModule", "addResource");

  const handleSave = async () => {
    const newAuthPicURL = await uploadImage({
      environment,
      authPic: profilePic,
      thumbnail: thumbnail,
      imageUploadMutate: handleUploadImagesAsync,
      onError: () =>
        handleError({
          message: translateError(["uploadError"]),
          setToastMessage,
          translateError
        })
    });

    setCommonDetails({
      authPic: newAuthPicURL ?? ""
    });

    if (!employee) return;

    const skillUpdates = employee.personal?.skillUpdates;

    if (!skillUpdates) {
      mutate(employee);
      return;
    }

    const submitWithResolvedSkills = (createdCustomSkills: SkillType[]) =>
      mutate({
        ...employee,
        personal: {
          ...employee.personal,
          skillUpdates: buildResolvedSkillUpdates(
            skillUpdates,
            createdCustomSkills
          )
        }
      });

    const newCustomSkills = getNewCustomSkills(skillUpdates);

    if (newCustomSkills.length === 0) {
      submitWithResolvedSkills([]);
      return;
    }

    createCustomSkills(newCustomSkills, {
      onSuccess: submitWithResolvedSkills
    });
  };

  return (
    <Stack
      direction="row"
      justifyContent="flex-start"
      spacing={2}
      sx={{ padding: "1rem 0" }}
    >
      {activeStep > 0 && (
        <ButtonV2
          variant={"tertiary"}
          onClick={handleBack}
          icon={<Icon name={IconName.LEFT_ARROW_ICON} />}
          iconPosition="start"
        >
          {translateText(["back"])}
        </ButtonV2>
      )}

      {isLastStep ? (
        <ButtonV2
          variant={"primary"}
          onClick={handleSave}
          disabled={isSaveDisabled}
          icon={<Icon name={IconName.SAVE_ICON} />}
          iconPosition="end"
        >
          {translateText(["saveDetails"])}
        </ButtonV2>
      ) : (
        <ButtonV2
          variant={"primary"}
          onClick={() => {
            if (onNextClick) {
              onNextClick();
            }
          }}
          disabled={isSaveDisabled}
          icon={
            <Icon
              name={IconName.RIGHT_ARROW_ICON}
              width="1.25rem"
              height="1.25rem"
            />
          }
          iconPosition="end"
        >
          {translateText(["next"])}
        </ButtonV2>
      )}
    </Stack>
  );
};

export default AddSectionButtonWrapper;
