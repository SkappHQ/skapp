export const useIsGoogleCalendarConnected = () => {
  return {
    data: false
  };
};

export const useGetOrganizationCalendarStatus = () => {
  return {
    data: null,
    isLoading: false,
    error: null
  };
};
