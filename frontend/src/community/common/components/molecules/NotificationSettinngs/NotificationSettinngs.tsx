import { Box, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { useAuth } from "~community/common/context/AuthContext";
import { JSX } from "react";

import {
  useGetNotificationSettings,
  useUpdateNotificationSettings
} from "~community/common/api/settingsApi";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { EmployeeTypes } from "~community/common/types/AuthTypes";

import SwitchRow from "../../atoms/SwitchRow/SwitchRow";
import ToastMessage from "../ToastMessage/ToastMessage";

const NotificationSettings = (): JSX.Element => {
  const translateText = useTranslator("settings");
  const { toastMessage, setToastMessage } = useToast();

  const { data: settings } = useGetNotificationSettings();

  const { data: session } = useAuth();

  const updateMutation = useUpdateNotificationSettings(() => {
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["notificationSettingsUpdateSuccessTitle"]),
      description: translateText([
        "notificationSettingsUpdateSuccessDescription"
      ]),
      isIcon: true
    });
  });

  const handleSwitchChange = (checked: boolean, type: string) => {
    if (!settings) return;

    const updatedSettings = { ...settings, [type]: checked };
    updateMutation.mutate(updatedSettings);
  };

  return (
    <Box>
      <Typography variant="h2">
        {translateText(["notificationSettingsTitle"])}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          mt: 2
        }}
      >
        {translateText(["notificationSettingsDescription"])}
      </Typography>
      <Box
        sx={{
          width: "100%",
          maxWidth: "32.875rem"
        }}
      >
        <Stack
          sx={{
            flexDirection: "column",
            gap: "1.5rem",
            my: "1rem"
          }}
        >
          {settings &&
            Object.keys(settings).map((key, index) => {
              if (
                index === 0 &&
                !session?.user?.roles?.includes(EmployeeTypes.LEAVE_EMPLOYEE)
              ) {
                return null;
              }
              if (
                index === 1 &&
                !session?.user?.roles?.includes(
                  EmployeeTypes.ATTENDANCE_EMPLOYEE
                )
              ) {
                return null;
              }
              return (
                <SwitchRow
                  labelId={translateText([key])}
                  key={key}
                  label={translateText([key])}
                  checked={settings[key]}
                  onChange={(checked: boolean) =>
                    handleSwitchChange(checked, key)
                  }
                />
              );
            })}
        </Stack>
      </Box>
      <ToastMessage
        {...toastMessage}
        open={toastMessage.open}
        onClose={() => {
          setToastMessage((state) => ({ ...state, open: false }));
        }}
      />
    </Box>
  );
};

export default NotificationSettings;
