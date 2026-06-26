import { Close } from "@mui/icons-material";
import { Box, Stack, Typography } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { JSX, useEffect, useState } from "react";

import {
  useGetAttendanceConfiguration,
  useUpdateAttendanceConfiguration
} from "~community/attendance/api/AttendanceAdminApi";
import { AttendanceConfigurationType } from "~community/attendance/types/attendanceTypes";
import Icon from "~community/common/components/atoms/Icon/Icon";
import SwitchRow from "~community/common/components/atoms/SwitchRow/SwitchRow";
import ToastMessage from "~community/common/components/molecules/ToastMessage/ToastMessage";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import GeoFencingSettings from "~enterprise/configurations/components/organisms/GeoFencingSettings/GeoFencingSettings";

import styles from "./styles";

const AttendanceConfiguration = (): JSX.Element => {
  const classes = styles();
  const [config, setConfig] = useState<AttendanceConfigurationType | null>(
    null
  );
  const [initialConfig, setInitialConfig] =
    useState<AttendanceConfigurationType | null>(null);

  const { data: configData } = useGetAttendanceConfiguration();
  const onSuccess = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: attendanceConfigurations(["updateSuccessMessageTitle"]),
      description: attendanceConfigurations(["updateSuccessMessage"])
    });
  };

  const onError = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: attendanceConfigurations(["updateErrorMessageTitle"]),
      description: attendanceConfigurations(["updateErrorMessage"])
    });
  };
  const { mutate: updateConfig, isPending: isSaving } =
    useUpdateAttendanceConfiguration(onSuccess, onError);
  const { toastMessage, setToastMessage } = useToast();

  const attendanceConfigurations = useTranslator(
    "attendanceModule",
    "attendanceConfiguration"
  );

  useEffect(() => {
    if (configData) {
      setConfig(configData);
      setInitialConfig(configData);
    }
  }, [configData]);

  const handleSwitchChange = (
    key: keyof AttendanceConfigurationType,
    checked: boolean
  ) => {
    setConfig((prevConfig) =>
      prevConfig ? { ...prevConfig, [key]: checked } : prevConfig
    );
  };

  const handleSaveBtnClick = () => {
    if (config) {
      updateConfig(config);
    }
  };

  const handleCancelBtnClick = () => {
    setConfig(initialConfig);
  };

  const isFormChanged = () => {
    return JSON.stringify(config) !== JSON.stringify(initialConfig);
  };

  return (
    <>
      <Box>
        <Typography variant="h2" sx={classes.sectionTitle}>
          {attendanceConfigurations(["clockInSettingsTitle"]) ?? ""}
        </Typography>
        <Typography sx={classes.sectionDescription}>
          {attendanceConfigurations(["clockInSettingsDescription"]) ?? ""}
        </Typography>

        <Box sx={classes.container}>
          {config && (
            <>
              <SwitchRow
                label={
                  attendanceConfigurations(["isClockInOnNonWorkingDays"]) ?? ""
                }
                labelId="clock-in-on-non-working-days"
                wrapperStyles={classes.switchWrapper}
                checked={config.isClockInOnNonWorkingDays}
                onChange={(checked) =>
                  handleSwitchChange("isClockInOnNonWorkingDays", checked)
                }
              />
              <SwitchRow
                labelId="clock-in-on-holidays"
                label={attendanceConfigurations(["clockInOnHolidays"]) ?? ""}
                checked={config.isClockInOnCompanyHolidays}
                wrapperStyles={classes.switchWrapper}
                onChange={(checked) =>
                  handleSwitchChange("isClockInOnCompanyHolidays", checked)
                }
              />
              <SwitchRow
                labelId="clock-in-on-leave-days"
                label={attendanceConfigurations(["clockInOnLeaveDays"]) ?? ""}
                checked={config.isClockInOnLeaveDays}
                wrapperStyles={classes.switchWrapper}
                onChange={(checked) =>
                  handleSwitchChange("isClockInOnLeaveDays", checked)
                }
              />
            </>
          )}
        </Box>

        <Typography variant="h2" sx={classes.sectionTitle}>
          {attendanceConfigurations(["timesheetSettingsTitle"]) ?? ""}
        </Typography>
        <Typography sx={classes.sectionDescription}>
          {attendanceConfigurations(["timesheetSettingsDescription"]) ?? ""}
        </Typography>

        <Box sx={classes.container}>
          {config && (
            <SwitchRow
              labelId="auto-approval-for-changes"
              label={
                attendanceConfigurations(["isAutoApprovalForChanges"]) ?? ""
              }
              checked={config.isAutoApprovalForChanges}
              wrapperStyles={classes.switchWrapper}
              onChange={(checked) =>
                handleSwitchChange("isAutoApprovalForChanges", checked)
              }
            />
          )}
        </Box>

        <GeoFencingSettings
          config={config}
          initialConfig={initialConfig}
          onSwitchChange={handleSwitchChange}
        />

        <Stack direction="row" gap="0.75rem" sx={classes.buttonGroup}>
          <ButtonV2
            id="reset-button"
            variant={"tertiary"}
            onClick={handleCancelBtnClick}
            disabled={!isFormChanged()}
            icon={<Close />}
            iconPosition="end"
          >
            {attendanceConfigurations(["cancelButtonText"]) ?? ""}
          </ButtonV2>

          <ButtonV2
            id="save-changes-button"
            variant={"primary"}
            onClick={handleSaveBtnClick}
            disabled={isSaving || !isFormChanged()}
            icon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
            iconPosition="end"
          >
            {attendanceConfigurations(["saveButtonText"]) ?? ""}
          </ButtonV2>
        </Stack>
        <ToastMessage
          {...toastMessage}
          open={toastMessage.open}
          onClose={() => {
            setToastMessage((state) => ({ ...state, open: false }));
          }}
        />
      </Box>
    </>
  );
};

export default AttendanceConfiguration;
