import { useGetOrganization } from "~community/common/api/OrganizationCreateApi";
import { OrganizationDetailsType } from "~community/common/types/OrganizationCreateTypes";
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

export const useEntryZone = (): string =>
  useDisplayZone() ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
