import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import React, { ChangeEvent } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import InputField from "~community/common/components/molecules/InputField/InputField";
import InputPhoneNumber from "~community/common/components/molecules/InputPhoneNumber/InputPhoneNumber";
import { characterLengths } from "~community/common/constants/stringConstants";
import { ToastType } from "~community/common/enums/ComponentEnums";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import {
  useCheckCompanyNameExists,
  useCreateNewCompany
} from "~community/crm/api/CompanyApi";
import { CRM_ERROR_COMPANY_EXISTS } from "~community/crm/constants/companyConstants";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmCompanyAddFormTypes,
  CrmCompanyCreatePayload
} from "~community/crm/types/CommonTypes";
import { addCompanyValidations } from "~community/crm/utils/companyValidations";
import useGetDefaultCountryCode from "~community/people/hooks/useGetDefaultCountryCode";

const AddCompanyModal: React.FC = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator(
    "crmModule",
    "companies",
    "addCompanyModal"
  );

  const translateToasts = useTranslator(
    "crmModule",
    "companies",
    "companyToastMessages"
  );

  const { setIsCompanyModalOpen } = useCrmStore((store) => ({
    setIsCompanyModalOpen: store.setIsCompanyModalOpen
  }));

  const defaultCountryCode = useGetDefaultCountryCode();

  const initialValues: CrmCompanyAddFormTypes = {
    name: "",
    industry: null,
    website: null,
    address: null,
    countryCode: defaultCountryCode,
    contactNumber: null
  };

  const handleSuccess = () => {
    setSubmitting(false);
    handleCloseModal();
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateToasts(["successTitle"])
    });
  };

  const handleError = (messageKey: string) => {
    setSubmitting(false);
    if (messageKey === CRM_ERROR_COMPANY_EXISTS) {
      setFieldError("name", translateText(["validations", "companyExists"]));
    } else {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateToasts(["errorTitle"]),
        description: translateToasts(["errorDescription"])
      });
    }
  };

  const handleCloseModal = (): void => {
    setIsCompanyModalOpen(false);
  };

  const { mutate: createNewCompany, isPending } = useCreateNewCompany(
    handleSuccess,
    handleError
  );

  const createCompany = (values: CrmCompanyAddFormTypes) => {
    if (companyNameExists === true) {
      setFieldError("name", translateText(["validations", "companyExists"]));
      return;
    }

    const payload: CrmCompanyCreatePayload = {
      name: values.name.trim(),
      industry: values.industry?.trim() || null,
      website: values.website?.trim() || null,
      address: values.address?.trim() || null,
      contactNumber: values.contactNumber
        ? values.countryCode + values.contactNumber?.trim()
        : null
    };

    createNewCompany(payload);
  };

  const formik = useFormik({
    initialValues,
    onSubmit: createCompany,
    validationSchema: addCompanyValidations(translateText),
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
    isSubmitting,
    setFieldError,
    setSubmitting
  } = formik;

  const debouncedCompanyName = useDebounce(values.name.trim(), 500);
  const { data: companyNameExists } = useCheckCompanyNameExists(
    debouncedCompanyName
  );
  const companyExistsError = companyNameExists
    ? translateText(["validations", "companyExists"])
    : "";

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col h-full justify-between gap-[0.625rem]">
          <InputField
            inputName="name"
            value={values.name}
            error={errors.name || companyExistsError}
            label={translateText(["labels", "name"])}
            required
            placeHolder={translateText(["placeholders", "name"])}
            onChange={handleChange}
            onBlur={handleBlur as any}
            ariaLabel={translateText(["ariaLabels", "companyName"])}
            maxLength={characterLengths.NAME_LENGTH}
          />

          <InputPhoneNumber
            label={translateText(["labels", "contactNumber"])}
            value={values.contactNumber || ""}
            countryCodeValue={values.countryCode as string}
            placeHolder={translateText(["placeholders", "contactNumber"])}
            onChangeCountry={async (countryCode: string) => {
              const syntheticEvent = {
                target: { name: "countryCode", value: countryCode }
              } as ChangeEvent<HTMLInputElement>;
              handleChange(syntheticEvent);
            }}
            onChange={async (e: ChangeEvent<HTMLInputElement>) => {
              handleChange(e);
            }}
            error={errors.contactNumber || ""}
            inputName="contactNumber"
            fullComponentStyle={{
              m: 0,
              p: 0
            }}
            ariaLabel={translateText(["ariaLabels", "contactNumber"])}
          />

          <InputField
            inputName="website"
            value={values.website || ""}
            error={errors.website || ""}
            label={translateText(["labels", "website"])}
            placeHolder={translateText(["placeholders", "website"])}
            onChange={handleChange}
            onBlur={handleBlur as any}
            ariaLabel={translateText(["ariaLabels", "website"])}
          />

          <InputField
            inputName="address"
            value={values.address || ""}
            error={errors.address || ""}
            label={translateText(["labels", "address"])}
            placeHolder={translateText(["placeholders", "address"])}
            onChange={handleChange}
            onBlur={handleBlur as any}
            ariaLabel={translateText(["ariaLabels", "address"])}
          />

          <InputField
            inputName="industry"
            value={values.industry || ""}
            error={errors.industry || ""}
            label={translateText(["labels", "industry"])}
            placeHolder={translateText(["placeholders", "industry"])}
            onChange={handleChange}
            onBlur={handleBlur as any}
            ariaLabel={translateText(["ariaLabels", "industry"])}
          />

          <div className="flex flex-row justify-end py-[0.85rem] gap-[1rem]">
            <ButtonV2
              variant="tertiary"
              type="button"
              disabled={isSubmitting}
              onClick={handleCloseModal}
              icon={<Icon name={IconName.CLOSE_ICON} />}
              iconPosition="end"
              aria-label={translateText(["ariaLabels", "cancelAddCompany"])}
            >
              {translateText(["buttons", "cancelAddCompany"])}
            </ButtonV2>
            <ButtonV2
              variant="primary"
              type="submit"
              onClick={() => handleSubmit()}
              disabled={isSubmitting || isPending || companyNameExists === true}
              aria-label={translateText(["ariaLabels", "addCompany"])}
            >
              {translateText(["buttons", "addCompany"])}
            </ButtonV2>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddCompanyModal;
