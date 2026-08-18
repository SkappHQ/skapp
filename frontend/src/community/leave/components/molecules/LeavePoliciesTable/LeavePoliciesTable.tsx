import { KebabMenu } from "@rootcodelabs/skapp-ui";
import { AxiosError } from "axios";
import { ChangeEvent, FC, useCallback, useMemo, useState } from "react";

import TableView from "~community/common/components/organisms/TableView/TableView";
import type {
  GridHeader,
  GridRow,
  TableViewFilterContentArgs
} from "~community/common/components/organisms/TableView/types";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { TableNames } from "~community/common/enums/Table";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  useActivateLeavePolicy,
  useGetLeavePoliciesInfinite
} from "~community/leave/api/LeavePolicyApi";
import DeactivateLeavePolicyModal from "~community/leave/components/molecules/DeactivateLeavePolicyModal/DeactivateLeavePolicyModal";
import EditLeavePolicyModal from "~community/leave/components/molecules/EditLeavePolicyModal/EditLeavePolicyModal";
import LeavePolicyFilterBody from "~community/leave/components/molecules/LeavePolicyFilterBody/LeavePolicyFilterBody";
import LeavePolicyStatusBadge from "~community/leave/components/molecules/LeavePolicyStatusBadge/LeavePolicyStatusBadge";
import LeaveTypeChip from "~community/leave/components/molecules/LeaveTypeChip/LeaveTypeChip";
import {
  LEAVE_POLICY_PAGE_SIZE,
  LEAVE_POLICY_SEARCH_DEBOUNCE_MS
} from "~community/leave/constants/leavePolicyConstants";
import useCanManageLeavePolicies from "~community/leave/hooks/useCanManageLeavePolicies";
import {
  LeavePolicyStatus,
  LeavePolicyType,
  PolicyType
} from "~community/leave/types/LeavePolicyTypes";
import { getLeavePolicyErrorToastKeys } from "~community/leave/utils/leavePolicy/leavePolicyUtils";

interface Props {
  onCreatePolicy: () => void;
}

