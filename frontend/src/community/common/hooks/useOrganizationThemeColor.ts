import { useEffect } from "react";

import { useGetOrganization } from "~community/common/api/OrganizationCreateApi";
import { ORGANIZATION_THEME_COLOR_KEY } from "~community/common/constants/stringConstants";
import { ThemeTypes } from "~community/common/types/AvailableThemeColors";
import {
  getDataFromLocalStorage,
  removeDataFromLocalStorage,
  setDataToLocalStorage
} from "~community/common/utils/accessLocalStorage";

export const useOrganizationThemeColor = (
  isSessionDataAvailable: boolean = true
): string => {
  const { data: organizationDetails } = useGetOrganization(
    isSessionDataAvailable
  );
  const themeColor = organizationDetails?.results?.[0]?.themeColor;

  useEffect(() => {
    if (!organizationDetails) return;

    const persist = themeColor
      ? setDataToLocalStorage(ORGANIZATION_THEME_COLOR_KEY, themeColor)
      : removeDataFromLocalStorage(ORGANIZATION_THEME_COLOR_KEY);

    persist.catch(() => {
    });
  }, [organizationDetails, themeColor]);

  if (organizationDetails) return themeColor || ThemeTypes.BLUE_THEME;

  return (
    getDataFromLocalStorage(ORGANIZATION_THEME_COLOR_KEY) ||
    ThemeTypes.BLUE_THEME
  );
};
