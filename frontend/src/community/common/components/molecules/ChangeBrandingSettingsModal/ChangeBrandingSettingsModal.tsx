import { Stack, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

import { useUploadImages } from "~community/common/api/FileHandleApi";
import { useUpdateOrganizationDetails } from "~community/common/api/settingsApi";
import Button from "~community/common/components/atoms/Button/Button";
import Icon from "~community/common/components/atoms/Icon/Icon";
import ColorInputField from "~community/common/components/molecules/ColorInputField/ColorInputField";
import DragAndDropField from "~community/common/components/molecules/DragAndDropField/DragAndDropField";
import Form from "~community/common/components/molecules/Form/Form";
import Modal from "~community/common/components/organisms/Modal/Modal";
import { appModes } from "~community/common/constants/configs";
import { FileTypes } from "~community/common/enums/CommonEnums";
import {
  ButtonStyle,
  ButtonTypes
} from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { ThemeTypes } from "~community/common/types/AvailableThemeColors";
import { FileUploadType } from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";
import { FileCategories } from "~enterprise/common/types/s3Types";
import { uploadFileToS3ByUrl } from "~enterprise/common/utils/awsS3ServiceFunctions";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  themeColor: ThemeTypes;
  logo: string;
}

interface FormValues {
  organizationLogo: string;
  themeColor: ThemeTypes;
}

const ChangeBrandingSettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  themeColor,
  logo
}) => {
  const translateText = useTranslator("settings");

  const { setToastMessage } = useToast();
  const environment = useGetEnvironment();

  const [formValues, setFormValues] = useState<FormValues>({
    organizationLogo: logo,
    themeColor: themeColor
  });
  const [errors, setErrors] = useState<Partial<FormValues>>({});
  const [companyLogo, setCompanyLogo] = useState<FileUploadType[]>([]);
  const [fileName, setFileName] = useState<string>("");

  const onSuccess = () => {
    setToastMessage({
      open: true,
      toastType: "success",
      title: translateText(["brandingSuccessTitle"]),
      description: translateText(["brandingSuccessDescription"]),
      isIcon: true
    });
    onClose();
  };

  const { mutate: updateBranding, isPending: isUpdating } =
    useUpdateOrganizationDetails(onSuccess);
  const { mutate: uploadImage, isPending: isUploading } = useUploadImages();

  useEffect(() => {
    if (logo) {
      const orgLogo = logo;
      setFormValues({
        organizationLogo: orgLogo || "",
        themeColor: themeColor || ThemeTypes.BLUE_THEME
      });

      if (orgLogo) {
        setFileName(orgLogo);
        setCompanyLogo([
          {
            name: orgLogo,
            path: ""
          }
        ]);
      }
    }
  }, [logo, themeColor]);

  const validateForm = () => {
    const newErrors: Partial<FormValues> = {};

    if (!formValues.themeColor) {
      newErrors.themeColor = ThemeTypes.BLUE_THEME;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (companyLogo.length > 0 && companyLogo[0].file) {
      if (environment === appModes.COMMUNITY) {
        const formData = new FormData();
        formData.append("file", companyLogo[0].file);
        formData.append("type", FileTypes.ORGANIZATION_LOGOS);
        await uploadImage(formData, {
          onSuccess: () => {
            updateBranding({
              organizationLogo: fileName,
              themeColor: formValues.themeColor
            });
          }
        });
      } else {
        const brandPic = await uploadFileToS3ByUrl(
          companyLogo[0].file,
          FileCategories.ORGANIZATION_LOGO
        );

        updateBranding({
          organizationLogo: brandPic,
          themeColor: formValues.themeColor
        });
      }
    } else {
      updateBranding({
        organizationLogo: formValues.organizationLogo,
        themeColor: formValues.themeColor
      });
    }
  };

  const handleFileAttachments = (acceptedFiles: FileUploadType[]): void => {
    setCompanyLogo(acceptedFiles);
    const newFileName = acceptedFiles[0]?.name || "";
    setFileName(newFileName);
    setFormValues((prev) => ({
      ...prev,
      organizationLogo: newFileName
    }));
  };

  const handleColorSelect = (key: string, value: string | number | boolean) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCancel = () => {
    setFileName(logo);
    setCompanyLogo([
      {
        name: logo,
        path: ""
      }
    ]);
    setFormValues({
      organizationLogo: logo,
      themeColor: themeColor
    });
    onClose();
  };

  return (
    <Modal
      isModalOpen={isOpen}
      onCloseModal={handleCancel}
      title={translateText(["brandingSettingsButtonText"])}
      icon={<Icon name={IconName.CLOSE_STATUS_POPUP_ICON} />}
    >
      <Form>
        <Stack sx={{ margin: "auto" }}>
          <Typography
            variant="body1"
            sx={{
              mb: "1.25rem"
            }}
          >
            {logo
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
            onDelete={() => {
              setCompanyLogo([]);
              setFileName("");
              setFormValues((prev) => ({
                ...prev,
                organizationLogo: ""
              }));
            }}
          />
          <ColorInputField
            value={formValues.themeColor}
            error={errors.themeColor || ""}
            inputName="themeColor"
            label={translateText(["themeColorLabel"])}
            tooltip={translateText(["themeColorToolTip"])}
            onSelect={handleColorSelect}
          />
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Button
              label={translateText(["saveChangesBtnText"])}
              buttonStyle={ButtonStyle.PRIMARY}
              endIcon={IconName.RIGHT_ARROW_ICON}
              disabled={isUpdating || isUploading}
              onClick={handleSubmit}
            />
            <Button
              label={translateText(["cancelBtnText"])}
              buttonStyle={ButtonStyle.TERTIARY}
              endIcon={IconName.CLOSE_ICON}
              disabled={isUpdating || isUploading}
              onClick={handleCancel}
              type={ButtonTypes.BUTTON}
            />
          </Stack>
        </Stack>
      </Form>
    </Modal>
  );
};

export default ChangeBrandingSettingsModal;
