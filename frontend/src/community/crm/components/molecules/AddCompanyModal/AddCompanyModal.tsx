import { Stack } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import React, { ChangeEvent, useEffect } from "react";

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
import {
  useCheckCompanyNameExists,
  useCreateNewCompany
} from "~community/crm/api/CompanyApi";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmCompanyAddFormTypes,
  CrmCompanyCreatePayload
} from "~community/crm/types/CommonTypes";
import { addCompanyValidations } from "~community/crm/utils/companyValidations";
import useGetDefaultCountryCode from "~community/people/hooks/useGetDefaultCountryCode";

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

  const { setIsAddCompanyModalOpen } = useCrmStore((store) => ({
    setIsAddCompanyModalOpen: store.setIsAddCompanyModalOpen
  }));

  const { userId } = useSessionData();

  const initialValues: CrmCompanyAddFormTypes = {
    name: "",
    industry: "",
    website: "",
    address: "",
    countryCode: useGetDefaultCountryCode(),
    contactNumber: ""
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
  };

  const { mutate: createNewCompany, isPending: isCreatingNewCompany } =
    useCreateNewCompany(handleSuccess, (error: Error) => {
      handleError(error);
    });

  const createCompany = (values: CrmCompanyAddFormTypes) => {
    if (companyNameExists === true) {
      setFieldError("name", translateValidations(["companyExists"]));
      return;
    }

    const payload: CrmCompanyCreatePayload = {
      name: values.name.trim(),
      industry: values.industry?.trim() || null,
      website: values.website?.trim() || null,
      address: values.address?.trim() || null,
      contactNumber: values.contactNumber
        ? values.countryCode + values.contactNumber?.trim()
        : null,
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
    isSubmitting,
    setFieldError
  } = formik;

  const { data: companyNameExists, refetch: refetchCompanyNameExists } =
    useCheckCompanyNameExists(values.name);

  useEffect(() => {
    if (values.name && values.name.trim() !== "") {
      const timeoutId = setTimeout(() => {
        refetchCompanyNameExists().then(() => {
          if (companyNameExists === true) {
            setFieldError("name", translateValidations(["companyExists"]));
          } else {
            setFieldError("name", "");
          }
        });
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [values.name, refetchCompanyNameExists, companyNameExists]);

  return (
    <div>
      <Form onSubmit={handleSubmit}>
        {/* <Stack
          sx={{
            flexDirection: "column",
            gap: 2,
            zIndex: ZIndexEnums.MODAL
          }}
          role="form"
          aria-label={translateAria(["addCompanyForm"])}
        > */}
        <div className="flex flex-col h-full justify-between gap-[0.625rem]">
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

          <InputPhoneNumber
            label={translateLabelText(["contactNumber"])}
            value={values.contactNumber || ""}
            countryCodeValue={values.countryCode as string}
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
            error={errors.contactNumber || ""}
            inputName="contactNumber"
            fullComponentStyle={{
              m:0,p:0
            }}
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

          <div className="flex flex-row justify-end py-[0.85rem] gap-[1rem]">
            <ButtonV2
              variant="tertiary"
              type="button"
              disabled={isSubmitting || companyNameExists === true}
              onClick={handleCloseModal}
              icon={<Icon name={IconName.CLOSE_ICON} />}
              iconPosition="end"
            >
              {translateButton(["cancelAddCompany"])}
            </ButtonV2>
            <ButtonV2
              variant="primary"
              type="submit"
              disabled={isSubmitting || companyNameExists === true}
            >
              {translateButton(["addCompany"])}
            </ButtonV2>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default AddCompanyModal;
