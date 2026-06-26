import { Box, Theme, useTheme } from "@mui/material";
import { useFormik } from "formik";
import { NextPage } from "next";
import { NextRouter, useRouter } from "next/router";
import { ChangeEvent, useCallback, useState } from "react";

import { useUploadImages } from "~community/common/api/FileHandleApi";
import { useCreateOrganization } from "~community/common/api/OrganizationCreateApi";
import FullScreenLoader from "~community/common/components/molecules/FullScreenLoader/FullScreenLoader";
import SetupOrganizationForm from "~community/common/components/organisms/Forms/SignUpForm/SetupOrganizationForm/SetupOrganizationForm";
import OnboardingLayout from "~community/common/components/templates/OnboardingLayout/OnboardingLayout";
import ROUTES from "~community/common/constants/routes";
import { FileTypes } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { themeSelector } from "~community/common/theme/themeSelector";
import { ThemeTypes } from "~community/common/types/AvailableThemeColors";
import {
  FileRejectionType,
  FileUploadType
} from "~community/common/types/CommonTypes";
import { organizationSetupValidation } from "~community/common/utils/validation";
import useGetCountryList from "~community/people/hooks/useGetCountryList";

const SetupOrganization: NextPage = () => {
  const router: NextRouter = useRouter();

  const theme: Theme = useTheme();

  const translateText = useTranslator("onboarding", "organizationCreate");

  const onSuccess = () => {
    router.replace(ROUTES.DASHBOARD.BASE);
  };

  const { mutate: createOrganization, isPending } =
    useCreateOrganization(onSuccess);
  const { mutate: uploadImage } = useUploadImages();

  const [companyLogo, setCompanyLogo] = useState<FileUploadType[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [attachmentError, setAttachmentError] = useState(false);
  const [, setAttachmentErrorList] = useState<FileRejectionType[]>([]);

  const initialValues = {
    organizationName: "",
    organizationWebsite: "",
    country: "",
    organizationLogo: "",
    themeColor: ThemeTypes.BLUE_THEME,
    organizationTimeZone: ""
  };

  const countryList = useGetCountryList();

  const onSubmit = async (values: typeof initialValues) => {
    if (companyLogo.length > 0 && companyLogo[0].file) {
      const formData = new FormData();
      formData.append("file", companyLogo[0].file);
      formData.append("type", FileTypes.ORGANIZATION_LOGOS);
      await uploadImage(formData);
    }

    createOrganization({
      ...values,
      appUrl: window.location.origin
    });
  };

  const OrganisationForm = useFormik({
    initialValues,
    validationSchema: organizationSetupValidation(translateText),
    onSubmit,
    validateOnChange: false
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

  const setTheme = (colorCode: string): void => {
    const updatedTheme = themeSelector(colorCode); // get theme name from color code
    theme.palette.primary.main = updatedTheme.palette.primary.main;
    theme.palette.primary.dark = updatedTheme.palette.primary.dark;
    theme.palette.secondary.main = updatedTheme.palette.secondary.main;
    theme.palette.secondary.dark = updatedTheme.palette.secondary.dark;
  };

  const handleFileAttachments = (acceptedFiles: FileUploadType[]): void => {
    setCompanyLogo(acceptedFiles);
    const newFileName = acceptedFiles[0]?.name || "";
    setFileName(newFileName);
    OrganisationForm.setFieldValue("organizationLogo", newFileName);
  };

  if (isPending) {
    return <FullScreenLoader />;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%"
      }}
    >
      <OnboardingLayout
        heading={translateText(["orgSetUpHeading"])}
        subheadingStyle={{ fontWeight: 600, fontSize: "1.25rem" }}
        onClick={handleSubmit}
        disabled={attachmentError}
        isLoading={isPending}
      >
        <SetupOrganizationForm
          handleSubmit={handleSubmit}
          handleChange={handleChange}
          handleInput={handleInput}
          values={values}
          errors={errors}
          countryArr={countryList}
          handleCountrySelect={handleCountrySelect}
          companyLogo={companyLogo}
          setAttachments={handleFileAttachments}
          fileName={fileName ?? ""}
          setAttachmentErrors={(errors: FileRejectionType[]) => {
            const hasErrors = !!errors?.length;
            setAttachmentError(hasErrors);
            setAttachmentErrorList(errors);
          }}
          label={translateText(["uploadLogoLabel"])}
          onSelect={(key: string, value: string | number | boolean) => {
            OrganisationForm.setFieldValue(key, value);
            setTheme(value as string);
          }}
          colorInputValue={initialValues.themeColor}
          handleTimezoneSelect={(value: string) => {
            OrganisationForm.setFieldValue("organizationTimeZone", value);
          }}
        />
      </OnboardingLayout>
    </Box>
  );
};

export default SetupOrganization;
