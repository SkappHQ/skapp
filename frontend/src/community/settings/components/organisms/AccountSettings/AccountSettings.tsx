import { Box, Typography } from "@mui/material";
import { JSX, useEffect, useState } from "react";

import GoogleCalendarIcon from "~community/common/assets/Icons/GoogleCalendarIcon";
import OutlookIcon from "~community/common/assets/Icons/OutlookIcon";
import SettingsSection from "~community/common/components/organisms/Settings/Settings";
import SettingsModalController from "~community/common/components/organisms/SettingsModalController/SettingsModalController";
import {
  CalendarType,
  GlobalLoginMethod
} from "~community/common/enums/CommonEnums";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import CalendarDisconnectModal from "~community/people/components/molecules/CalendarDisconnectModal/CalendarDisconnectModal";
import { useGetOrganizationCalendarStatus } from "~enterprise/common/api/CalendarApi";
import IntegrationSettings from "~enterprise/common/components/organisms/IntegrationSettings/IntegrationSettings";
import { useCalendarIntegrations } from "~enterprise/common/hooks/useCalendarIntegrations";
import { useCalendarNotifications } from "~enterprise/common/hooks/useCalendarNotifications";
import { useCommonEnterpriseStore } from "~enterprise/common/store/commonStore";
import LanguagePreferenceSection from "~enterprise/settings/components/molecules/LanguagePreference/LanguagePreference";

// Integration metadata for rendering
const INTEGRATION_METADATA = {
  [CalendarType.GOOGLE]: {
    icon: <GoogleCalendarIcon />,
    titleKey: "googleCalendarText",
    descriptionKey: "googleCalendarDes"
  },
  [CalendarType.MICROSOFT]: {
    icon: <OutlookIcon />,
    titleKey: "outlookCalendarText",
    descriptionKey: "outlookCalendarDes"
  }
} as const;

const AccountSettings = (): JSX.Element => {
  const translateText = useTranslator("settings");
  const { isEmployee } = useSessionData();

  const { globalLoginMethod } = useCommonEnterpriseStore((state) => ({
    globalLoginMethod: state.globalLoginMethod
  }));

  const [frontendRedirectUrl, setFrontendRedirectUrl] = useState<string>("");

  const { data: organizationCalendarStatusData } =
    useGetOrganizationCalendarStatus();

  // hook for calendar configurations
  const { integrationConfigs } = useCalendarIntegrations(
    frontendRedirectUrl,
    organizationCalendarStatusData,
    globalLoginMethod
  );
  const { showNotification } = useCalendarNotifications();

  // Derived state
  const shouldShowIntegrations =
    (globalLoginMethod === GlobalLoginMethod.GOOGLE ||
      globalLoginMethod === GlobalLoginMethod.MICROSOFT ||
      globalLoginMethod === GlobalLoginMethod.CREDENTIALS) &&
    isEmployee;

  useEffect(() => {
    if (typeof globalThis !== "undefined" && globalThis.location) {
      const currentUrl = new URL(globalThis.location.href);
      // Remove any existing calendar-related params to get a clean base URL
      currentUrl.searchParams.delete("success");
      currentUrl.searchParams.delete("error");
      currentUrl.searchParams.delete("type");
      currentUrl.searchParams.delete("status");

      setFrontendRedirectUrl(currentUrl.href.toString());
    }
  }, []);

  // Handle calendar URL parameters and notifications
  useEffect(() => {
    if (typeof globalThis !== "undefined" && globalThis.location) {
      const params = new URLSearchParams(globalThis.location.search);

      const success = params.get("success") ?? undefined;
      const error = params.get("error") ?? undefined;
      const type = params.get("type") ?? undefined;

      if (success || error) {
        showNotification({ success, error, type });
      }
    }
  }, [showNotification]);

  return (
    <>
      <SettingsSection
        customSettingsComponent={<LanguagePreferenceSection />}
      />
      <SettingsModalController />

      {integrationConfigs.length > 0 && (
        <Box sx={{ mb: "6.25rem" }}>
          {!shouldShowIntegrations && (
            <Box sx={{ pb: "1.5rem" }}>
              <Typography variant="h2">
                {translateText(["integrationTitle"])}
              </Typography>
            </Box>
          )}

          {integrationConfigs.map((config) => {
            const metadata = INTEGRATION_METADATA[config.type];

            return (
              <div key={config.id}>
                <IntegrationSettings
                  icon={metadata.icon}
                  title={translateText([metadata.titleKey])}
                  description={translateText([metadata.descriptionKey])}
                  isConnected={config.isConnected}
                  onToggleConnection={config.onToggle}
                  btnLoading={config.btnLoading}
                />

                <CalendarDisconnectModal
                  isModalOpen={config.modalOpen}
                  onCloseModal={() => config.setModalOpen(false)}
                  onConfirmDisconnect={config.onDisconnect}
                  calendarType={config.type}
                />
              </div>
            );
          })}
        </Box>
      )}
    </>
  );
};

export default AccountSettings;
