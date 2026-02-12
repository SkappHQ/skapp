import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useCommonStore } from "../stores/commonStore";
import authFetch from "../utils/axiosInterceptor";
import {
  authenticationEndpoints,
  emailServerConfigEndpoints,
  notificationEndpoints,
  organizationCreateEndpoints
} from "./utils/ApiEndpoints";
import {
  emailServerConfigQueryKeys,
  notificationQueryKeys
} from "./utils/QueryKeys";

export const useGetNotificationSettings = () => {
  return useQuery({
    queryKey: notificationQueryKeys.GET_NOTIFICATION_SETTINGS,
    queryFn: async () => {
      const response = await authFetch.get(
        notificationEndpoints.GET_NOTIFICATION_SETTINGS
      );
      return response.data.results[0];
    }
  });
};

export const useUpdateNotificationSettings = (onSuccess: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updatedSettings) =>
      authFetch.patch(
        notificationEndpoints.UPDATE_NOTIFICATION_SETTINGS,
        updatedSettings
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.GET_NOTIFICATION_SETTINGS
      });
      onSuccess();
    }
  });
};

export const useGetEmailServerConfig = (isEnterpriseMode: boolean) => {
  return useQuery({
    queryKey: [emailServerConfigQueryKeys.EMAIL_SERVER_CONFIG],
    queryFn: async () => {
      const response = await authFetch.get(
        emailServerConfigEndpoints.GET_EMAIL_SERVER_CONFIG
      );
      return response.data.results[0].emailConfigs;
    },
    enabled: !isEnterpriseMode
  });
};

export const useUpdateEmailServerConfig = (onSuccess: () => void) => {
  const queryClient = useQueryClient();
  const { setModalOpen } = useCommonStore((state) => state);
  return useMutation<
    void,
    Error,
    {
      emailServiceProvider: string;
      username: string;
      appPassword: string;
      portNumber: number;
      isEnabled: boolean;
    }
  >({
    mutationFn: (updatedConfig) =>
      authFetch.patch(
        emailServerConfigEndpoints.UPDATE_EMAIL_SERVER_CONFIG,
        updatedConfig
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [emailServerConfigQueryKeys.EMAIL_SERVER_CONFIG]
      });
      onSuccess();
      setModalOpen(false);
    }
  });
};

export const useTestEmailServer = (onSuccess: () => void) => {
  const { setModalOpen } = useCommonStore((state) => state);
  return useMutation<
    void,
    Error,
    { email: string; subject: string; body: string }
  >({
    mutationFn: (emailDetails) =>
      authFetch.post(
        emailServerConfigEndpoints.TEST_EMAIL_SERVER,
        emailDetails
      ),
    onSuccess: () => {
      onSuccess();
      setModalOpen(false);
    }
  });
};

export const useChangePassword = (
  employeeId: string | number | undefined,
  onSuccess: () => void,
  onError: (error: unknown) => void
) => {
  const { setModalOpen } = useCommonStore((state) => state);
  return useMutation({
    mutationFn: (data: { oldPassword: string; newPassword: string }) =>
      authFetch.patch(
        authenticationEndpoints.CHANGE_PASSWORD(employeeId as string),
        data
      ),
    onSuccess: () => {
      setModalOpen(false);
      onSuccess();
    },
    onError: (error) => {
      onError(error);
    }
  });
};

export const useUpdateOrganizationDetails = (onSuccess: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updatedSettings: {
      organizationName?: string;
      organizationWebsite?: string;
      country?: string;
      organizationTimeZone?: string;
      companyDomain?: string;
      organizationLogo?: string | null;
      themeColor?: string;
    }) =>
      authFetch.patch(
        organizationCreateEndpoints.CREATE_ORGANIZATION,
        updatedSettings
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [organizationCreateEndpoints.CREATE_ORGANIZATION]
      });
      onSuccess();
    }
  });
};
