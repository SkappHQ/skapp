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
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { useCrmStore } from "~community/crm/store/crmStore";
import { CreateCrmCompanyPayload } from "~community/crm/types/CrmCompanyTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { addCompanyValidations } from "~community/crm/utils/companyValidations";
import useGetDefaultCountryCode from "~community/people/hooks/useGetDefaultCountryCode";

const AddCompanyModal: React.FC = () => {
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

  const { setIsAddCompanyModalOpen, setCompanyModalType } = useCrmStore(
    (store) => ({
      setIsAddCompanyModalOpen: store.setIsAddCompanyModalOpen,
      setCompanyModalType: store.setCompanyModalType
    })
  );

  const initialValues: CreateCrmCompanyPayload = {
    name: "",
    industry: "",
    website: "",
    address: "",
    contactNumber: "",
    countryCode: useGetDefaultCountryCode()
  };

  const addCompany = (values: CreateCrmCompanyPayload) => {
    const payload: CreateCrmCompanyPayload = {
      name: values.name.trim(),
      industry: values.industry?.trim() || null,
      website: values.website?.trim() || null,
      address: values.address?.trim() || null,
      contactNumber: values.contactNumber?.trim() || null,
      countryCode: values.countryCode
    };

    console.log("Payload", payload);
    handleCloseModal();
  };

  const formik = useFormik({
    initialValues,
    onSubmit: addCompany,
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

  const handleCloseModal = (): void => {
    setIsAddCompanyModalOpen(false);
    setCompanyModalType(CrmModalTypes.NONE);
  };

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
        < InputField
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

        <InputPhoneNumber
          inputName="contactNumber"
          value={values.contactNumber || ""}
          countryCodeValue={values.countryCode as string}
          error={errors.contactNumber || ""}
          label={translateLabelText(["contactNumber"])}
          placeHolder={translateInputText(["contactNumber"])}
          onChangeCountry={async (countryCode: string) => {
            const syntheticEvent = {
              target: { name: "countryCode", value: countryCode }
            } as ChangeEvent<HTMLInputElement>;
            handleChange(syntheticEvent);
          }}
          onChange={async (e: ChangeEvent<HTMLInputElement>) => {
            handleChange(e);
          }}
          fullComponentStyle={{
            mt: "1rem"
          }}
        />

        < InputField
          inputName="website"
          value={values.website || ""}
          error={errors.website || ""}
          label={translateLabelText(["website"])}
          placeHolder={translateInputText(["website"])}
          onChange={handleChange}
          onBlur={handleBlur as any}
          maxLength={characterLengths.CHARACTER_LENGTH}
        />

        < InputField
          inputName="address"
          value={values.address || ""}
          error={errors.address || ""}
          label={translateLabelText(["address"])}
          placeHolder={translateInputText(["address"])}
          onChange={handleChange}
          onBlur={handleBlur as any}
          maxLength={characterLengths.CHARACTER_LENGTH}
        />

        < InputField
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