const LeavePoliciesTable: FC<Props> = ({ onCreatePolicy }) => {
  const translateText = useTranslator("leaveModule", "leavePolicies");
  const canManagePolicies = useCanManageLeavePolicies();
  const { setToastMessage } = useToast();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>("");
  const [openKebabMenuId, setOpenKebabMenuId] = useState<number | null>(null);
  const [editingPolicy, setEditingPolicy] = useState<LeavePolicyType | null>(
    null
  );
  const [deactivatingPolicy, setDeactivatingPolicy] =
    useState<LeavePolicyType | null>(null);
  const [activatingPolicyName, setActivatingPolicyName] = useState<string>("");

  const handleActivateSuccess = (): void => {
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["activatePolicy", "successToastTitle"]),
      description: translateText(
        ["activatePolicy", "successToastDescription"],
        {
          policyName: activatingPolicyName
        }
      ),
      isIcon: true
    });
  };

  const handleActivateError = (error: AxiosError): void => {
    const { title, description } = getLeavePolicyErrorToastKeys(error);
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["activatePolicy", title]),
      description: translateText(["activatePolicy", description]),
      isIcon: true
    });
  };

  const { mutate: activateLeavePolicy, isPending: isActivating } =
    useActivateLeavePolicy(handleActivateSuccess, handleActivateError);

  const debouncedSearch = useDebounce(
    searchTerm,
    LEAVE_POLICY_SEARCH_DEBOUNCE_MS
  );

  const {
    data: policyPages,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetLeavePoliciesInfinite({
    searchKeyword: debouncedSearch,
    leaveTypeId: leaveTypeFilter,
    size: LEAVE_POLICY_PAGE_SIZE
  });

  const policies: LeavePolicyType[] = useMemo(
    () => policyPages?.pages?.flatMap((page) => page?.items ?? []) ?? [],
    [policyPages]
  );

  const handleActivate = useCallback(
    (policy: LeavePolicyType): void => {
      if (isActivating) {
        return;
      }
      setActivatingPolicyName(policy.name);
      setOpenKebabMenuId(null);
      activateLeavePolicy(policy.id);
    },
    [isActivating, activateLeavePolicy]
  );

  const tableHeaders = useMemo<GridHeader[]>(() => {
    const baseHeaders: GridHeader[] = [
      { id: "policyName", label: translateText(["policyNameHeader"]) },
      { id: "leaveType", label: translateText(["leaveTypeHeader"]) },
      { id: "entitlementType", label: translateText(["entitlementTypeHeader"]) },
      { id: "status", label: translateText(["statusHeader"]) }
    ];

    if (!canManagePolicies) {
      return baseHeaders;
    }

    return [
      ...baseHeaders,
      { id: "actions", label: "", width: "3.5rem", align: "right" }
    ];
  }, [translateText, canManagePolicies]);

  const tableRows = useMemo<GridRow[]>(
    () =>
      policies.map((policy: LeavePolicyType) => {
        const isActive = policy.status === LeavePolicyStatus.ACTIVE;

        return {
          id: policy.id,
          ariaLabel: policy.name,
          policyName: (
            <span className="body1 text-black">{policy.name}</span>
          ),
          leaveType: (
            <LeaveTypeChip
              name={policy.leaveTypeName}
              emojiCode={policy.leaveTypeEmoji}
            />
          ),
          entitlementType: (
            <span className="body1 text-black">
              {policy.policyType === PolicyType.ACCRUAL
                ? translateText(["accrual"])
                : translateText(["flexible"])}
            </span>
          ),
          status: (
            <LeavePolicyStatusBadge
              isActive={isActive}
              text={
                isActive ? translateText(["active"]) : translateText(["inactive"])
              }
            />
          ),
          ...(canManagePolicies
            ? {
                actions: (
                  <KebabMenu
                    id={`leave-policy-kebab-menu-${policy.id}`}
                    isOpen={openKebabMenuId === policy.id}
                    onToggle={(isOpen: boolean) =>
                      setOpenKebabMenuId(isOpen ? policy.id : null)
                    }
                    menuItems={[
                      {
                        id: `leave-policy-edit-${policy.id}`,
                        label: translateText(["menuEdit"]),
                        onClick: () => setEditingPolicy(policy)
                      },
                      isActive
                        ? {
                            id: `leave-policy-deactivate-${policy.id}`,
                            label: translateText(["menuDeactivate"]),
                            onClick: () => setDeactivatingPolicy(policy)
                          }
                        : {
                            id: `leave-policy-activate-${policy.id}`,
                            label: translateText(["menuActivate"]),
                            onClick: () => handleActivate(policy)
                          }
                    ]}
                  />
                )
              }
            : {})
        };
      }),
    [policies, translateText, canManagePolicies, openKebabMenuId, handleActivate]
  );

  const isFiltering = Boolean(debouncedSearch.trim() || leaveTypeFilter);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(event.target.value);
  };

  const handleApplyLeaveTypeFilter = (leaveTypeId: string): void => {
    setLeaveTypeFilter(leaveTypeId);
  };

  const handleResetLeaveTypeFilter = (): void => {
    setLeaveTypeFilter("");
  };

  const renderFilterContent = ({ onClose }: TableViewFilterContentArgs) => (
    <LeavePolicyFilterBody
      appliedLeaveTypeId={leaveTypeFilter}
      onApply={handleApplyLeaveTypeFilter}
      onReset={handleResetLeaveTypeFilter}
      onClose={onClose}
    />
  );

  const handleLoadMore = async (): Promise<void> => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  };

  const handleCloseEditModal = (): void => {
    setEditingPolicy(null);
  };

  const handleCloseDeactivateModal = (): void => {
    setDeactivatingPolicy(null);
  };

  return (
    <div className="mt-4 flex flex-col gap-4">
      <TableView
        tableName={TableNames.LEAVE_POLICIES}
        ariaLabel={{ regionAriaLabel: translateText(["title"]) }}
        headers={tableHeaders}
        rows={tableRows}
        isLoading={isLoading}
        toolbar={{
          searchBar: {
            value: searchTerm,
            onChange: handleSearchChange,
            placeholder: translateText(["searchPlaceholder"]),
            "aria-label": translateText(["searchPlaceholder"])
          }
        }}
        filter={{
          filterCount: leaveTypeFilter ? 1 : 0,
          filterButtonAriaLabel: translateText(["leaveTypeFilterLabel"]),
          popoverId: "leave-policy-leave-type-filter",
          filterContent: renderFilterContent
        }}
        emptyState={
          isFiltering
            ? { title: translateText(["noSearchResultsTitle"]) }
            : {
                title: translateText(["noPoliciesYetTitle"]),
                actions: canManagePolicies
                  ? [
                      {
                        label: translateText(["createPolicyBtnTxt"]),
                        onClick: onCreatePolicy
                      }
                    ]
                  : undefined
              }
        }
        infiniteScroll={{
          isEnabled: true,
          height: "34.5rem",
          hasMore: hasNextPage,
          isFetchingNextPage,
          onLoadMore: handleLoadMore
        }}
      />
      <EditLeavePolicyModal
        policy={editingPolicy}
        isOpen={!!editingPolicy}
        onClose={handleCloseEditModal}
      />
      <DeactivateLeavePolicyModal
        policy={deactivatingPolicy}
        isOpen={!!deactivatingPolicy}
        onClose={handleCloseDeactivateModal}
      />
    </div>
  );
};

export default LeavePoliciesTable;
