import { ButtonV2, Card, KebabMenu } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC, useEffect, useMemo, useState } from "react";

import Pagination from "~community/common/components/atoms/Pagination/Pagination";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { getEmoji } from "~community/common/utils/commonUtil";
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

const POLICIES_PER_PAGE = 6;

const formatDays = (value: number): string =>
  Number.isInteger(value) ? String(value) : value.toFixed(2);

const UserLeavePolicies: FC<Props> = ({ employeeId, employeeName }) => {
  const translateText = useTranslator(
    "leaveModule",
    "leavePolicyAssignment"
  );
  const canManagePolicies = useCanManageLeavePolicies();
  const { isAtLeastCoreTier } = useTier();

  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [openKebabMenuId, setOpenKebabMenuId] = useState<number | null>(null);
  const [unassigningPolicy, setUnassigningPolicy] =
    useState<EmployeeLeavePolicyType | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);

  const { data: policiesPage, isLoading } = useGetEmployeeLeavePolicies(
    employeeId,
    currentPage,
    POLICIES_PER_PAGE
  );

  const policies = policiesPage?.items ?? [];
  const totalPages = policiesPage?.totalPages ?? 0;
  const totalItems = policiesPage?.totalItems ?? 0;

  // Keep the page in range when the list shrinks (e.g. after an unassign).
  useEffect(() => {
    if (currentPage > 0 && currentPage >= totalPages) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

  const { data: entitlementData } = useGetEmployeeEntitlements(
    employeeId,
    isAtLeastCoreTier
  );

  // Leave usage (taken vs total) is keyed by leave-type name, which is unique
  // and shared between the entitlement and the assigned policy.
  const usageByLeaveType = useMemo(() => {
    const map = new Map<string, { taken: number; total: number }>();
    (entitlementData ?? []).forEach((entitlement: LeaveEntitlementsCardType) => {
      map.set(entitlement.leaveType.name, {
        taken: entitlement.totalDaysAllocated - entitlement.balanceInDays,
        total: entitlement.totalDaysAllocated
      });
    });
    return map;
  }, [entitlementData]);

  const hasPolicies = totalItems > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center justify-between gap-3">
        <h3 className="header3 text-black">
          {translateText(["sectionTitle"])}
        </h3>
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

      {!isLoading && !hasPolicies && (
        <div className="rounded-lg bg-tertiary-background px-4 py-6">
          <p className="body1 text-secondary-text">
            {translateText(["emptyStateTitle"])}
          </p>
        </div>
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
                    <div className="flex shrink-0 items-baseline gap-0.5">
                      <span className="text-2xl font-semibold text-black">
                        {formatDays(usage.taken === 0 ? 1 : usage.taken)}
                      </span>
                      <span className="body2 text-secondary-text">
                        /{formatDays(usage.taken === 0 ? 1 : usage.total)}
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
