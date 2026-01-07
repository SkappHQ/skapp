import { Stack, Theme, useTheme } from "@mui/material";
import { useFormik } from "formik";
import Link from "next/link";
import { ChangeEvent, useEffect } from "react";

import Button from "~community/common/components/atoms/Button/Button";
import InputField from "~community/common/components/molecules/InputField/InputField";
import ROUTES from "~community/common/constants/routes";
import { characterLengths } from "~community/common/constants/stringConstants";
import { peopleDirectoryTestId } from "~community/common/constants/testIds";
import { ButtonStyle, ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { tenantID } from "~community/common/utils/axiosInterceptor";
import {
  useCheckEmailAndIdentificationNoForQuickAdd,
  useQuickAddEmployeeMutation
} from "~community/people/api/PeopleApi";
import { usePeopleStore } from "~community/people/store/store";
import { QuickAddEmployeePayload } from "~community/people/types/EmployeeTypes";
import { DirectoryModalTypes } from "~community/people/types/ModalTypes";
import { quickAddEmployeeValidations } from "~community/people/utils/peopleValidations";
import { QuickSetupModalTypeEnums } from "~enterprise/common/enums/Common";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";
import { useCommonEnterpriseStore } from "~enterprise/common/store/commonStore";
import { useGetGlobalLoginMethod } from "~enterprise/people/api/GlobalLoginMethodApi";

const AddNewResourceModal = () => {
  const theme: Theme = useTheme();
  const { setToastMessage } = useToast();

  const translateText = useTranslator(
    "peopleModule",
    "addResource",
    "generalDetails"
  );

  const employmentDetailsTexts = useTranslator(
    "peopleModule",
    "addResource",
    "employmentDetails"
  );

  const generalTexts = useTranslator(
    "peopleModule",
    "addResource",
    "commonText"
  );

  const {
    ongoingQuickSetup,
    setQuickSetupModalType,
    stopAllOngoingQuickSetup
  } = useCommonEnterpriseStore((state) => ({
    ongoingQuickSetup: state.ongoingQuickSetup,
    setQuickSetupModalType: state.setQuickSetupModalType,
    stopAllOngoingQuickSetup: state.stopAllOngoingQuickSetup
  }));

  const {
    setDirectoryModalType,
    setIsDirectoryModalOpen,
    setPendingAddResourceData,
    pendingAddResourceData
  } = usePeopleStore((state) => ({
    setDirectoryModalType: state.setDirectoryModalType,
    setIsDirectoryModalOpen: state.setIsDirectoryModalOpen,
    setPendingAddResourceData: state.setPendingAddResourceData,
    pendingAddResourceData: state.pendingAddResourceData
  }));

  const { resetPeopleSlice } = usePeopleStore((state) => state);

  const initialValues = pendingAddResourceData || {
    firstName: "",
    lastName: "",
    email: ""
  };

  const handleSuccess = () => {
    setPendingAddResourceData(null);
    if (ongoingQuickSetup.INVITE_EMPLOYEES) {
      setQuickSetupModalType(QuickSetupModalTypeEnums.IN_PROGRESS_START_UP);
      stopAllOngoingQuickSetup();
    }
  };

  const { mutate, isPending } = useQuickAddEmployeeMutation(handleSuccess);

  const onSubmit = async (values: any) => {
    const payload: QuickAddEmployeePayload = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email
    };

    mutate(payload);
  };

  const formik = useFormik({
    initialValues,
    onSubmit,
    validationSchema: quickAddEmployeeValidations(translateText),
    validateOnChange: false,
    validateOnBlur: true
  });

  const { values, errors, setFieldValue, setFieldError, handleSubmit } = formik;

  const {
    data: checkEmailAndIdentificationNo,
    refetch,
    isSuccess,
    isLoading: isCheckingEmailLoading
  } = useCheckEmailAndIdentificationNoForQuickAdd(values.email, "");

  const closeModal = () => {
    if (pendingAddResourceData) {
      setDirectoryModalType(DirectoryModalTypes.UNSAVED_CHANGES);
      return;
    }
    setDirectoryModalType(DirectoryModalTypes.NONE);
    setIsDirectoryModalOpen(false);
    if (ongoingQuickSetup.INVITE_EMPLOYEES) {
      setQuickSetupModalType(QuickSetupModalTypeEnums.IN_PROGRESS_START_UP);
      stopAllOngoingQuickSetup();
    }
  };

  const env = useGetEnvironment();

  const isEnterpriseMode = env === "enterprise";

  const { data: globalLogin } = useGetGlobalLoginMethod(
    isEnterpriseMode,
    tenantID as string
  );

  const validateWorkEmail = () => {
    const updatedData = checkEmailAndIdentificationNo;
    if (updatedData?.isWorkEmailExists) {
      setFieldError("email", translateText(["uniqueEmailError"]));
      return false;
    }

    if (isEnterpriseMode) {
      if (globalLogin == "GOOGLE" && !updatedData?.isGoogleDomain) {
        setFieldError("email", translateText(["workEmailGoogle"]));
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    if (
      checkEmailAndIdentificationNo &&
      checkEmailAndIdentificationNo.isWorkEmailExists !== null &&
      isSuccess
    ) {
      if (validateWorkEmail()) {
        handleSubmit();
      }
    }
  }, [isEnterpriseMode, checkEmailAndIdentificationNo, isSuccess]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "firstName" || name === "lastName") {
      if (value.length > characterLengths.NAME_LENGTH) {
        return;
      }
    }
    setFieldValue(name, value);
    setFieldError(name, "");

    const updatedValues = {
      ...values,
      [name]: value
    };
    setPendingAddResourceData(updatedValues);
  };

  const handleRefetch = () => {
    if (!navigator.onLine) {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["quickAddErrorTitle"]),
        description: translateText(["quickAddErrorDescription"])
      });
      return;
    }
    refetch();
  };

  return (
    <Stack aria-hidden={true}>
      <Stack
        sx={{
          flexDirection: "row",
          gap: 2
        }}
      >
        <InputField
          inputName="firstName"
          value={values.firstName}
          error={errors.firstName}
          label={translateText(["firstName"])}
          required
          onChange={handleChange}
          maxLength={characterLengths.NAME_LENGTH}
          placeHolder={translateText(["enterFirstName"])}
          labelStyles={{
            fontWeight: 500
          }}
          componentStyle={{ width: "100%" }}
        />
        <InputField
          inputName="lastName"
          value={values.lastName}
          error={errors.lastName}
          label={translateText(["lastName"])}
          required
          placeHolder={translateText(["enterLastName"])}
          onChange={handleChange}
          maxLength={characterLengths.NAME_LENGTH}
          labelStyles={{
            fontWeight: 500
          }}
          componentStyle={{ width: "100%" }}
        />
      </Stack>
      <InputField
        inputName="email"
        value={values.email}
        error={errors.email}
        label={employmentDetailsTexts(["workEmail"])}
        placeHolder={employmentDetailsTexts(["enterWorkEmail"])}
        required
        onChange={handleChange}
        componentStyle={{
          marginTop: 2
        }}
        labelStyles={{
          fontWeight: 500
        }}
      />
      <Link
        href={ROUTES.PEOPLE.ADD}
        onClick={() => {
          setDirectoryModalType(DirectoryModalTypes.NONE);
          setPendingAddResourceData(null);
          resetPeopleSlice();
          setIsDirectoryModalOpen(false);
        }}
        style={{
          fontSize: "0.875rem",
          fontWeight: 500,
          fontFamily: theme.typography.fontFamily,
          textDecoration: "underline",
          color: theme.palette.primary.dark,
          marginTop: "1rem",
          marginLeft: "0.125rem",
          width: "fit-content"
        }}
      >
        {generalTexts(["addFullProfile"])}
      </Link>
      <Button
        buttonStyle={ButtonStyle.PRIMARY}
        label={generalTexts(["save"])}
        endIcon={IconName.FORWARD_ARROW}
        styles={{
          marginTop: 2
        }}
        onClick={handleRefetch}
        disabled={
          values.email === "" ||
          values.firstName === "" ||
          values.lastName === ""
        }
        data-testid={peopleDirectoryTestId.buttons.quickAddSaveBtn}
        shouldBlink={
          ongoingQuickSetup.INVITE_EMPLOYEES &&
          values.email !== "" &&
          values.firstName !== "" &&
          values.lastName !== ""
        }
        isLoading={isCheckingEmailLoading || isPending}
      />
      <Button
        buttonStyle={ButtonStyle.TERTIARY}
        label={generalTexts(["cancel"])}
        endIcon={IconName.CLOSE_ICON}
        styles={{
          marginTop: 2
        }}
        onClick={closeModal}
        data-testid={peopleDirectoryTestId.buttons.quickAddCancelBtn}
      />
    </Stack>
  );
};

export default AddNewResourceModal;
