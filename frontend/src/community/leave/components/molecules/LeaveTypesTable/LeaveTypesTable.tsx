import { Box } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { useRouter } from "next/router";
import { useEffect } from "react";

import Table from "~community/common/components/molecules/Table/Table";
import ROUTES from "~community/common/constants/routes";
import { TableNames } from "~community/common/enums/Table";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { getEmoji } from "~community/common/utils/commonUtil";
import { useGetLeaveTypes } from "~community/leave/api/LeaveTypesApi";
import { LeaveTypeFormTypes } from "~community/leave/enums/LeaveTypeEnums";
import { useLeaveStore } from "~community/leave/store/store";
import { LeaveTypeType } from "~community/leave/types/AddLeaveTypes";
import { getLeaveTypeDurationTableContent } from "~community/leave/utils/leaveTypes/LeaveTypeUtils";

import styles from "./styles";

const LeaveTypesTable = () => {
  const theme: Theme = useTheme();
  const classes = styles(theme);

  const translateText = useTranslator("leaveModule", "leaveTypes");

  const router = useRouter();

  const { allLeaveTypes, setEditingLeaveType, setAllLeaveTypes } =
    useLeaveStore((state) => state);

  const { data: leaveTypes, isFetching: isLeaveTypesFetching } =
    useGetLeaveTypes();

  const columns = [
    { field: "leaveTypeName", headerName: translateText(["nameHeader"]) },
    { field: "durations", headerName: translateText(["durationsHeader"]) },
    {
      field: "carriedForward",
      headerName: translateText(["carriedForwardHeader"])
    }
  ];

  const tableHeaders = columns.map((col) => ({
    id: col.field,
    label: col.headerName
  }));

  const transformToTableRows = () => {
    return (
      (leaveTypes as LeaveTypeType[])?.map((leaveType: LeaveTypeType) => ({
        id: (
          <div
            style={{
              backgroundColor: theme.palette.common.white,
              borderRadius: "9.375rem",
              padding: "0.5rem 1rem"
            }}
          >
            {leaveType?.typeId}
          </div>
        ),
        leaveTypeName: (
          <div
            style={{
              backgroundColor: theme.palette.common.white,
              borderRadius: "9.375rem",
              padding: "0.5rem 1rem"
            }}
          >
            <span role="img" aria-hidden="true">
              {getEmoji(leaveType?.emojiCode || "")}
            </span>
            &nbsp;
            {leaveType?.name}
          </div>
        ),
        durations: getLeaveTypeDurationTableContent(
          leaveType?.leaveDuration
        ).map((duration: string, index: number) => (
          <div
            key={index}
            style={{
              backgroundColor: theme.palette.common.white,
              borderRadius: "9.375rem",
              padding: "0.5rem 1rem",
              marginRight: "0.5rem"
            }}
          >
            {duration}
          </div>
        )),
        carriedForward: (
          <div
            style={{
              backgroundColor: theme.palette.common.white,
              borderRadius: "9.375rem",
              padding: "0.5rem 1rem"
            }}
          >
            {leaveType?.isCarryForwardEnabled
              ? translateText(["enabled"])
              : translateText(["disabled"])}
          </div>
        ),
        actionData: leaveType,
        ariaLabel: {
          editButton: translateText(["editButton.label"], {
            recordName: leaveType?.name
          })
        },
        ariaDescription: {
          editButton: translateText(["editButton.description"], {
            recordName: leaveType?.name
          })
        }
      })) || []
    );
  };

  const handleEditTeam = (leaveType: LeaveTypeType): void => {
    setEditingLeaveType(leaveType);
    router.push(ROUTES.LEAVE.ADD_EDIT_LEAVE_TYPES(LeaveTypeFormTypes.EDIT));
  };

  useEffect(() => {
    setAllLeaveTypes(leaveTypes ?? []);
  }, [leaveTypes, setAllLeaveTypes]);

  return (
    <Box sx={classes.tableWrapper}>
      <Table
        tableName={TableNames.LEAVE_TYPES}
        headers={tableHeaders}
        rows={transformToTableRows()}
        tableHead={{
          customStyles: {
            row: classes.tableHead,
            cell: classes.tableHeaderCell
          }
        }}
        tableBody={{
          loadingState: {
            skeleton: {
              rows: 6
            }
          },
          actionColumn: {
            isEnabled: true,
            actionBtns: {
              left: {
                onClick: (leaveType) => handleEditTeam(leaveType)
              }
            }
          }
        }}
        tableFoot={{
          pagination: {
            isEnabled: false
          }
        }}
        customStyles={{
          container: classes.tableContainer
        }}
        isLoading={isLeaveTypesFetching}
      />
    </Box>
  );
};

export default LeaveTypesTable;
