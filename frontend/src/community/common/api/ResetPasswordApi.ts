import { useMutation } from "@tanstack/react-query";

import authFetch from "../utils/axiosInterceptor";
import { authenticationEndpoints } from "./utils/ApiEndpoints";

interface ResetPasswordData {
  newPassword: string;
}

export const useResetPassword = (
  onSuccess: () => void,
  onError: (error: unknown) => void
) => {
  return useMutation({
    mutationFn: (data: ResetPasswordData) =>
      authFetch.post(authenticationEndpoints.RESET_PASSWORD, data),
    onSuccess,
    onError
  });
};

interface CheckEmailData {
  email: string;
}

export const useCheckEmail = (
  onSuccess: (data: boolean) => void,
  onError: (error: unknown) => void
) => {
  return useMutation({
    mutationFn: async (data: CheckEmailData) => {
      const response = await authFetch.get(
        authenticationEndpoints.CHECK_EMAIL,
        {
          params: data
        }
      );
      return response.data.results[0];
    },
    onSuccess,
    onError
  });
};

export const useRequestPasswordChange = (
  onSuccess: () => void,
  onError: (error: unknown) => void
) => {
  return useMutation({
    mutationFn: (data: CheckEmailData) =>
      authFetch.get(authenticationEndpoints.REQUEST_PASSWORD_CHANGE, {
        params: data
      }),
    onSuccess,
    onError
  });
};
