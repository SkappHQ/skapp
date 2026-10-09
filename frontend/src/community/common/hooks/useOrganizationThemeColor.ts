import { useEffect } from "react";

import { useGetOrganization } from "~community/common/api/OrganizationCreateApi";
import { ORGANIZATION_THEME_COLOR_KEY } from "~community/common/constants/stringConstants";
import { ThemeTypes } from "~community/common/types/AvailableThemeColors";
import { OrganizationDetailsType } from "~community/common/types/OrganizationCreateTypes";
import {
  getDataFromLocalStorage,
  removeDataFromLocalStorage,
  setDataToLocalStorage
} from "~community/common/utils/accessLocalStorage";

interface OrganizationQueryResponse {
  results?: OrganizationDetailsType[];
}

export const useOrganizationThemeColor = (
  isSessionDataAvailable: boolean = true
): string => {
  const { data } = useGetOrganization(isSessionDataAvailable);
  const organizationDetails = data as OrganizationQueryResponse;
  const themeColor = organizationDetails?.results?.[0]?.themeColor;

  useEffect(() => {
    if (!organizationDetails) return;

    const persist = themeColor
      ? setDataToLocalStorage(ORGANIZATION_THEME_COLOR_KEY, themeColor)
      : removeDataFromLocalStorage(ORGANIZATION_THEME_COLOR_KEY);

    persist.catch(() => {
    });
  }, [organizationDetails, themeColor]);

  return (
    themeColor ||
    getDataFromLocalStorage(ORGANIZATION_THEME_COLOR_KEY) ||
    ThemeTypes.BLUE_THEME
  );
};
