import { Stack, Typography } from "@mui/material";
import React, { ChangeEvent } from "react";

import ColorInputField from "~community/common/components/molecules/ColorInputField/ColorInputField";
import DragAndDropField from "~community/common/components/molecules/DragAndDropField/DragAndDropField";
import DropdownSearch from "~community/common/components/molecules/DropDownSearch/DropDownSearch";
import Form from "~community/common/components/molecules/Form/Form";
import InputField from "~community/common/components/molecules/InputField/InputField";
import { characterLengths } from "~community/common/constants/stringConstants";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  DropdownListType,
  FileRejectionType,
  FileUploadType
} from "~community/common/types/CommonTypes";
import { generateTimezoneList } from "~community/common/utils/dateTimeUtils";

import { styles } from "./styles";

interface Props {
  handleSubmit: () => void;
  handleChange: (event: React.SyntheticEvent) => void;
  handleInput: (e: ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  errors: { [key: string]: string };
  values: any;
  countryArr: DropdownListType[];
  handleCountrySelect: (newValue: string) => void;
  companyLogo: FileUploadType[];
  setAttachmentErrors?: (errors: FileRejectionType[]) => void;
  setAttachments: (acceptedFiles: FileUploadType[]) => void;
  fileName?: string;
  label?: string;
  onSelect?: (key: string, value: string | number | boolean) => void;
  colorInputValue: string | number | boolean;
  handleTimezoneSelect: (value: string) => void;
}

const SetupOrganizationForm: React.FC<Props> = ({
  handleSubmit,
  handleChange,
  handleInput,
  errors,
  values,
  countryArr,
  handleCountrySelect,
  companyLogo,
  setAttachments,
  setAttachmentErrors,
  fileName,
  label,
  onSelect,
  colorInputValue,
  handleTimezoneSelect
}) => {
  const translateText = useTranslator("onboarding", "organizationCreate");
  const classes = styles();

  const timeZoneList = generateTimezoneList();

  return (
    <Stack sx={classes.container}>
      <Form onSubmit={handleSubmit}>
        <Stack sx={{ margin: "auto" }}>
          <Typography
            sx={{
              lineHeight: "2rem",
              fontWeight: 600,
              fontSize: "1.25rem"
            }}
          >
            {translateText(["orgDetailsSubHeading"])}
          </Typography>
          <InputField
            label={translateText(["companyNameLabel"])}
            inputName="organizationName"
            inputType="text"
            required
            value={values.organizationName}
            placeHolder="Enter company name"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              handleChange(e);
            }}
            componentStyle={classes.textInputStyle}
            onInput={handleInput}
            error={errors.organizationName ?? ""}
            isDisabled={false}
            inputProps={{
              maxLength: characterLengths.ORGANIZATION_NAME_LENGTH
            }}
          />
          <InputField
            label={translateText(["companyWebsiteLabel"])}
            inputName="organizationWebsite"
            inputType="text"
            value={values.organizationWebsite}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              handleChange(e);
            }}
            placeHolder="Enter company website"
            componentStyle={classes.tedxtInputStyle}
            onInput={handleInput}
            error={errors.organizationWebsite ?? ""}
          />
          <DropdownSearch
            label={translateText(["countryLabel"])}
            inputName={"country"}
            itemList={countryArr}
            value={values.country}
            error={errors.country ?? ""}
            placeholder={"Select Country"}
            required={true}
            onChange={(value) => {
              handleCountrySelect(value as string);
            }}
          />
          <DropdownSearch
            label={translateText(["timezoneLabel"])}
            inputName={"organizationTimeZone"}
            itemList={timeZoneList}
            value={values.organizationTimeZone}
            error={errors.organizationTimeZone ?? ""}
            placeholder={"Select Timezone"}
            required={true}
            onChange={(value) => {
              handleTimezoneSelect?.(value as string);
            }}
          />
          <Typography
            sx={{
              marginTop: "1.25rem",
              lineHeight: "2rem",
              fontWeight: 600,
              fontSize: "1.25rem"
            }}
          >
            {translateText(["brandingSubHeading"])}
          </Typography>
          <DragAndDropField
            setAttachments={setAttachments}
            fileName={fileName}
            setAttachmentErrors={setAttachmentErrors}
            accept={{ "image/*": [".png", ".gif", ".jpeg", ".jpg"] }}
            supportedFiles={".png .svg"}
            uploadableFiles={companyLogo}
            isZeroFilesErrorRequired={false}
            label={label}
          />
          <ColorInputField
            value={colorInputValue}
            error=""
            inputName="themeColor"
            label={translateText(["themeColorLabel"])}
            tooltip={translateText(["themeColorTooltip"])}
            onSelect={onSelect}
          />
        </Stack>
      </Form>
    </Stack>
  );
};
export default SetupOrganizationForm;
