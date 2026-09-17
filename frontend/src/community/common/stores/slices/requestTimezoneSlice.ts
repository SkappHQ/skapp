import { SetType } from "~community/common/types/storeTypes";

export interface RequestTimezoneSliceType {
  requestTimezone?: string;
  setRequestTimezone: (timezone: string) => void;
}

export const requestTimezoneSlice = (
  set: SetType<RequestTimezoneSliceType>
): RequestTimezoneSliceType => ({
  setRequestTimezone: (timezone: string) =>
    set((state) => ({
      ...state,
      requestTimezone: timezone
    }))
});
