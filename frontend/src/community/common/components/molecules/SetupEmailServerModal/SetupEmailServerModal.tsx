import { SelectChangeEvent, Stack } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import React, { useEffect, useRef } from "react";

import {
  useGetEmailServerConfig,
  useUpdateEmailServerConfig
} from "~community/common/api/settingsApi";
import Form from "~community/common/components/molecules/Form/Form";
import InputField from "~community/common/components/molecules/InputField/InputField";
import {
  DEFAULT_PORT,
  DISABLED_PORT,
  EmailProvider,
  characterLengths
} from "~community/common/constants/stringConstants";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { emailServerSetupValidation } from "~community/common/utils/validation";

import Icon from "../../atoms/Icon/Icon";
import SwitchRow from "../../atoms/SwitchRow/SwitchRow";
import Modal from "../../organisms/Modal/Modal";
import DropdownList from "../DropdownList/DropdownList";

const EMAIL_PROVIDERS = [
  { value: "smtp.gmail.com", label: EmailProvider.GMAIL },
  { value: "smtp.mail.yahoo.com", label: EmailProvider.YAHOO },
  { value: "smtp.office365.com", label: EmailProvider.OUTLOOK }
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface FormValues {
  isEnabled: boolean;
  emailServiceProvider: string;
  username: string;
  appPassword: string;
  portNumber: string;
}

const SetupEmailServerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const translateText = useTranslator("settings");
  const { data: config } = useGetEmailServerConfig();

  const { setToastMessage } = useToast();

  const onSuccess = () => {
    setToastMessage({
      open: true,
      toastType: "success",
      title: translateText(["emailConfigSuccessTitle"]),
      description: translateText(["emailConfigSuccessDescription"]),
      isIcon: true
    });
    onClose();
  };
  const mutation = useUpdateEmailServerConfig(onSuccess);
  const initialLoadDone = useRef(false);

  const initialValues: FormValues = {
    isEnabled: false,
    emailServiceProvider: "",
    username: "",
    appPassword: "",
    portNumber: DISABLED_PORT
  };

  const validationSchema = emailServerSetupValidation(translateText);

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: async (values) => {
      mutation.mutate({
        ...values,
        portNumber:
          values.portNumber === DISABLED_PORT ? 0 : Number(values.portNumber)
      });
    }
  });

  useEffect(() => {
    if (config && !initialLoadDone.current) {
      const configValues = {
        ...config,
        portNumber: config.portNumber
          ? config.portNumber.toString()
          : DISABLED_PORT
      };
      formik.setValues(configValues);
      formik.setTouched({});
      formik.setStatus({ initialized: true });
      initialLoadDone.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  useEffect(() => {
    if (formik.values.isEnabled && formik.values.emailServiceProvider) {
      formik.setFieldValue("portNumber", DEFAULT_PORT, false);
    }
  }, [formik, formik.values.emailServiceProvider, formik.values.isEnabled]);

  const handleSwitchChange = (checked: boolean) => {
    formik.setFieldValue("isEnabled", checked);
    formik.setStatus({ initialized: false });

    if (checked && formik.values.emailServiceProvider) {
      formik.setFieldValue("portNumber", DEFAULT_PORT, false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    formik.setStatus({ initialized: false });
    formik.handleChange(event);
  };

  const handleDropdownChange = (event: SelectChangeEvent) => {
    formik.setStatus({ initialized: false });
    formik.setFieldValue("emailServiceProvider", event.target.value as string);
  };

  const handleCancel = () => {
    if (config) {
      const configValues = {
        ...config,
        portNumber: config.portNumber
          ? config.portNumber.toString()
          : DISABLED_PORT
      };
      formik.setValues(configValues);
      formik.setStatus({ initialized: true });
      formik.setTouched({});
    } else {
      formik.resetForm();
    }
    onClose();
  };

  const hasUserChanges = !formik.status?.initialized && formik.dirty;
  const isSubmitDisabled = mutation.isPending || !hasUserChanges;

  return (
    <Modal
      isModalOpen={isOpen}
      onCloseModal={handleCancel}
      title={translateText(["setupEmailServerModalTitle"])}
      icon={<Icon name={IconName.CLOSE_STATUS_POPUP_ICON} />}
    >
      <Form onSubmit={formik.handleSubmit}>
        <Stack sx={{ gap: "1rem", mt: "0.5rem" }}>
          <SwitchRow
            labelId="enable-email-server"
            label={translateText(["enableEmailServerLabel"])}
            checked={formik.values.isEnabled}
            onChange={(checked: boolean) => handleSwitchChange(checked)}
            name="isEnabled"
          />
          <DropdownList
            label={translateText(["emailServiceProviderLabel"])}
            isDisabled={!formik.values.isEnabled}
            id="emailServiceProvider"
            inputName="emailServiceProvider"
            itemList={EMAIL_PROVIDERS}
            value={formik.values.emailServiceProvider}
            onChange={handleDropdownChange}
            error={
              formik.touched.emailServiceProvider &&
              formik.errors.emailServiceProvider &&
              formik.values.isEnabled
                ? formik.errors.emailServiceProvider
                : ""
            }
            placeholder={translateText(["emailServiceProviderPlaceholder"])}
            required={formik.values.isEnabled}
            checkSelected
          />
          <InputField
            label={translateText(["usernameLabel"])}
            inputName="username"
            inputType="text"
            required={formik.values.isEnabled}
            isDisabled={!formik.values.isEnabled}
            value={formik.values.username}
            placeHolder={translateText(["usernamePlaceholder"])}
            onChange={handleInputChange}
            error={
              formik.touched.username &&
              formik.errors.username &&
              formik.values.isEnabled
                ? formik.errors.username
                : ""
            }
            inputProps={{
              maxLength: characterLengths.ORGANIZATION_NAME_LENGTH
            }}
          />
          <InputField
            label={translateText(["appPasswordLabel"])}
            required={formik.values.isEnabled}
            inputName="appPassword"
            placeHolder={translateText(["appPasswordPlaceholder"])}
            inputType="password"
            isDisabled={!formik.values.isEnabled}
            value={formik.values.appPassword}
            onChange={handleInputChange}
            error={
              formik.touched.appPassword &&
              formik.errors.appPassword &&
              formik.values.isEnabled
                ? formik.errors.appPassword
                : ""
            }
          />
          <InputField
            label={translateText(["portNumberLabel"])}
            inputName="portNumber"
            inputType="number"
            isDisabled={true}
            value={formik.values.portNumber}
            onChange={handleInputChange}
            error={
              formik.touched.portNumber &&
              formik.errors.portNumber &&
              formik.values.isEnabled
                ? formik.errors.portNumber
                : ""
            }
          />
          <ButtonV2
            variant={"primary"}
            disabled={isSubmitDisabled}
            type={"submit"}
            icon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
            iconPosition="end"
          >
            {translateText(["saveChangesBtnText"])}
          </ButtonV2>
          <ButtonV2
            variant={"tertiary"}
            onClick={handleCancel}
            icon={<Icon name={IconName.CLOSE_ICON} />}
            iconPosition="end"
          >
            {translateText(["cancelBtnText"])}
          </ButtonV2>
        </Stack>
      </Form>
    </Modal>
  );
};

export default SetupEmailServerModal;
