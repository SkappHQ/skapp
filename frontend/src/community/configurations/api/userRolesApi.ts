import { UseQueryResult, useMutation, useQuery } from "@tanstack/react-query";

import { Modules } from "~community/common/enums/CommonEnums";
import authFetch from "~community/common/utils/axiosInterceptor";
import { userRolesEndPoints } from "~community/configurations/api/utils/ApiEndpoints";
import { userRolesQueryKeys } from "~community/configurations/api/utils/QueryKeys";
import {
  AllUserRolesResponseType,
  AllowedGrantableRolesType,
  UserRoleRestrictionsType
} from "~community/configurations/types/UserRolesTypes";

import { transformRolesToDropdownFormat } from "../utils/userRoles/apiUtils";

export const useGetAllUserRoles = (): UseQueryResult<
  AllUserRolesResponseType[]
> => {
  return useQuery({
    queryKey: userRolesQueryKeys.USER_ROLES,
    queryFn: () => authFetch.get(userRolesEndPoints.GET_USER_ROLES),
    select: (data) => {
      const allUserRoles = data?.data?.results || [];

      return allUserRoles;
    }
  });
};

export const getUserRoleRestrictions = async (module: Modules) => {
  const data = await authFetch.get(
    userRolesEndPoints.GET_USER_ROLE_RESTRICTIONS(module)
  );

  return data.data.results[0];
};

export const useGetUserRoleRestrictions = (
  module: Modules
): UseQueryResult<UserRoleRestrictionsType> => {
  return useQuery({
    queryKey: userRolesQueryKeys.USER_ROLE_RESTRICTIONS(module),
    queryFn: () => getUserRoleRestrictions(module),
    select: (data) => data
  });
};

export const useUpdateUserRoleRestrictions = (
  onSuccess: () => void,
  onError: () => void
) => {
  return useMutation({
    mutationFn: (payload: UserRoleRestrictionsType) => {
      return authFetch.patch(
        userRolesEndPoints.UPDATE_USER_ROLE_RESTRICTIONS,
        payload
      );
    },
    onSuccess: () => {
      onSuccess();
    },
    onError
  });
};

export const getSuperAdminCount = async () => {
  const data = await authFetch.get(userRolesEndPoints.SUPER_ADMIN_COUNT);

  return data.data.results?.[0];
};

export const useGetSuperAdminCount = () => {
  return useQuery({
    queryFn: getSuperAdminCount,
    queryKey: userRolesQueryKeys.SUPER_ADMIN_COUNT
  });
};

export const useGetAllowedGrantablePermissions =
  (): UseQueryResult<AllowedGrantableRolesType> => {
    return useQuery({
      queryFn: () =>
        authFetch.get(userRolesEndPoints.GET_ALLOWED_GRANTABLE_PERMISSIONS),
      queryKey: userRolesQueryKeys.ALLOWED_GRANTABLE_PERMISSIONS,
      select: (data) => {
        const dropDownListData =
          transformRolesToDropdownFormat(data?.data?.results) || [];

        return dropDownListData;
      }
    });
  };
