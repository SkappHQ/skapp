import { Box, Divider, Stack } from "@mui/material";
import { useFormik } from "formik";
import { JSX, useEffect, useState } from "react";

import { useUploadImages } from "~community/common/api/FileHandleApi";
import { useGetOrganization } from "~community/common/api/OrganizationCreateApi";
import { useUpdateOrganizationDetails } from "~community/common/api/settingsApi";
import Button from "~community/common/components/atoms/Button/Button";
import Form from "~community/common/components/molecules/Form/Form";
import { appModes } from "~community/common/constants/configs";
import { FileTypes } from "~community/common/enums/CommonEnums";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { ThemeTypes } from "~community/common/types/AvailableThemeColors";
import { FileUploadType } from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import { tenantID } from "~community/common/utils/axiosInterceptor";
import { organizationSetupValidation } from "~community/common/utils/validation";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";
import { FileCategories } from "~enterprise/common/types/s3Types";
import { uploadFileToS3ByUrl } from "~enterprise/common/utils/awsS3ServiceFunctions";
import { useGetGlobalLoginMethod } from "~enterprise/people/api/GlobalLoginMethodApi";

import BrandingDetails from "../BrandingDetails/BrandingDetails";
import OrganizationDetails from "../OrganizationDetails/OrganizationDetails";

const OrganizationSettings = (): JSX.Element => {
  const translateText = useTranslator("settings");
  const onBoardingTranslateText = useTranslator(
    "onboarding",
    "organizationCreate"
  );
  const { setToastMessage } = useToast();
  const environment = useGetEnvironment();
  const isEnterpriseMode = environment === appModes.ENTERPRISE;

  const { data: organizationResponse } = useGetOrganization();
  const organizationDetails = organizationResponse?.results[0];

  const { data: globalLogin } = useGetGlobalLoginMethod(
    isEnterpriseMode,
    tenantID as string
  );

  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<FileUploadType[]>([]);
  const [fileName, setFileName] = useState<string>("");

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
  };

  const {
    mutate: updateOrganizationDetails,
    isPending: isUpdateOrganizationDetailsPending
  } = useUpdateOrganizationDetails(onSuccess);
  const { mutate: uploadImage, isPending: isUploading } = useUploadImages();

  const [initialValues, setInitialValues] = useState({
    organizationName: "",
    organizationWebsite: "",
    country: "",
    organizationTimeZone: "",
    companyDomain: "",
    organizationGlobalLogin: "",
    organizationLogo: "",
    themeColor: ThemeTypes.BLUE_THEME as ThemeTypes
  });

  useEffect(() => {
    if (organizationDetails) {
      const logo = organizationDetails.organizationLogo || "";
      const themeColor =
        organizationDetails.themeColor || ThemeTypes.BLUE_THEME;

      setInitialValues({
        organizationName: organizationDetails.organizationName || "",
        organizationWebsite: organizationDetails.organizationWebsite || "",
        country: organizationDetails.country || "",
        organizationTimeZone: organizationDetails.organizationTimeZone || "",
        companyDomain: tenantID as string,
        organizationGlobalLogin: globalLogin || "",
        organizationLogo: logo,
        themeColor: themeColor
      });

      if (logo) {
        setFileName(logo);
        setCompanyLogo([
          {
            name: logo,
            path: ""
          }
        ]);
      }

      setIsInitialLoadComplete(true);
    }
  }, [organizationDetails, globalLogin]);

  const onSubmit = async (values: typeof initialValues) => {
    if (companyLogo.length > 0 && companyLogo[0].file) {
      if (environment === appModes.COMMUNITY) {
        const formData = new FormData();
        formData.append("file", companyLogo[0].file);
        formData.append("type", FileTypes.ORGANIZATION_LOGOS);
        await uploadImage(formData, {
          onSuccess: () => {
            updateOrganizationDetails({
              organizationName: values.organizationName,
              organizationWebsite: values.organizationWebsite,
              country: values.country,
              organizationTimeZone: values.organizationTimeZone,
              companyDomain: values.companyDomain,
              organizationLogo: fileName,
              themeColor: values.themeColor
            });
          }
        });
      } else {
        const brandPic = await uploadFileToS3ByUrl(
          companyLogo[0].file,
          FileCategories.ORGANIZATION_LOGO
        );

        updateOrganizationDetails({
          organizationName: values.organizationName,
          organizationWebsite: values.organizationWebsite,
          country: values.country,
          organizationTimeZone: values.organizationTimeZone,
          companyDomain: values.companyDomain,
          organizationLogo: brandPic,
          themeColor: values.themeColor
        });
      }
    } else {
      const { organizationLogo, ...updateData } = values;
      updateOrganizationDetails({
        ...updateData,
        organizationLogo: values.organizationLogo
      });
    }
  };

  const OrganisationForm = useFormik({
    initialValues,
    validationSchema: organizationSetupValidation(onBoardingTranslateText),
    onSubmit,
    validateOnChange: false,
    enableReinitialize: true
  });

  const { handleSubmit, resetForm } = OrganisationForm;

  const handleFileAttachments = (acceptedFiles: FileUploadType[]): void => {
    setCompanyLogo(acceptedFiles);
    const newFileName = acceptedFiles[0]?.name || "";
    setFileName(newFileName);
    OrganisationForm.setFieldValue("organizationLogo", newFileName);
  };

  const handleCancel = () => {
    const logo = organizationDetails?.organizationLogo || "";

    setFileName(logo);
    setCompanyLogo(
      logo
        ? [
            {
              name: logo,
              path: ""
            }
          ]
        : []
    );
    resetForm();
  };

  const isLoading = isUpdateOrganizationDetailsPending || isUploading;

  return (
    <Box>
      <Form onSubmit={handleSubmit}>
        <Box
          sx={{
            display: "flex",
            width: "100%",
            gap: "2rem",
            flexDirection: "column"
          }}
        >
          <OrganizationDetails
            formik={OrganisationForm}
            isEnterpriseMode={isEnterpriseMode}
          />
          <Divider />
          <BrandingDetails
            formik={OrganisationForm}
            companyLogo={companyLogo}
            fileName={fileName}
            handleFileAttachments={handleFileAttachments}
          />

          <Stack spacing={2} sx={{ width: "31.25rem" }}>
            <Button
              label={translateText(["saveChangesBtnText"])}
              buttonStyle={ButtonStyle.PRIMARY}
              endIcon={IconName.RIGHT_ARROW_ICON}
              disabled={
                !isInitialLoadComplete || !OrganisationForm.dirty || isLoading
              }
              isLoading={isLoading}
              onClick={() => handleSubmit()}
            />
            <Button
              label={translateText(["cancelBtnText"])}
              buttonStyle={ButtonStyle.TERTIARY}
              endIcon={IconName.CLOSE_ICON}
              disabled={isLoading}
              onClick={handleCancel}
            />
          </Stack>
        </Box>
      </Form>
    </Box>
  );
};

export default OrganizationSettings;
