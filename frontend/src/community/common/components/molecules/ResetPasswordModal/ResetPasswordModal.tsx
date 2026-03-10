import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton, InputAdornment, Stack } from "@mui/material";
import { FormikHelpers, useFormik } from "formik";
import React, { FocusEvent, useState } from "react";

import { useChangePassword } from "~community/common/api/settingsApi";
import Form from "~community/common/components/molecules/Form/Form";
import InputField from "~community/common/components/molecules/InputField/InputField";
import {
  COMMON_ERROR_CANNOT_USE_PREVIOUS_PASSWORDS,
  COMMON_ERROR_OLD_PASSWORD_INCORRECT,
  COMMON_ERROR_SAME_PASSWORD
} from "~community/common/constants/errorMessageKeys";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { changePasswordValidation } from "~community/common/utils/validation";
import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";

import { Button } from "@rootcodelabs/skapp-ui";
import Icon from "../../atoms/Icon/Icon";
import Modal from "../../organisms/Modal/Modal";
import PasswordStrengthMeter from "../PasswordStrengthMeter/PasswordStrengthMeter";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface FormValues {
  currentPassword: string;
  password: string;
  confirmPassword: string;
}

const ResetPasswordModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const translateText = useTranslator("settings");
  const translateAria = useTranslator("commonAria", "modals", "resetPassword");

  const passwordValidationTranslateText = useTranslator(
    "onboarding",
    "resetPassword"
  );
  const { setToastMessage } = useToast();
  const { data: employee } = useGetUserPersonalDetails();

  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    password: false,
    confirmPassword: false
  });

  const togglePasswordVisibility = (
    field: keyof typeof passwordVisibility,
    isVisible: boolean
  ) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: isVisible
    }));
  };

  const initialValues: FormValues = {
    currentPassword: "",
    password: "",
    confirmPassword: ""
  };

  const onSuccess = async () => {
    formik.resetForm();
    setToastMessage({
      open: true,
      toastType: "success",
      title: translateText(["passwordChangeSuccessTitle"]),
      description: translateText(["passwordChangeSuccessDescription"]),
      isIcon: true
    });
  };

  const onSubmit = async (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>
  ) => {
    if (values.password !== values.confirmPassword) {
      setToastMessage({
        open: true,
        toastType: "error",
        title: translateText(["passwordChangeFailedTitle"]),
        description: translateText(["passwordChangeFailedDescription"]),
        isIcon: true
      });
      setSubmitting(false);
      return;
    }

    resetPasswordMutation.mutate({
      oldPassword: values.currentPassword,
      newPassword: values.password
    });
  };

  const formik = useFormik({
    initialValues,
    validationSchema: changePasswordValidation(passwordValidationTranslateText),
    onSubmit,
    validateOnChange: true,
    validateOnBlur: true
  });

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    isSubmitting,
    dirty,
    setFieldError
  } = formik;

  const onError = (error: any) => {
    switch (error.response.data.results[0].messageKey) {
      case COMMON_ERROR_CANNOT_USE_PREVIOUS_PASSWORDS:
        setFieldError("password", translateText(["usedPreviousPasswordError"]));
        break;
      case COMMON_ERROR_SAME_PASSWORD:
        setFieldError("password", translateText(["usedPreviousPasswordError"]));
        break;
      case COMMON_ERROR_OLD_PASSWORD_INCORRECT:
        setFieldError(
          "currentPassword",
          translateText(["currentPasswordError"])
        );
        break;
      default:
        setToastMessage({
          open: true,
          toastType: "error",
          title: translateText(["passwordChangeFailedTitle"]),
          description: translateText(["passwordChangeFailedDescription"]),
          isIcon: true
        });
    }
  };

  const resetPasswordMutation = useChangePassword(
    employee?.employeeId,
    onSuccess,
    onError
  );

  const handleCancel = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Modal
      isModalOpen={isOpen}
      onCloseModal={handleCancel}
      title={translateText(["resetPasswordModalTitle"])}
      icon={<Icon name={IconName.CLOSE_STATUS_POPUP_ICON} />}
    >
      <Form onSubmit={formik.handleSubmit}>
        <Stack sx={{ margin: "auto" }}>
          <InputField
            label={translateText(["currentPasswordLabel"])}
            inputName="currentPassword"
            inputType={passwordVisibility.currentPassword ? "text" : "password"}
            placeHolder={translateText(["currentPasswordPlaceholder"])}
            required
            value={values.currentPassword}
            onChange={handleChange}
            onBlur={(e) =>
              handleBlur(
                e as FocusEvent<HTMLInputElement | HTMLTextAreaElement>
              )
            }
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  sx={{ p: "1rem" }}
                  onMouseDown={() =>
                    togglePasswordVisibility("currentPassword", true)
                  }
                  onMouseUp={() =>
                    togglePasswordVisibility("currentPassword", false)
                  }
                  onMouseLeave={() =>
                    togglePasswordVisibility("currentPassword", false)
                  }
                  aria-label={
                    passwordVisibility.currentPassword
                      ? translateAria(["hidePassword"])
                      : translateAria(["showPassword"])
                  }
                >
                  {passwordVisibility.currentPassword ? (
                    <Visibility />
                  ) : (
                    <VisibilityOff />
                  )}
                </IconButton>
              </InputAdornment>
            }
            error={errors.currentPassword ? errors.currentPassword : ""}
            componentStyle={{ marginTop: "1.25rem" }}
          />
          <InputField
            label={translateText(["newPasswordLabel"])}
            inputName="password"
            inputType={passwordVisibility.password ? "text" : "password"}
            placeHolder={translateText(["newPasswordPlaceholder"])}
            required
            value={values.password}
            onChange={handleChange}
            onBlur={(e) =>
              handleBlur(
                e as FocusEvent<HTMLInputElement | HTMLTextAreaElement>
              )
            }
            error={touched.password && errors.password ? errors.password : ""}
            componentStyle={{ marginTop: "1.25rem" }}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  sx={{ p: "0.75rem", mr: "0.25rem" }}
                  onMouseDown={() => togglePasswordVisibility("password", true)}
                  onMouseUp={() => togglePasswordVisibility("password", false)}
                  onMouseLeave={() =>
                    togglePasswordVisibility("password", false)
                  }
                  aria-label={
                    passwordVisibility.password
                      ? translateAria(["hidePassword"])
                      : translateAria(["showPassword"])
                  }
                >
                  {passwordVisibility.password ? (
                    <Visibility />
                  ) : (
                    <VisibilityOff />
                  )}
                </IconButton>
              </InputAdornment>
            }
          />
          {values.password && (
            <PasswordStrengthMeter password={values.password} />
          )}
          <InputField
            label={translateText(["confirmPasswordLabel"])}
            inputName="confirmPassword"
            inputType={passwordVisibility.confirmPassword ? "text" : "password"}
            placeHolder={translateText(["confirmPasswordPlaceholder"])}
            required
            value={values.confirmPassword}
            onChange={handleChange}
            onBlur={(e) =>
              handleBlur(
                e as FocusEvent<HTMLInputElement | HTMLTextAreaElement>
              )
            }
            componentStyle={{ marginTop: "1.25rem" }}
            error={
              touched.confirmPassword && errors.confirmPassword
                ? errors.confirmPassword
                : ""
            }
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  sx={{ p: "1rem" }}
                  onMouseDown={() =>
                    togglePasswordVisibility("confirmPassword", true)
                  }
                  onMouseUp={() =>
                    togglePasswordVisibility("confirmPassword", false)
                  }
                  onMouseLeave={() =>
                    togglePasswordVisibility("confirmPassword", false)
                  }
                  aria-label={
                    passwordVisibility.confirmPassword
                      ? translateAria(["hidePassword"])
                      : translateAria(["showPassword"])
                  }
                >
                  {passwordVisibility.confirmPassword ? (
                    <Visibility />
                  ) : (
                    <VisibilityOff />
                  )}
                </IconButton>
              </InputAdornment>
            }
          />
          <Button variant={"primary"} disabled={!dirty || isSubmitting} type={"submit"} icon={<Icon name={IconName.RIGHT_ARROW_ICON} />} iconPosition="end">{translateText(["saveChangesBtnText"])}</Button>
          <Button variant={"tertiary"} disabled={false} onClick={handleCancel} icon={<Icon name={IconName.CLOSE_ICON} />} iconPosition="end">{translateText(["cancelBtnText"])}</Button>
        </Stack>
      </Form>
    </Modal>
  );
};

export default ResetPasswordModal;
