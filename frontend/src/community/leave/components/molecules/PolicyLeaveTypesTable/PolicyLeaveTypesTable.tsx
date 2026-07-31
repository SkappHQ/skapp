import {
  EditIcon,
  IconButton,
  Pagination,
  Table
} from "@rootcodelabs/skapp-ui";
import { useRouter } from "next/router";
import { FC, useMemo, useState } from "react";

import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useSearchPolicyLeaveTypes } from "~community/leave/api/PolicyLeaveTypeApi";
import LeavePolicyStatusBadge from "~community/leave/components/molecules/LeavePolicyStatusBadge/LeavePolicyStatusBadge";
import LeaveTypeChip from "~community/leave/components/molecules/LeaveTypeChip/LeaveTypeChip";
import { POLICY_LEAVE_TYPES_PAGE_SIZE } from "~community/leave/constants/policyLeaveTypeConstants";
import {
  LeaveDurationTypes,
  LeaveTypeFormTypes
} from "~community/leave/enums/LeaveTypeEnums";
import { PolicyLeaveTypeSettingsType } from "~community/leave/types/PolicyLeaveTypeTypes";
import { getLeaveTypeDurationTableContent } from "~community/leave/utils/leaveTypes/LeaveTypeUtils";

const PolicyLeaveTypesTable: FC = () => {
  const translateText = useTranslator("leaveModule", "leaveTypes");

  const router = useRouter();

  const [page, setPage] = useState<number>(0);

  const { data: policyLeaveTypesPage, isLoading } = useSearchPolicyLeaveTypes({
    searchKeyword: "",
    page,
    size: POLICY_LEAVE_TYPES_PAGE_SIZE
  });

  const tableData = useMemo(
    () =>
      (policyLeaveTypesPage?.items ?? []).map(
        (policyLeaveType: PolicyLeaveTypeSettingsType) => ({
          id: policyLeaveType.id,
          leaveTypeName: policyLeaveType,
          durations: policyLeaveType.minDuration,
          status: policyLeaveType.isActive,
          actions: policyLeaveType
        })
      ),
    [policyLeaveTypesPage]
  );

  type TableRow = (typeof tableData)[number];

  const handleEditPolicyLeaveType = (
    policyLeaveType: PolicyLeaveTypeSettingsType
  ): void => {
    router.push({
      pathname: ROUTES.LEAVE.ADD_EDIT_LEAVE_TYPES(LeaveTypeFormTypes.EDIT),
      query: { id: policyLeaveType.id }
    });
  };

  const columns = [
    {
      key: "leaveTypeName",
      header: translateText(["nameHeader"]),
      render: (value: unknown) => {
        const policyLeaveType = value as PolicyLeaveTypeSettingsType;
        return (
          <LeaveTypeChip
            name={policyLeaveType.name}
            emojiCode={policyLeaveType.emojiCode}
          />
        );
      }
    },
    {
      key: "durations",
      header: translateText(["durationsHeader"]),
      render: (value: unknown) => (
        <div className="flex flex-row flex-wrap gap-2">
          {getLeaveTypeDurationTableContent(value as LeaveDurationTypes).map(
            (duration: string) => (
              <span
                key={duration}
                className="body2 w-fit rounded-full bg-secondary-background px-5 py-3 text-secondary-text"
              >
                {duration}
              </span>
            )
          )}
        </div>
      )
    },
    {
      key: "status",
      header: translateText(["statusHeader"]),
      render: (value: unknown) => {
        const isActive = value as boolean;
        return (
          <LeavePolicyStatusBadge
            isActive={isActive}
            text={
              isActive ? translateText(["active"]) : translateText(["inactive"])
            }
          />
        );
      }
    },
    {
      key: "actions",
      header: "",
      width: "3.5rem",
      render: (value: unknown) => {
        const policyLeaveType = value as PolicyLeaveTypeSettingsType;
        return (
          <IconButton
            icon={<EditIcon />}
            variant="outlined"
            shape="rounded"
            onClick={() => handleEditPolicyLeaveType(policyLeaveType)}
            aria-label={translateText(["editButton.label"], {
              recordName: policyLeaveType.name
            })}
          />
        );
      }
    }
  ];

  const totalPages = policyLeaveTypesPage?.totalPages ?? 0;

  const handlePageChange = (selectedPage: number): void => {
    setPage(selectedPage);
  };

  return (
    <div className="mt-4 flex flex-col gap-4">
      <Table<TableRow>
        columns={columns}
        data={tableData}
        tableAriaLabel={translateText(["title"])}
        isLoading={isLoading}
        noDataState={{ title: translateText(["noLeaveTypesTitle"]) }}
      />
      {totalPages > 1 && (
        <Pagination
          totalPages={totalPages}
          currentPage={page}
          onChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default PolicyLeaveTypesTable;
