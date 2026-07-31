import { ButtonV2, EmptyDataView, SearchIcon } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC, useEffect, useMemo, useState } from "react";

import Pagination from "~community/common/components/atoms/Pagination/Pagination";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetEmployeeEntitlements } from "~community/leave/api/LeaveAnalyticsApi";
import { useGetEmployeeLeavePolicies } from "~community/leave/api/LeavePolicyAssignmentApi";
import AssignLeavePolicyModal from "~community/leave/components/molecules/AssignLeavePolicyModal/AssignLeavePolicyModal";
import UnassignLeavePolicyModal from "~community/leave/components/molecules/UnassignLeavePolicyModal/UnassignLeavePolicyModal";
import LeavePolicyCard, {
  LeaveUsage
} from "~community/leave/components/molecules/UserLeavePolicies/LeavePolicyCard";
import UserLeavePoliciesSkeleton from "~community/leave/components/molecules/UserLeavePolicies/UserLeavePoliciesSkeleton";
import useCanManageLeavePolicies from "~community/leave/hooks/useCanManageLeavePolicies";
import { EmployeeLeavePolicyType } from "~community/leave/types/LeavePolicyTypes";
import { LeaveEntitlementsCardType } from "~community/leave/types/MyRequests";
import useTier from "~enterprise/common/hooks/useTier";

interface Props {
  employeeId: number;
  employeeName?: string;
}

const POLICIES_PER_PAGE = 6;

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

  const {
    items: policies = [],
    totalPages = 0,
    totalItems = 0
  } = policiesPage ?? {};

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
          remaining: entitlement.balanceInDays,
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

      {isLoading && <UserLeavePoliciesSkeleton />}

      {isError && (
        <EmptyDataView
          title={translateText(["errorStateTitle"])}
          description={translateText(["errorStateDescription"])}
        />
      )}

      {!isLoading && !isError && !hasPolicies && (
        <EmptyDataView
          icon={<SearchIcon />}
          title={translateText(["emptyStateTitle"])}
          description={translateText(["emptyStateDescription"])}
        />
      )}

      {hasPolicies && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {policies.map((policy) => (
            <LeavePolicyCard
              key={policy.id}
              policy={policy}
              usage={usageByLeaveType.get(policy.leaveTypeName)}
              canManagePolicies={canManagePolicies}
              isKebabMenuOpen={openKebabMenuId === policy.id}
              onKebabToggle={(isOpen: boolean) =>
                setOpenKebabMenuId(isOpen ? policy.id : null)
              }
              onUnassign={() => setUnassigningPolicy(policy)}
            />
          ))}
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
