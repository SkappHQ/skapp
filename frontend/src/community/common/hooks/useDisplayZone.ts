import { useGetOrganization } from "~community/common/api/OrganizationCreateApi";
import { OrganizationDetailsType } from "~community/common/types/OrganizationCreateTypes";
import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";

interface OrganizationQueryResponse {
  results?: OrganizationDetailsType[];
}

const useOrganizationTimeZone = (): string | undefined => {
  const { data } = useGetOrganization();
  const organization = (data as OrganizationQueryResponse | undefined)
    ?.results?.[0];

  return organization?.organizationTimeZone || undefined;
};

export const useBusinessZone = (): string | undefined =>
  useOrganizationTimeZone();

export const useDisplayZone = (): string | undefined => {
  const { data: employee } = useGetUserPersonalDetails();
  const organizationTimeZone = useOrganizationTimeZone();

  return employee?.timeZone || organizationTimeZone;
};
