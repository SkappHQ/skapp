import { Box } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { useRouter } from "next/router";
import { ChangeEvent, useState } from "react";

import Table from "~community/common/components/molecules/Table/Table";
import ROUTES from "~community/common/constants/routes";
import { TableNames } from "~community/common/enums/Table";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { getEmoji } from "~community/common/utils/commonUtil";
import { useSearchPolicyLeaveTypes } from "~community/leave/api/PolicyLeaveTypeApi";
import {
  POLICY_LEAVE_TYPES_PAGE_SIZE,
  POLICY_LEAVE_TYPES_SKELETON_ROW_COUNT
} from "~community/leave/constants/policyLeaveTypeConstants";
import { LeaveTypeFormTypes } from "~community/leave/enums/LeaveTypeEnums";
import { PolicyLeaveTypeSettingsType } from "~community/leave/types/PolicyLeaveTypeTypes";
import { getLeaveTypeDurationTableContent } from "~community/leave/utils/leaveTypes/LeaveTypeUtils";

import styles from "./styles";

const PolicyLeaveTypesTable = () => {
  const theme: Theme = useTheme();
  const classes = styles(theme);

  const translateText = useTranslator("leaveModule", "leaveTypes");

  const router = useRouter();

  const [page, setPage] = useState<number>(0);

  const { data: policyLeaveTypesPage, isFetching } = useSearchPolicyLeaveTypes({
    searchKeyword: "",
    page,
    size: POLICY_LEAVE_TYPES_PAGE_SIZE
  });

  const policyLeaveTypes = policyLeaveTypesPage?.items ?? [];

  const tableHeaders = [
    { id: "leaveTypeName", label: translateText(["nameHeader"]) },
    { id: "durations", label: translateText(["durationsHeader"]) },
    { id: "status", label: translateText(["statusHeader"]) }
  ];

  const transformToTableRows = () =>
    policyLeaveTypes.map((policyLeaveType: PolicyLeaveTypeSettingsType) => ({
      id: policyLeaveType?.id,
      leaveTypeName: (
        <Box sx={classes.cell}>
          <span role="img" aria-hidden="true">
            {getEmoji(policyLeaveType?.emojiCode ?? "")}
          </span>
          &nbsp;
          {policyLeaveType?.name}
        </Box>
      ),
      durations: getLeaveTypeDurationTableContent(
        policyLeaveType?.minDuration
      ).map((duration: string) => (
        <Box key={duration} sx={classes.durationCell}>
          {duration}
        </Box>
      )),
      status: (
        <Box sx={classes.cell}>
          {policyLeaveType?.isActive
            ? translateText(["active"])
            : translateText(["inactive"])}
        </Box>
      ),
      actionData: policyLeaveType,
      ariaLabel: {
        editButton: translateText(["editButton.label"], {
          recordName: policyLeaveType?.name
        })
      },
      ariaDescription: {
        editButton: translateText(["editButton.description"], {
          recordName: policyLeaveType?.name
        })
      }
    }));

  const handleEditPolicyLeaveType = (
    policyLeaveType: PolicyLeaveTypeSettingsType
  ): void => {
    router.push({
      pathname: ROUTES.LEAVE.ADD_EDIT_LEAVE_TYPES(LeaveTypeFormTypes.EDIT),
      query: { id: policyLeaveType.id }
    });
  };

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
              rows: POLICY_LEAVE_TYPES_SKELETON_ROW_COUNT
            }
          },
          actionColumn: {
            isEnabled: true,
            actionBtns: {
              left: {
                onClick: (policyLeaveType) =>
                  handleEditPolicyLeaveType(policyLeaveType)
              }
            }
          }
        }}
        tableFoot={{
          pagination: {
            isEnabled: (policyLeaveTypesPage?.totalPages ?? 0) > 1,
            totalPages: policyLeaveTypesPage?.totalPages,
            currentPage: page,
            onChange: (_event: ChangeEvent<unknown>, selectedPage: number) =>
              setPage(selectedPage - 1)
          }
        }}
        customStyles={{
          container: classes.tableContainer
        }}
        isLoading={isFetching}
      />
    </Box>
  );
};

export default PolicyLeaveTypesTable;
