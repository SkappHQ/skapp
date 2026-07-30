import {
  ButtonV2,
  Card,
  EmptyDataView,
  KebabMenu
} from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC, useEffect, useMemo, useState } from "react";

import NoDataIcon from "~community/common/assets/Icons/NoDataIcon";
import Pagination from "~community/common/components/atoms/Pagination/Pagination";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { formatDays, getEmoji } from "~community/common/utils/commonUtil";
import { useGetEmployeeEntitlements } from "~community/leave/api/LeaveAnalyticsApi";
import { useGetEmployeeLeavePolicies } from "~community/leave/api/LeavePolicyAssignmentApi";
import AssignLeavePolicyModal from "~community/leave/components/molecules/AssignLeavePolicyModal/AssignLeavePolicyModal";
import UnassignLeavePolicyModal from "~community/leave/components/molecules/UnassignLeavePolicyModal/UnassignLeavePolicyModal";
import useCanManageLeavePolicies from "~community/leave/hooks/useCanManageLeavePolicies";
import { EmployeeLeavePolicyType } from "~community/leave/types/LeavePolicyTypes";
import { LeaveEntitlementsCardType } from "~community/leave/types/MyRequests";
import useTier from "~enterprise/common/hooks/useTier";

interface Props {
  employeeId: number;
  employeeName?: string;
}

interface LeaveUsage {
  taken: number;
  total: number;
}

const POLICIES_PER_PAGE = 6;

const SKELETON_CARD_KEYS = Array.from(
  { length: POLICIES_PER_PAGE },
  (_, index) => `policy-skeleton-${index}`
);

const UserLeavePolicies: FC<Props> = ({ employeeId, employeeName }) => {
  const translateText = useTranslator("leaveModule", "leavePolicyAssignment");
  const canManagePolicies = useCanManageLeavePolicies();
  const { isAtLeastCoreTier } = useTier();

  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [openKebabMenuId, setOpenKebabMenuId] = useState<number | null>(null);
  const [unassigningPolicy, setUnassigningPolicy] =
    useState<EmployeeLeavePolicyType | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);

  const {
    data: policiesPage,
    isLoading,
    isError
  } = useGetEmployeeLeavePolicies(employeeId, currentPage, POLICIES_PER_PAGE);

  const policies = policiesPage?.items ?? [];
  const totalPages = policiesPage?.totalPages ?? 0;
  const totalItems = policiesPage?.totalItems ?? 0;

  useEffect(() => {
    if (currentPage > 0 && currentPage >= totalPages) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

  const { data: entitlementData } = useGetEmployeeEntitlements(
    employeeId,
    isAtLeastCoreTier
  );

  const usageByLeaveType = useMemo(() => {
    const map = new Map<string, LeaveUsage>();
    (entitlementData ?? []).forEach(
      (entitlement: LeaveEntitlementsCardType) => {
        map.set(entitlement.leaveType.name, {
          taken: entitlement.totalDaysAllocated - entitlement.balanceInDays,
          total: entitlement.totalDaysAllocated
        });
      }
    );
    return map;
  }, [entitlementData]);

  const hasPolicies = totalItems > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center justify-between gap-3">
        <h3 className="h3 text-black">{translateText(["sectionTitle"])}</h3>
        {canManagePolicies && (
          <ButtonV2
            variant="primary"
            size="sm"
            onClick={() => setIsAssignModalOpen(true)}
          >
            {translateText(["assignPolicyBtnTxt"])}
          </ButtonV2>
        )}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SKELETON_CARD_KEYS.map((key) => (
            <div
              key={key}
              className="h-20 animate-pulse rounded-lg bg-tertiary-background"
            />
          ))}
        </div>
      )}

      {isError && (
        <EmptyDataView
          title={translateText(["errorStateTitle"])}
          description={translateText(["errorStateDescription"])}
        />
      )}

      {!isLoading && !isError && !hasPolicies && (
        <EmptyDataView
          icon={<NoDataIcon />}
          title={translateText(["emptyStateTitle"])}
          description={translateText(["emptyStateDescription"])}
        />
      )}

      {hasPolicies && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {policies.map((policy) => {
            const usage = usageByLeaveType.get(policy.leaveTypeName);
            return (
              <Card
                key={policy.id}
                className="flex flex-row items-center justify-between gap-4 bg-white p-6!"
              >
                <div className="flex min-w-0 flex-row items-center gap-6">
                  {usage && (
                    <div
                      className="flex shrink-0 items-baseline gap-0.5"
                      aria-label={translateText(["leavesTakenLabel"], {
                        taken: usage.taken,
                        total: usage.total
                      })}
                    >
                      <span className="text-2xl text-black">
                        {formatDays(usage.taken)}
                      </span>
                      <span className="body2 text-secondary-text">
                        /{formatDays(usage.total)}
                      </span>
                    </div>
                  )}
                  <div className="flex min-w-0 flex-col">
                    <span className="body1 inline-flex items-center gap-2 truncate text-black">
                      {policy.leaveTypeEmojiCode && (
                        <span role="img" aria-hidden="true">
                          {getEmoji(policy.leaveTypeEmojiCode)}
                        </span>
                      )}
                      {policy.leaveTypeName}
                    </span>
                    <span className="body2 truncate text-secondary-text">
                      {policy.policyName}
                    </span>
                  </div>
                </div>
                {canManagePolicies && (
                  <KebabMenu
                    id={`employee-leave-policy-kebab-menu-${policy.id}`}
                    isOpen={openKebabMenuId === policy.id}
                    onToggle={(isOpen: boolean) =>
                      setOpenKebabMenuId(isOpen ? policy.id : null)
                    }
                    menuItems={[
                      {
                        id: `employee-leave-policy-unassign-${policy.id}`,
                        label: translateText(["menuUnassign"]),
                        onClick: () => setUnassigningPolicy(policy)
                      }
                    ]}
                  />
                )}
              </Card>
            );
          })}
        </div>
      )}

      {hasPolicies && totalPages > 1 && (
        <div className="flex justify-end">
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onChange={(_event: ChangeEvent<unknown>, value: number) =>
              setCurrentPage(value - 1)
            }
            isNumbersVisible={false}
            tableName={translateText(["sectionTitle"])}
          />
        </div>
      )}

      <AssignLeavePolicyModal
        employeeId={employeeId}
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
      />
      <UnassignLeavePolicyModal
        employeeLeavePolicy={unassigningPolicy}
        employeeName={employeeName}
        isOpen={!!unassigningPolicy}
        onClose={() => setUnassigningPolicy(null)}
      />
    </div>
  );
};

export default UserLeavePolicies;
