import { InternalAxiosRequestConfig } from "axios";

import { TIMEZONE_HEADER } from "~community/common/constants/configs";
import { useCommonStore } from "~community/common/stores/commonStore";

export const getRequestTimezone = (): string | undefined =>
  useCommonStore.getState().requestTimezone;

export const applyRequestTimezoneHeader = (
  config: InternalAxiosRequestConfig
): void => {
  const requestTimezone = getRequestTimezone();

  if (requestTimezone) {
    config.headers[TIMEZONE_HEADER] = requestTimezone;
  }
};
