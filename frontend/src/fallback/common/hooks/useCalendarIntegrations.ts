export interface OrganizationCalendarStatus {
  isGoogleCalendarEnabled: boolean;
  isMicrosoftCalendarEnabled: boolean;
}

interface CalendarIntegrationConfig {
  id: string;
  type: string;
  isConnected: boolean;
  onToggle: () => void;
  onDisconnect: () => void;
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  btnLoading: boolean;
}

export const useCalendarIntegrations = (
  frontendRedirectUrl: string,
  organizationCalendarStatusData: OrganizationCalendarStatus | undefined,
  globalLoginMethod: string,
  setCurrentCalendarType?: (type: string) => void
) => {
  return {
    integrationConfigs: [] as CalendarIntegrationConfig[]
  };
};
