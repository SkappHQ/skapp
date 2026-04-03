import { Box } from "@mui/material";
import { JSX } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import Table from "~community/common/components/molecules/Table/Table";
import { Modules } from "~community/common/enums/CommonEnums";
import { TableNames } from "~community/common/enums/Table";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import attendanceModuleRolesTableData from "~community/configurations/data/attendanceModuleRolesTableData.json";
import esignatureModuleRolesTableData from "~community/configurations/data/esignatureModuleRolesTableData.json";
import invoiceModuleRolesTableData from "~community/configurations/data/invoiceModuleRolesTableData.json";
import leaveModuleRolesTableData from "~community/configurations/data/leaveModuleRolesTableData.json";
import peopleModuleRolesTableData from "~community/configurations/data/peopleModuleRolesTableData.json";
import projectManagementModuleRolesTableData from "~community/configurations/data/projectManagementModuleRolesTableData.json";

import styles from "./styles";

interface Props {
  module: Modules;
}

const ModuleRolesTable = ({ module }: Props): JSX.Element => {
  const classes = styles();

  const translateText = useTranslator("configurations", "userRoles");

  const getTableData = () => {
    switch (module) {
      case Modules.ATTENDANCE:
        return attendanceModuleRolesTableData;
      case Modules.LEAVE:
        return leaveModuleRolesTableData;
      case Modules.PEOPLE:
        return peopleModuleRolesTableData;
      case Modules.ESIGN:
        return esignatureModuleRolesTableData;
      case Modules.INVOICE:
        return invoiceModuleRolesTableData;
      case Modules.PM:
        return projectManagementModuleRolesTableData;
      default:
        return [];
    }
  };

  const getIcon = (status: boolean) => {
    return status ? (
      <Icon name={IconName.CURVED_TICK_ICON} />
    ) : (
      <Icon name={IconName.DASH_ICON} />
    );
  };

  const getRoleLabel = (role: {
    enabled: boolean;
    viewOnly: boolean;
    label?: string;
  }) => {
    if (role.label) return translateText([role.label]);
    if (role.viewOnly) return translateText(["viewOnly"]);
    return "";
  };

  const transformToTableRows = () => {
    return (
      getTableData()?.map((data, index) => ({
        id: index,
        permission: translateText([data.permission]),
        admin: (
          <>
            {getIcon(data.admin.enabled)}
            {getRoleLabel(data.admin)}
          </>
        ),
        ...("manager" in data && {
          manager: (
            <>
              {getIcon(data.manager.enabled)}
              {getRoleLabel(data.manager)}
            </>
          )
        }),
        ...("employee" in data && {
          employee: (
            <>
              {getIcon(data.employee.enabled)}
              {getRoleLabel(data.employee)}
            </>
          )
        })
      })) || []
    );
  };

  const headers = [
    { id: "permission", label: "" },
    { id: "admin", label: translateText(["adminHeader"]) }
  ];

  if (module !== Modules.INVOICE && module !== Modules.PM) {
    headers.push({
      id: "manager",
      label:
        module === Modules.ESIGN
          ? translateText(["senderHeader"])
          : translateText(["managerHeader"])
    });
  }

  if (module !== Modules.INVOICE) {
    headers.push({
      id: "employee",
      label: translateText(["employeeHeader"])
    });
  }

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
        isLoading={false}
      />
    </Box>
  );
};

export default ModuleRolesTable;
