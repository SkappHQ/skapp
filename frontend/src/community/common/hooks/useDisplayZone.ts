import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { useGetOrganization } from "~community/common/api/OrganizationCreateApi";
import { useCommonStore } from "~community/common/stores/commonStore";
import { OrganizationDetailsType } from "~community/common/types/OrganizationCreateTypes";
import { getRequestTimezone } from "~community/common/utils/requestTimezoneUtils";
import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";

interface OrganizationQueryResponse {
  results?: OrganizationDetailsType[];
}

export const useOrganizationZone = (): string | undefined => {
  const { data } = useGetOrganization();
  const organization = (data as OrganizationQueryResponse | undefined)
    ?.results?.[0];

  return organization?.organizationTimeZone || undefined;
};

export const useDisplayZone = (): string | undefined => {
  const { data: employee } = useGetUserPersonalDetails();
  const organizationZone = useOrganizationZone();

  return employee?.timeZone || organizationZone;
};

export const useSyncRequestTimezone = (): void => {
  const displayZone = useDisplayZone();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!displayZone || displayZone === getRequestTimezone()) {
      return;
    }

    useCommonStore.getState().setRequestTimezone(displayZone);
    void queryClient.invalidateQueries();
  }, [displayZone, queryClient]);
};
