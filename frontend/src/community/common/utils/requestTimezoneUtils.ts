import { useCommonStore } from "~community/common/stores/commonStore";
import { getBrowserTimezone } from "~community/common/utils/dateTimeUtils";

export const getRequestTimezone = (): string =>
  useCommonStore.getState().requestTimezone ?? getBrowserTimezone();
