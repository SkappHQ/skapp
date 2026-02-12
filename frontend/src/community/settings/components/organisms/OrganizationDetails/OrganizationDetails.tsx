import { Box, Stack, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { FormikProps } from "formik";
import { ChangeEvent, JSX, useCallback } from "react";

import DropdownSearch from "~community/common/components/molecules/DropDownSearch/DropDownSearch";
import InputField from "~community/common/components/molecules/InputField/InputField";
import { DOMAIN } from "~community/common/constants/configs";
import { characterLengths } from "~community/common/constants/stringConstants";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { ThemeTypes } from "~community/common/types/AvailableThemeColors";
import { generateTimezoneList } from "~community/common/utils/dateTimeUtils";
import useGetCountryList from "~community/people/hooks/useGetCountryList";

interface FormValues {
  organizationName: string;
  organizationWebsite: string;
  country: string;
  organizationTimeZone: string;
  companyDomain: string;
  organizationGlobalLogin: string;
  organizationLogo: string;
  themeColor: ThemeTypes;
}

interface OrganizationDetailsProps {
  formik: FormikProps<FormValues>;
  isEnterpriseMode: boolean;
}

const OrganizationDetails = ({
  formik,
  isEnterpriseMode
}: OrganizationDetailsProps): JSX.Element => {
  const translateText = useTranslator("settings");

  const theme: Theme = useTheme();
  const countryList = useGetCountryList();
  const timeZoneList = generateTimezoneList();

  const { values, errors, handleChange, setFieldError, setFieldValue } = formik;

  const handleInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target) {
        setFieldError(event.target.name, "");
      }
    },
    [setFieldError]
  );

  const handleCountrySelect = async (newValue: string): Promise<void> => {
    setFieldError("country", "");
    await setFieldValue("country", newValue);
  };

  const handleTimezoneSelect = async (newValue: string): Promise<void> => {
    await setFieldValue("organizationTimeZone", newValue);
  };

  return (
    <Box>
      <Typography variant="h2" sx={{ pb: "0.75rem", display: "flex" }}>
        {translateText(["organizationDetailsTitle"])}
      </Typography>
      <Stack sx={{ mt: "0.4rem", gap: "0.6rem", width: "31.25rem" }}>
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
      </Stack>
    </Box>
  );
};

export default OrganizationDetails;
