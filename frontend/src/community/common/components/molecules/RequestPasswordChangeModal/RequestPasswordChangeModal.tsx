import { Stack, Typography } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import React, { useEffect } from "react";

import {
  useCheckEmail,
  useRequestPasswordChange
} from "~community/common/api/ResetPasswordApi";
import Form from "~community/common/components/molecules/Form/Form";
import InputField from "~community/common/components/molecules/InputField/InputField";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { RequestPasswordChangeValidationSchema } from "~community/common/utils/validation";

import Icon from "../../atoms/Icon/Icon";
import Modal from "../../organisms/Modal/Modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const RequestPasswordChangeModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const translateText = useTranslator("onboarding", "signIn");
  const { setToastMessage } = useToast();

  const { mutateAsync: checkEmailExists } = useCheckEmail(
    (data) => data,
    () => false
  );

  const validationSchema = RequestPasswordChangeValidationSchema(
    translateText,
    async (email) => {
      try {
        return await checkEmailExists({ email });
      } catch {
        return false;
      }
    }
  );

  const onSuccess = () => {
    setToastMessage({
      open: true,
      toastType: "success",
      title: translateText(["passwordChangeRequestSuccessTitle"]),
      description: translateText(["passwordChangeRequestSuccessDescription"]),
      isIcon: true
    });
    onClose();
  };

  const onError = () => {
    setToastMessage({
      open: true,
      toastType: "error",
      title: translateText(["passwordChangeRequestErrorTitle"]),
      description: translateText(["passwordChangeRequestErrorDescription"]),
      isIcon: true
    });
  };

  const { mutate: requestPasswordChange } = useRequestPasswordChange(
    onSuccess,
    onError
  );

  const formik = useFormik({
    initialValues: {
      email: ""
    },
    validationSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      try {
        setStatus(null);
        requestPasswordChange({ email: values.email });
      } catch (error) {
        setStatus({ error: translateText(["passwordChangeRequestError"]) });
      } finally {
        setSubmitting(false);
      }
    }
  });

  useEffect(() => {
    if (isOpen) {
      formik.resetForm({
        values: { email: "" },
        errors: {},
        touched: {},
        status: null
      });
    }
  }, [isOpen]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = event.target;
    formik.setFieldError(name, "");
    formik.setStatus(null);
    formik.handleChange(event);
  };

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Modal
      isModalOpen={isOpen}
      onCloseModal={handleClose}
      title={translateText(["requestPasswordChangeTitle"])}
      icon={<Icon name={IconName.CLOSE_STATUS_POPUP_ICON} />}
    >
      <>
        <Typography>
          {translateText(["requestPasswordChangeDescription"])}
        </Typography>
        <Form onSubmit={formik.handleSubmit}>
          <Stack sx={{ gap: "1rem", mt: "1rem" }}>
            <InputField
              label={translateText(["emailAddressLabel"])}
              inputName="email"
              inputType="email"
              value={formik.values.email}
              placeHolder={translateText(["emailAddressPlaceholder"])}
              onChange={handleChange}
              required
              error={formik.touched.email ? formik.errors.email : ""}
              isDisabled={formik.isSubmitting}
              labelStyles={{ fontWeight: 500 }}
            />
            <ButtonV2
              variant={"primary"}
              disabled={formik.isSubmitting}
              onClick={formik.submitForm}
              icon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
              iconPosition="end"
            >
              {translateText(["sendRequestButtonText"])}
            </ButtonV2>
          </Stack>
        </Form>
      </>
    </Modal>
  );
};

export default RequestPasswordChangeModal;
