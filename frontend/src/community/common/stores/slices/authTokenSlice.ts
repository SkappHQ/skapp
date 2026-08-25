import { SetType } from "~community/common/types/storeTypes";

export interface AuthTokenSliceType {
  accessToken: string | null;
  setAccessToken: (token: string) => void;
  clearAccessToken: () => void;
}

export const authTokenSlice = (
  set: SetType<AuthTokenSliceType>
): AuthTokenSliceType => ({
  accessToken: null,
  setAccessToken: (token: string) =>
    set((state) => ({
      ...state,
      accessToken: token
    })),
  clearAccessToken: () =>
    set((state) => ({
      ...state,
      accessToken: null
    }))
});
