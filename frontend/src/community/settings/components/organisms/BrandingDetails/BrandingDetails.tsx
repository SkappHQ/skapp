import { Box, Stack, Typography } from "@mui/material";
import { FormikProps } from "formik";
import { JSX } from "react";

import ColorInputField from "~community/common/components/molecules/ColorInputField/ColorInputField";
import DragAndDropField from "~community/common/components/molecules/DragAndDropField/DragAndDropField";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { ThemeTypes } from "~community/common/types/AvailableThemeColors";
import { FileUploadType } from "~community/common/types/CommonTypes";

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

interface BrandingDetailsProps {
  formik: FormikProps<FormValues>;
  companyLogo: FileUploadType[];
  fileName: string;
  handleFileAttachments: (files: FileUploadType[]) => void;
}

const BrandingDetails = ({
  formik,
  companyLogo,
  fileName,
  handleFileAttachments,
}: BrandingDetailsProps): JSX.Element => {
  const translateText = useTranslator("settings");

  const { values, errors, setFieldValue } = formik;

  const handleColorSelect = (key: string, value: string | number | boolean) => {
    setFieldValue(key, value);
  };

  return (
    <Box>
      <Typography variant="h2" sx={{ pb: "0.75rem", display: "flex" }}>
        {translateText(["brandingSettingsTitle"])}
      </Typography>
      <Stack sx={{ width: "31.25rem" }}>
        <Typography
          variant="body1"
          sx={{
            mb: "1.25rem"
          }}
        >
          {values.organizationLogo
            ? translateText(["companylogoLabel"])
            : translateText(["uploadLogoLabel"])}
        </Typography>
        <DragAndDropField
          setAttachments={handleFileAttachments}
          fileName={fileName}
          accept={{ "image/*": [".png", ".jpeg"] }}
          supportedFiles=".png .jpeg"
          uploadableFiles={companyLogo}
          isZeroFilesErrorRequired={false}
        />
        <ColorInputField
          value={values.themeColor}
          error={(errors.themeColor as string) || ""}
          inputName="themeColor"
          label={translateText(["themeColorLabel"])}
          tooltip={translateText(["themeColorToolTip"])}
          onSelect={handleColorSelect}
        />
      </Stack>
    </Box>
  );
};

export default BrandingDetails;
