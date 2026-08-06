import { EditIcon, IconButton } from "@rootcodelabs/skapp-ui";
import { useRouter } from "next/router";
import { FC, useCallback, useMemo, useState } from "react";

import TableView from "~community/common/components/organisms/TableView/TableView";
import type {
  GridHeader,
  GridRow
} from "~community/common/components/organisms/TableView/types";
import ROUTES from "~community/common/constants/routes";
import { TableNames } from "~community/common/enums/Table";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetPolicyLeaveTypes } from "~community/leave/api/PolicyLeaveTypeApi";
import LeavePolicyStatusBadge from "~community/leave/components/molecules/LeavePolicyStatusBadge/LeavePolicyStatusBadge";
import LeaveTypeChip from "~community/leave/components/molecules/LeaveTypeChip/LeaveTypeChip";
import { POLICY_LEAVE_TYPES_PAGE_SIZE } from "~community/leave/constants/policyLeaveTypeConstants";
import { LeaveTypeFormTypes } from "~community/leave/enums/LeaveTypeEnums";
import useCanManageLeavePolicies from "~community/leave/hooks/useCanManageLeavePolicies";
import { PolicyLeaveTypeSettingsType } from "~community/leave/types/PolicyLeaveTypeTypes";
import { getMinDurationTranslationKeys } from "~community/leave/utils/policyLeaveTypes/policyLeaveTypeUtils";

const PolicyLeaveTypesTable: FC = () => {
  const translateText = useTranslator("leaveModule", "leaveTypes");

  const router = useRouter();

  const canManageLeavePolicies = useCanManageLeavePolicies();

  const [page, setPage] = useState<number>(0);

  const { data: policyLeaveTypesPage, isLoading } = useGetPolicyLeaveTypes({
    page,
    size: POLICY_LEAVE_TYPES_PAGE_SIZE
  });

  const handleEditPolicyLeaveType = useCallback(
    (policyLeaveType: PolicyLeaveTypeSettingsType): void => {
      router.push({
        pathname: ROUTES.LEAVE.ADD_EDIT_LEAVE_TYPES(LeaveTypeFormTypes.EDIT),
        query: { id: policyLeaveType.id }
      });
    },
    [router]
  );

  const tableHeaders = useMemo<GridHeader[]>(() => {
    const baseHeaders: GridHeader[] = [
      { id: "leaveTypeName", label: translateText(["nameHeader"]) },
      { id: "durations", label: translateText(["durationsHeader"]) },
      { id: "status", label: translateText(["statusHeader"]) }
    ];

    if (!canManageLeavePolicies) {
      return baseHeaders;
    }

    return [
      ...baseHeaders,
      { id: "actions", label: "", width: "3.5rem", align: "right" }
    ];
  }, [translateText, canManageLeavePolicies]);

  const tableRows = useMemo<GridRow[]>(
    () =>
      (policyLeaveTypesPage?.items ?? []).map(
        (policyLeaveType: PolicyLeaveTypeSettingsType) => ({
          id: policyLeaveType.id,
          leaveTypeName: (
            <LeaveTypeChip
              name={policyLeaveType.name}
              emojiCode={policyLeaveType.emojiCode}
            />
          ),
          durations: (
            <div className="flex flex-row flex-wrap gap-2">
              {getMinDurationTranslationKeys(policyLeaveType.minDuration).map(
                (durationKey: string) => (
                  <span
                    key={durationKey}
                    className="body2 w-fit rounded-full bg-secondary-background px-5 py-3 text-secondary-text"
                  >
                    {translateText([durationKey])}
                  </span>
                )
              )}
            </div>
          ),
          status: (
            <LeavePolicyStatusBadge
              isActive={policyLeaveType.isActive}
              text={
                policyLeaveType.isActive
                  ? translateText(["active"])
                  : translateText(["inactive"])
              }
            />
          ),
          ...(canManageLeavePolicies
            ? {
                actions: (
                  <IconButton
                    icon={<EditIcon />}
                    variant="no-background"
                    shape="rounded"
                    onClick={() => handleEditPolicyLeaveType(policyLeaveType)}
                    aria-label={translateText(["editButton.label"], {
                      recordName: policyLeaveType.name
                    })}
                  />
                )
              }
            : {})
        })
      ),
    [
      policyLeaveTypesPage,
      translateText,
      canManageLeavePolicies,
      handleEditPolicyLeaveType
    ]
  );

  const handlePageChange = useCallback((selectedPage: number): void => {
    setPage(selectedPage);
  }, []);

  return (
    <TableView
      className="mt-4"
      tableName={TableNames.LEAVE_TYPES}
      ariaLabel={{ regionAriaLabel: translateText(["title"]) }}
      headers={tableHeaders}
      rows={tableRows}
      isLoading={isLoading}
      emptyState={{ title: translateText(["noLeaveTypesTitle"]) }}
      pagination={{
        totalPages: policyLeaveTypesPage?.totalPages,
        currentPage: page,
        onPageChange: handlePageChange
      }}
    />
  );
};

export default PolicyLeaveTypesTable;
