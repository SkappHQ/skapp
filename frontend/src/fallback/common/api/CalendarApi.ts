export const useGetOrganizationCalendarStatus = () => {
  return {
    data: undefined
  };
};

export const useIsGoogleCalendarConnected = () => {
  return {
    data: false
  };
};

export const useConnectGoogleCalendar = (
  _onSuccess: (data: { authUrl?: string }) => void,
  _onError: () => void
) => {
  return {
    mutate: (_frontendRedirectUrl: string) => {},
    isPending: false
  };
};

export const useIsMicrosoftCalendarConnected = () => {
  return {
    data: false
  };
};
