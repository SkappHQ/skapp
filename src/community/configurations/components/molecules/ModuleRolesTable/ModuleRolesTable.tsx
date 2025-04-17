import { Box } from "@mui/material";
import { JSX } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import Table from "~community/common/components/molecules/Table/Table";
import { Modules } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import attendanceModuleRolesTableData from "~community/configurations/data/attendanceModuleRolesTableData.json";
import leaveModuleRolesTableData from "~community/configurations/data/leaveModuleRolesTableData.json";
import peopleModuleRolesTableData from "~community/configurations/data/peopleModuleRolesTableData.json";
import { TableNames } from "~enterprise/common/enums/Table";

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

  const transformToTableRows = () => {
    return (
      getTableData()?.map((data, index) => ({
        id: index,
        permission: translateText([data.permission]),
        admin: (
          <>
            {getIcon(data.admin.enabled)}
            {data.admin.viewOnly ? translateText(["viewOnly"]) : ""}
          </>
        ),
        manager: (
          <>
            {getIcon(data.manager.enabled)}
            {data.manager.viewOnly ? translateText(["viewOnly"]) : ""}
          </>
        ),
        employee: (
          <>
            {getIcon(data.employee.enabled)}
            {data.employee.viewOnly ? translateText(["viewOnly"]) : ""}
          </>
        )
      })) || []
    );
  };

  const headers = [
    { id: "permission", label: "" },
    { id: "admin", label: translateText(["adminHeader"]) },
    { id: "manager", label: translateText(["managerHeader"]) },
    { id: "employee", label: translateText(["employeeHeader"]) }
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
        isLoading={false}
      />
    </Box>
  );
};

export default ModuleRolesTable;
