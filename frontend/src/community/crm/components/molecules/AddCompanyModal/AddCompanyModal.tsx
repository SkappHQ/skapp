import { Stack } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import React, { ChangeEvent } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import Form from "~community/common/components/molecules/Form/Form";
import InputField from "~community/common/components/molecules/InputField/InputField";
import InputPhoneNumber from "~community/common/components/molecules/InputPhoneNumber/InputPhoneNumber";
import { characterLengths } from "~community/common/constants/stringConstants";
import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { ToastType } from "~community/common/enums/ComponentEnums";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { useCreateNewCompany } from "~community/crm/api/CompanyApi";
import { useCrmStore } from "~community/crm/store/crmStore";
import { CreateCrmCompanyPayload } from "~community/crm/types/CrmCompanyTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { addCompanyValidations } from "~community/crm/utils/companyValidations";

const AddCompanyModal: React.FC = () => {
  const { setToastMessage } = useToast();

  const translateAria = useTranslator("crmModule", "addCompanyForm");

  const translateLabelText = useTranslator(
    "crmModule",
    "companies",
    "addCompanyModal",
    "labels"
  );
  const translateInputText = useTranslator(
    "crmModule",
    "companies",
    "addCompanyModal",
    "placeholders"
  );
  const translateButton = useTranslator(
    "crmModule",
    "companies",
    "addCompanyModal",
    "buttons"
  );
  const translateValidations = useTranslator(
    "crmModule",
    "companies",
    "addCompanyValidations"
  );
  const translateToasts = useTranslator(
    "crmModule",
    "companies",
    "companyToastMessages"
  );

  const { setIsAddCompanyModalOpen, setCompanyModalType } = useCrmStore(
    (store) => ({
      setIsAddCompanyModalOpen: store.setIsAddCompanyModalOpen,
      setCompanyModalType: store.setCompanyModalType
    })
  );

  const { userId } = useSessionData();

  const initialValues: CreateCrmCompanyPayload = {
    name: "",
    industry: "",
    website: "",
    address: "",
    contactNumber: "",
    createdBy: userId,
    lastModifiedBy: userId
  };

  const handleSuccess = () => {
    handleCloseModal();
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateToasts(["successTitle"]),
      description: translateToasts(["successDescription"])
    });
  };

  const handleError = (error: Error) => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateToasts(["errorTitle"]),
      description: translateToasts(["errorDescription"])
    });
  };

  const handleCloseModal = (): void => {
    setIsAddCompanyModalOpen(false);
    setCompanyModalType(CrmModalTypes.NONE);
  };

  const { mutate: createNewCompany, isPending: isCreatingNewCompany } =
    useCreateNewCompany(handleSuccess, (error: Error) => {
      handleError(error);
    });

  const createCompany = (values: CreateCrmCompanyPayload) => {
    const payload: CreateCrmCompanyPayload = {
      name: values.name.trim(),
      industry: values.industry?.trim() || null,
      website: values.website?.trim() || null,
      address: values.address?.trim() || null,
      contactNumber: values.contactNumber?.trim() || null,
      createdBy: userId,
      lastModifiedBy: userId
    };

    createNewCompany(payload);
  };

  const formik = useFormik({
    initialValues,
    onSubmit: createCompany,
    validationSchema: addCompanyValidations(translateValidations),
    validateOnChange: false,
    validateOnBlur: false,
    enableReinitialize: true
  });

  const {
    values,
    errors,
    handleSubmit,
    handleChange,
    handleBlur,
    isSubmitting
  } = formik;

  return (
    <Form onSubmit={handleSubmit}>
      <Stack
        sx={{
          flexDirection: "column",
          gap: 2,
          zIndex: ZIndexEnums.MODAL
        }}
        role="form"
        aria-label={translateAria(["addCompanyForm"])}
      >
        <InputField
          inputName="name"
          value={values.name}
          error={errors.name || ""}
          label={translateLabelText(["name"])}
          required
          placeHolder={translateInputText(["name"])}
          onChange={handleChange}
          onBlur={handleBlur as any}
          maxLength={characterLengths.NAME_LENGTH}
        />

        <InputField
          inputName="contactNumber"
          value={values.contactNumber || ""}
          label={translateLabelText(["contactNumber"])}
          placeHolder={translateInputText(["contactNumber"])}
          onChange={handleChange}
          onBlur={handleBlur as any}
          maxLength={characterLengths.PHONE_NUMBER_LENGTH_MAX}
        />

        <InputField
          inputName="website"
          value={values.website || ""}
          error={errors.website || ""}
          label={translateLabelText(["website"])}
          placeHolder={translateInputText(["website"])}
          onChange={handleChange}
          onBlur={handleBlur as any}
          maxLength={characterLengths.CHARACTER_LENGTH}
        />

        <InputField
          inputName="address"
          value={values.address || ""}
          error={errors.address || ""}
          label={translateLabelText(["address"])}
          placeHolder={translateInputText(["address"])}
          onChange={handleChange}
          onBlur={handleBlur as any}
          maxLength={characterLengths.CHARACTER_LENGTH}
        />

        <InputField
          inputName="industry"
          value={values.industry || ""}
          error={errors.industry || ""}
          label={translateLabelText(["industry"])}
          placeHolder={translateInputText(["industry"])}
          onChange={handleChange}
          onBlur={handleBlur as any}
          maxLength={characterLengths.CHARACTER_LENGTH}
        />

        <div className="flex flex-row justify-end gap-3 mt-4">
          <ButtonV2
            variant="primary"
            type="submit"
            disabled={isSubmitting}
            icon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
            iconPosition="end"
          >
            {translateButton(["addCompany"])}
          </ButtonV2>
        </div>
      </Stack>
    </Form>
  );
};

export default AddCompanyModal;
