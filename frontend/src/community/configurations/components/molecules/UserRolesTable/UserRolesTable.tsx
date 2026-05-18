import { Box, useTheme } from "@mui/material";
import { useRouter } from "next/router";
import { JSX, useMemo } from "react";

import { useAuth } from "~community/auth/providers/AuthProvider";
import BasicChip from "~community/common/components/atoms/Chips/BasicChip/BasicChip";
import Table from "~community/common/components/molecules/Table/Table";
import ROUTES from "~community/common/constants/routes";
import { Modules } from "~community/common/enums/CommonEnums";
import { TableNames } from "~community/common/enums/Table";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { EmployeeTypes } from "~community/common/types/AuthTypes";
import { useGetAllUserRoles } from "~community/configurations/api/userRolesApi";
import {
  AllUserRolesResponseType,
  AllUserRolesType,
  UserRoleTableType
} from "~community/configurations/types/UserRolesTypes";
import { mapApiModuleToEnum } from "~community/configurations/utils/userRoles/apiUtils";

import styles from "./styles";

const UserRolesTable = (): JSX.Element => {
  const theme = useTheme();
  const classes = styles(theme);

  const router = useRouter();

  const translateText = useTranslator("configurations", "userRoles");

  const { data: allUserRoles, isPending: isUserRolesPending } =
    useGetAllUserRoles();

  const { user } = useAuth();

  const formattedUserRoles = useMemo(() => {
    if (allUserRoles !== undefined && allUserRoles?.length > 0) {
      const formattedUserRoles = allUserRoles
        ?.filter((role: AllUserRolesResponseType) => {
          if (role?.module?.toUpperCase() === Modules.OKR) {
            return false;
          }
          if (role?.module?.toUpperCase() === Modules.LEAVE) {
            return user?.roles?.includes(EmployeeTypes.LEAVE_EMPLOYEE);
          }
          if (role?.module?.toUpperCase() === Modules.ATTENDANCE) {
            return user?.roles?.includes(EmployeeTypes.ATTENDANCE_EMPLOYEE);
          }
          if (role?.module?.toUpperCase() === Modules.CRM) {
            return false;
          }

          return true;
        })
        .map((role: AllUserRolesResponseType) => {
          const moduleEnum = mapApiModuleToEnum(role.module);
          const moduleDisplayNames: Record<string, string> = {
            [Modules.ATTENDANCE]: translateText(["timeAndAttendance"]),
            [Modules.PEOPLE]: translateText(["people"]),
            [Modules.LEAVE]: translateText(["leave"]),
            [Modules.ESIGN]: translateText(["eSignature"]),
            [Modules.INVOICE]: translateText(["invoice"]),
            [Modules.PM]: translateText(["projectManagement"])
          };

          return {
            ...role,
            name: moduleDisplayNames[moduleEnum]
          };
        });
      return formattedUserRoles;
    } else {
      return [];
    }
  }, [allUserRoles, translateText, user?.roles?.length]);

  const transformToTableRows = (): UserRoleTableType[] => {
    return (
      formattedUserRoles?.map((userRoleData: AllUserRolesType) => ({
        id: userRoleData.module.toLowerCase(),
        module: (
          <BasicChip
            key={userRoleData.module}
            label={userRoleData.name}
            chipStyles={classes.moduleChipStyles}
          />
        ),
        roles: userRoleData.roles?.map((role, index) => (
          <BasicChip
            key={role}
            label={role}
            chipStyles={classes.roleChipStyles(
              index,
              userRoleData.roles.length - 1
            )}
          />
        ))
      })) || []
    );
  };

  const headers = [
    { id: "module", label: translateText(["moduleHeader"]) },
    { id: "roles", label: translateText(["roleHeader"]) }
  ];

  return (
    <Box sx={classes.container}>
      <Table
        tableName={TableNames.MODULE_ROLES}
        headers={headers}
        rows={transformToTableRows()}
        tableFoot={{
          pagination: {
            isEnabled: false
          }
        }}
        tableBody={{
          onRowClick: (row) =>
            router.push(ROUTES.CONFIGURATIONS.USER_ROLES_MODULE(row.id))
        }}
        isLoading={isUserRolesPending}
      />
    </Box>
  );
};

export default UserRolesTable;
