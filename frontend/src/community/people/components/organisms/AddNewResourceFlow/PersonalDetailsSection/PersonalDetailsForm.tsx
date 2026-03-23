import { Stack, type Theme, useTheme } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import Head from "next/head";
import {
  Dispatch,
  JSX,
  SetStateAction,
  useEffect,
  useRef,
  useState
} from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { personalDetailsSectionTestId } from "~community/common/constants/testIds";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import {
  scrollToFirstError,
  scrollToTop
} from "~community/common/utils/commonUtil";
import { usePeopleStore } from "~community/people/store/store";
import { EditAllInformationFormStatus } from "~community/people/types/EditEmployeeInfoTypes";

import ContactDetailsSection from "./ContactDetailsSection";
import EducationalDetailsSection from "./EducationalDetailsSection";
import FamilyDetailsSection from "./FamilyDetailsSection";
import GeneralDetailsSection from "./GeneralDetailsSection";
import HealthAndOtherDetailsSection from "./HealthAndOtherDetailsSection";
import SocialMediaDetailsSection from "./SocialMediaDetailsSection";

interface Props {
  onNext: () => void;
  isUpdate?: boolean;
  onBack?: () => void;
  isSubmitDisabled?: boolean;
  isLoading?: boolean;
  updateEmployeeStatus?: EditAllInformationFormStatus;
  setUpdateEmployeeStatus?: Dispatch<
    SetStateAction<EditAllInformationFormStatus>
  >;
  isSuperAdminEditFlow?: boolean;
  isInputsDisabled?: boolean;
}

