import { useMutation, useQuery } from "@tanstack/react-query";

import { OrganizationCreateType } from "../types/OrganizationCreateTypes";
import authFetch from "../utils/axiosInterceptor";
import { organizationCreateEndpoints } from "./utils/ApiEndpoints";
import { organizationCreateQueryKeys } from "./utils/QueryKeys";

export const useCreateOrganization = (onSuccess: () => void) => {
  return useMutation({
    mutationFn: (organizationData: OrganizationCreateType) =>
      authFetch.post(
        organizationCreateEndpoints.CREATE_ORGANIZATION,
        organizationData
      ),
    onSuccess: onSuccess
  });
};

export const useCheckOrgSetupStatus = () => {
  return useQuery({
    queryKey: organizationCreateQueryKeys.CHECK_ORG_SETUP_STATUS,
    queryFn: () =>
      authFetch.get(organizationCreateEndpoints.CHECK_ORG_SETUP_STATUS)
  });
};

export const useGetOrganization = (isSessionDataAvailable: boolean = true) => {
  return useQuery({
    queryKey: [organizationCreateEndpoints.CREATE_ORGANIZATION],
    queryFn: async () => {
      const { data } = await authFetch.get(
        organizationCreateEndpoints.CREATE_ORGANIZATION
      );
      return data;
    },
    enabled: isSessionDataAvailable,
    refetchOnWindowFocus: false
  });
};
