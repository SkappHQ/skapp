import {
  Dropdown,
  InputField,
  KebabMenu,
  SearchIcon,
  Table
} from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC, useMemo, useState } from "react";

import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  useGetLeavePoliciesInfinite,
  useGetPolicyLeaveTypes
} from "~community/leave/api/LeavePolicyApi";
import DeactivateLeavePolicyModal from "~community/leave/components/molecules/DeactivateLeavePolicyModal/DeactivateLeavePolicyModal";
import EditLeavePolicyModal from "~community/leave/components/molecules/EditLeavePolicyModal/EditLeavePolicyModal";
import LeavePoliciesErrorState from "~community/leave/components/molecules/LeavePoliciesTable/LeavePoliciesErrorState";
import LeavePoliciesTableSkeletonLoader from "~community/leave/components/molecules/LeavePoliciesTable/LeavePoliciesTableSkeletonLoader";
import LeavePolicyStatusBadge from "~community/leave/components/molecules/LeavePolicyStatusBadge/LeavePolicyStatusBadge";
import LeaveTypeChip from "~community/leave/components/molecules/LeaveTypeChip/LeaveTypeChip";
import {
  LEAVE_POLICY_PAGE_SIZE,
  LEAVE_POLICY_SEARCH_DEBOUNCE_MS,
  LEAVE_POLICY_SKELETON_ROW_COUNT
} from "~community/leave/constants/leavePolicyConstants";
import useCanManageLeavePolicies from "~community/leave/hooks/useCanManageLeavePolicies";
import {
  LeavePolicyStatus,
  LeavePolicyType,
  PolicyType
} from "~community/leave/types/LeavePolicyTypes";

interface Props {
  onCreatePolicy: () => void;
}

const LeavePoliciesTable: FC<Props> = ({ onCreatePolicy }) => {
  const translateText = useTranslator("leaveModule", "leavePolicies");
  const canManagePolicies = useCanManageLeavePolicies();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>("");
  const [openKebabMenuId, setOpenKebabMenuId] = useState<number | null>(null);
  const [editingPolicy, setEditingPolicy] = useState<LeavePolicyType | null>(
    null
  );
  const [deactivatingPolicy, setDeactivatingPolicy] =
    useState<LeavePolicyType | null>(null);

  const debouncedSearch = useDebounce(
    searchTerm,
    LEAVE_POLICY_SEARCH_DEBOUNCE_MS
  );

  const { data: policyLeaveTypes } = useGetPolicyLeaveTypes();

  const leaveTypeFilterOptions = useMemo(
    () => [
      {
        id: "all",
        label: translateText(["leaveTypeFilterAllOption"]),
        value: ""
      },
      ...(policyLeaveTypes ?? []).map((leaveType) => ({
        id: String(leaveType.id),
        label: leaveType.name,
        value: String(leaveType.id)
      }))
    ],
    [policyLeaveTypes, translateText]
  );

  const {
    data: policyPages,
    isLoading,
    isError,
    refetch,
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

  const tableData = useMemo(
    () =>
      policies.map((policy: LeavePolicyType) => ({
        id: policy.id,
        policyName: policy.name,
        leaveType: policy,
        policyType:
          policy.policyType === PolicyType.ACCRUAL
            ? translateText(["accrual"])
            : translateText(["flexible"]),
        status: policy.status,
        actions: policy
      })),
    [policies, translateText]
  );

  type TableRow = (typeof tableData)[number];

  const baseColumns = [
    {
      key: "policyName",
      header: translateText(["policyNameHeader"]),
      render: (value: unknown) => (
        <span className="body1 text-black">{value as string}</span>
      )
    },
    {
      key: "leaveType",
      header: translateText(["leaveTypeHeader"]),
      render: (value: unknown) => {
        const policy = value as LeavePolicyType;
        return (
          <LeaveTypeChip
            name={policy.leaveTypeName}
            emojiCode={policy.leaveTypeEmoji}
          />
        );
      }
    },
    {
      key: "policyType",
      header: translateText(["policyTypeHeader"]),
      render: (value: unknown) => (
        <span className="body1 text-black">{value as string}</span>
      )
    },
    {
      key: "status",
      header: translateText(["statusHeader"]),
      render: (value: unknown) => {
        const isActive =
          (value as LeavePolicyStatus) === LeavePolicyStatus.ACTIVE;
        return (
          <LeavePolicyStatusBadge
            isActive={isActive}
            text={
              isActive ? translateText(["active"]) : translateText(["inactive"])
            }
          />
        );
      }
    }
  ];

  const actionsColumn = {
    key: "actions",
    header: "",
    width: "3.5rem",
    render: (value: unknown) => {
      const policy = value as LeavePolicyType;
      return (
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
            ...(policy.status === LeavePolicyStatus.ACTIVE
              ? [
                  {
                    id: `leave-policy-deactivate-${policy.id}`,
                    label: translateText(["menuDeactivate"]),
                    onClick: () => setDeactivatingPolicy(policy)
                  }
                ]
              : [])
          ]}
        />
      );
    }
  };

  const columns = canManagePolicies
    ? [...baseColumns, actionsColumn]
    : baseColumns;

  const isFiltering = Boolean(debouncedSearch.trim() || leaveTypeFilter);

  const noDataState = {
    title: translateText(["noPoliciesYetTitle"]),
    ...(canManagePolicies
      ? {
          buttonText: translateText(["createPolicyBtnTxt"]),
          onButtonClick: onCreatePolicy
        }
      : {})
  };

  const handleRetry = (): void => {
    refetch();
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(event.target.value);
  };

  const handleLeaveTypeFilterChange = (value: string): void => {
    setLeaveTypeFilter(value);
  };

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

  if (isError && policies.length === 0) {
    return <LeavePoliciesErrorState onRetry={handleRetry} />;
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="flex flex-row items-center justify-between gap-3">
        <div className="w-full max-w-lg">
          <InputField
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder={translateText(["searchPlaceholder"])}
            leftIcon={<SearchIcon className="size-4 text-secondary-icon" />}
            fullWidth
            aria-label={translateText(["searchPlaceholder"])}
          />
        </div>
        <div className="w-full max-w-55">
          <Dropdown
            id="leave-policy-leave-type-filter"
            ariaLabel={translateText(["leaveTypeFilterLabel"])}
            value={leaveTypeFilter}
            options={leaveTypeFilterOptions}
            onChange={handleLeaveTypeFilterChange}
            width="100%"
          />
        </div>
      </div>
      <Table<TableRow>
        columns={columns}
        data={tableData}
        tableAriaLabel={translateText(["title"])}
        isLoading={isLoading}
        customSkeletonLoader={
          <LeavePoliciesTableSkeletonLoader
            rowCount={LEAVE_POLICY_SKELETON_ROW_COUNT}
            showActionsColumn={canManagePolicies}
          />
        }
        emptyStateType={isFiltering ? "no-search-results" : "no-data"}
        onLoadMore={hasNextPage ? handleLoadMore : undefined}
        hasMore={hasNextPage ?? false}
        noDataState={noDataState}
        noSearchResultsState={{
          title: translateText(["noSearchResultsTitle"])
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