const PersonalDetailsForm = ({
  onNext,
  isUpdate = false,
  onBack,
  isSubmitDisabled = false,
  isLoading = false,
  updateEmployeeStatus,
  setUpdateEmployeeStatus,
  isSuperAdminEditFlow = false,
  isInputsDisabled = false
}: Props): JSX.Element => {
  const theme: Theme = useTheme();
  const translateText = useTranslator(
    "peopleModule",
    "addResource",
    "commonText"
  );
  const { employeeDataChanges } = usePeopleStore((state) => state);
  const [initialResetFlag, setInitialResetFlag] = useState(false);

  const generalDetailsRef = useRef<{
    validateForm: () => Promise<Record<string, string>>;
    submitForm: () => void;
    resetForm: () => void;
  }>();

  const contactDetailsRef = useRef<{
    validateForm: () => Promise<Record<string, string>>;
    submitForm: () => void;
    resetForm: () => void;
  }>();

  const socialMediaDetailsRef = useRef<{
    validateForm: () => Promise<Record<string, string>>;
    submitForm: () => void;
    resetForm: () => void;
  }>();

  const healthAndOtherDetailsRef = useRef<{
    validateForm: () => Promise<Record<string, string>>;
    submitForm: () => void;
    resetForm: () => void;
  }>();

  const handleNext = async () => {
    const generalFormErrors = await generalDetailsRef?.current?.validateForm();
    const contactFormErrors = await contactDetailsRef?.current?.validateForm();
    const socialMediaFormErrors =
      await socialMediaDetailsRef?.current?.validateForm();
    const healthAndOtherFormErrors =
      await healthAndOtherDetailsRef?.current?.validateForm();

    setTimeout(async () => {
      const generalFormIsValid =
        generalFormErrors && Object.keys(generalFormErrors).length === 0;
      const contactFormIsValid =
        contactFormErrors && Object.keys(contactFormErrors).length === 0;
      const socialMediaFormIsValid =
        socialMediaFormErrors &&
        Object.keys(socialMediaFormErrors).length === 0;
      const healthAndOtherFormIsValid =
        healthAndOtherFormErrors &&
        Object.keys(healthAndOtherFormErrors).length === 0;

      if (
        generalFormIsValid &&
        contactFormIsValid &&
        socialMediaFormIsValid &&
        healthAndOtherFormIsValid
      ) {
        await generalDetailsRef?.current?.submitForm();
        await contactDetailsRef?.current?.submitForm();
        await socialMediaDetailsRef?.current?.submitForm();
        await healthAndOtherDetailsRef?.current?.submitForm();
        setUpdateEmployeeStatus?.(EditAllInformationFormStatus.VALIDATED);
        onNext();
      } else {
        setUpdateEmployeeStatus?.(EditAllInformationFormStatus.VALIDATE_ERROR);
        scrollToFirstError(theme);
      }
    }, 0);
  };

  useEffect(() => {
    const resetForms = () => {
      generalDetailsRef?.current?.resetForm();
      contactDetailsRef?.current?.resetForm();
      socialMediaDetailsRef?.current?.resetForm();
      healthAndOtherDetailsRef?.current?.resetForm();
    };

    if (employeeDataChanges > 0) {
      resetForms();
    }
    if (employeeDataChanges === 0 && isSuperAdminEditFlow) {
      setInitialResetFlag(true);
    }
  }, [employeeDataChanges, isSuperAdminEditFlow]);

  useEffect(() => {
    if (updateEmployeeStatus === EditAllInformationFormStatus.TRIGGERED) {
      void handleNext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateEmployeeStatus]);

  useEffect(() => {
    const validateInitialForms = async () => {
      await Promise.all([
        generalDetailsRef?.current?.validateForm(),
        contactDetailsRef?.current?.validateForm(),
        socialMediaDetailsRef?.current?.validateForm(),
        healthAndOtherDetailsRef?.current?.validateForm()
      ]);
    };
    if (isSuperAdminEditFlow && initialResetFlag) {
      void validateInitialForms();
    }
  }, [initialResetFlag, isSuperAdminEditFlow]);

  useEffect(() => {
    scrollToTop();
  }, []);

  return (
    <>
      <Head>
        <title>{translateText(["head"])}</title>
      </Head>
      <GeneralDetailsSection
        ref={generalDetailsRef as any}
        isAdmin={isUpdate}
        isInputsDisabled={isInputsDisabled}
      />
      <ContactDetailsSection
        ref={contactDetailsRef as any}
        isInputsDisabled={isInputsDisabled}
      />
      <FamilyDetailsSection isInputsDisabled={isInputsDisabled} />
      <EducationalDetailsSection isInputsDisabled={isInputsDisabled} />
      <SocialMediaDetailsSection
        ref={socialMediaDetailsRef as any}
        isInputsDisabled={isInputsDisabled}
      />
      <HealthAndOtherDetailsSection
        ref={healthAndOtherDetailsRef as any}
        isInputsDisabled={isInputsDisabled}
      />
      {!isInputsDisabled && (
        <Stack
          direction="row"
          justifyContent="flex-start"
          spacing={2}
          sx={{ padding: "1rem 0" }}
        >
          {isUpdate && (
            <ButtonV2
              variant={"tertiary"}
              onClick={onBack}
              disabled={isSubmitDisabled || isLoading || isInputsDisabled}
              icon={<Icon name={IconName.CLOSE_ICON} />}
              iconPosition="end"
            >
              {translateText(["cancel"])}
            </ButtonV2>
          )}
          <ButtonV2
            variant={"primary"}
            onClick={handleNext}
            disabled={isSubmitDisabled || isLoading || isInputsDisabled}
            isLoading={isLoading}
            data-testid={
              isUpdate
                ? personalDetailsSectionTestId.buttons.saveDetailsBtn
                : personalDetailsSectionTestId.buttons.nextBtn
            }
            icon={
              <Icon
                name={isUpdate ? IconName.SAVE_ICON : IconName.RIGHT_ARROW_ICON}
              />
            }
            iconPosition="end"
          >
            {isUpdate
              ? translateText(["saveDetails"])
              : translateText(["next"])}
          </ButtonV2>
        </Stack>
      )}
    </>
  );
};

export default PersonalDetailsForm;
