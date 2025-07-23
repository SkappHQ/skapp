import { Box, Stack, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { useFormik } from "formik";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";

import { useGetOrganization } from "~community/common/api/OrganizationCreateApi";
import { useUpdateOrganizationDetails } from "~community/common/api/settingsApi";
import DropdownSearch from "~community/common/components/molecules/DropDownSearch/DropDownSearch";
import Form from "~community/common/components/molecules/Form/Form";
import InputField from "~community/common/components/molecules/InputField/InputField";
import { DOMAIN, appModes } from "~community/common/constants/configs";
import { characterLengths } from "~community/common/constants/stringConstants";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { tenantID } from "~community/common/utils/axiosInterceptor";
import { generateTimezoneList } from "~community/common/utils/dateTimeUtils";
import { organizationSetupValidation } from "~community/common/utils/validation";
import useGetCountryList from "~community/people/hooks/useGetCountryList";
import { useGetGlobalLoginMethod } from "~enterprise/people/api/GlobalLoginMethodApi";

import Button from "../../atoms/Button/Button";
import Icon from "../../atoms/Icon/Icon";
import Modal from "../../organisms/Modal/Modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ChangeOrganizationSettingsModal: React.FC<Props> = ({
  isOpen,
  onClose
}) => {
  const theme: Theme = useTheme();
  const isEnterpriseMode = process.env.NEXT_PUBLIC_MODE === appModes.ENTERPRISE;

  const translateText = useTranslator("settings");

  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);

  const onBoardingTranslateText = useTranslator(
    "onboarding",
    "organizationCreate"
  );

  const { data: organizationDetails } = useGetOrganization();

  const { data: globalLogin } = useGetGlobalLoginMethod(
    isEnterpriseMode,
    tenantID as string
  );

  const { setToastMessage } = useToast();

  const [initialValues, setInitialValues] = useState({
    organizationName: "",
    organizationWebsite: "",
    country: "",
    organizationTimeZone: "",
    companyDomain: "",
    organizationGlobalLogin: "",
    organizationLogo: ""
  });

  useEffect(() => {
    if (organizationDetails?.results[0]) {
      setInitialValues({
        organizationName: organizationDetails.results[0].organizationName || "",
        organizationWebsite:
          organizationDetails.results[0].organizationWebsite || "",
        country: organizationDetails.results[0].country || "",
        organizationTimeZone:
          organizationDetails.results[0].organizationTimeZone || "",
        companyDomain: tenantID as string,
        organizationGlobalLogin: globalLogin,
        organizationLogo: organizationDetails.results[0].organizationLogo || ""
      });
      setIsInitialLoadComplete(true);
    }
  }, [organizationDetails, globalLogin]);

  const onSuccess = () => {
    setToastMessage({
      open: true,
      toastType: "success",
      title: translateText(["organizationDetailsUpdateSuccessTitle"]),
      description: translateText([
        "organizationDetailsUpdateSuccessDescription"
      ]),
      isIcon: true
    });
    onClose();
  };

  const {
    mutate: updateOrganizationDetails,
    isPending: isUpdateOrganizationDetailsPending
  } = useUpdateOrganizationDetails(onSuccess);

  const countryList = useGetCountryList();
  const onSubmit = async (values: typeof initialValues) => {
    const { organizationLogo: _organizationLogo, ...updateData } = values;
    updateOrganizationDetails(updateData);
  };

  const OrganisationForm = useFormik({
    initialValues,
    validationSchema: organizationSetupValidation(onBoardingTranslateText),
    onSubmit,
    validateOnChange: false,
    enableReinitialize: true
  });

  const { values, errors, handleChange, handleSubmit } = OrganisationForm;

  const handleInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target) {
        OrganisationForm.setFieldError(event.target.name, "");
      }
    },
    [OrganisationForm]
  );

  const handleCountrySelect = async (newValue: string): Promise<void> => {
    OrganisationForm.setFieldError("country", "");
    await OrganisationForm.setFieldValue("country", newValue);
  };

  const handleTimezoneSelect = async (newValue: string): Promise<void> => {
    await OrganisationForm.setFieldValue("organizationTimeZone", newValue);
  };

  const handleCancel = () => {
    OrganisationForm.resetForm();
    onClose();
  };

  const timeZoneList = generateTimezoneList();

  return (
    <Modal
      isModalOpen={isOpen}
      onCloseModal={handleCancel}
      title={translateText(["organizationDetailsButtonText"])}
      icon={<Icon name={IconName.CLOSE_STATUS_POPUP_ICON} />}
    >
      <Form onSubmit={handleSubmit}>
        <Stack sx={{ mt: "0.4rem", gap: "0.6rem" }}>
          <InputField
            label={translateText(["companyName"])}
            inputName="organizationName"
            inputType="text"
            required
            value={values.organizationName}
            placeHolder="Enter company name"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              handleChange(e);
            }}
            onInput={handleInput}
            error={errors.organizationName ?? ""}
            isDisabled={false}
            inputProps={{
              maxLength: characterLengths.ORGANIZATION_NAME_LENGTH
            }}
          />
          <InputField
            label={translateText(["companyWebsite"])}
            inputName="organizationWebsite"
            inputType="text"
            value={values.organizationWebsite}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              handleChange(e);
            }}
            placeHolder="Enter company website"
            onInput={handleInput}
            error={errors.organizationWebsite ?? ""}
          />
          <DropdownSearch
            label={translateText(["country"])}
            inputName={"country"}
            itemList={countryList}
            value={values.country}
            error={errors.country ?? ""}
            placeholder={"Select Country"}
            required={true}
            onChange={(value) => {
              handleCountrySelect(value as string);
            }}
            componentStyle={{ mt: "0rem" }}
          />
          {isEnterpriseMode && (
            <>
              <DropdownSearch
                label={translateText(["timezoneLabel"])}
                inputName={"organizationTimeZone"}
                itemList={timeZoneList}
                value={values.organizationTimeZone}
                error={errors.organizationTimeZone ?? ""}
                isDisabled={true}
                onChange={(value) => {
                  handleTimezoneSelect?.(value as string);
                }}
              />
              <Box sx={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <Box sx={{ flex: 5 }}>
                  <InputField
                    label={translateText(["companyDomainLabel"])}
                    inputName="companyDomain"
                    inputType="text"
                    value={values.companyDomain}
                    isDisabled={true}
                  />
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    marginTop: "1.5rem",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Typography color={theme.palette.text.secondary}>
                    {DOMAIN}
                  </Typography>
                </Box>
              </Box>
              <InputField
                label={translateText(["globalLogin"])}
                inputName="organizationGlobalLogin"
                inputType="text"
                value={values.organizationGlobalLogin}
                isDisabled={true}
              />
            </>
          )}
          <Button
            label={translateText(["saveChangesBtnText"])}
            styles={{ mt: "1rem" }}
            isLoading={isUpdateOrganizationDetailsPending}
            buttonStyle={ButtonStyle.PRIMARY}
            endIcon={IconName.RIGHT_ARROW_ICON}
            disabled={!isInitialLoadComplete || !OrganisationForm.dirty}
            onClick={() => handleSubmit()}
          />
          <Button
            label={translateText(["cancelBtnText"])}
            styles={{ mt: "0.4rem" }}
            buttonStyle={ButtonStyle.TERTIARY}
            endIcon={IconName.CLOSE_ICON}
            disabled={false}
            onClick={handleCancel}
          />
        </Stack>
      </Form>
    </Modal>
  );
};
export default ChangeOrganizationSettingsModal;
