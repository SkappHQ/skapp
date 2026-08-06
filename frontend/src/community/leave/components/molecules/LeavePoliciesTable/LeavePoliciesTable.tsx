import {
  Dropdown,
  InputField,
  KebabMenu,
  SearchIcon,
  Table
} from "@rootcodelabs/skapp-ui";
import { AxiosError } from "axios";
import { ChangeEvent, FC, useMemo, useState } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  useActivateLeavePolicy,
  useGetLeavePoliciesInfinite
} from "~community/leave/api/LeavePolicyApi";
import { useGetPolicyLeaveTypes } from "~community/leave/api/PolicyLeaveTypeApi";
import DeactivateLeavePolicyModal from "~community/leave/components/molecules/DeactivateLeavePolicyModal/DeactivateLeavePolicyModal";
import EditLeavePolicyModal from "~community/leave/components/molecules/EditLeavePolicyModal/EditLeavePolicyModal";
import LeavePoliciesTableSkeletonLoader from "~community/leave/components/molecules/LeavePoliciesTable/LeavePoliciesTableSkeletonLoader";
import LeavePolicyStatusBadge from "~community/leave/components/molecules/LeavePolicyStatusBadge/LeavePolicyStatusBadge";
import LeaveTypeChip from "~community/leave/components/molecules/LeaveTypeChip/LeaveTypeChip";
import {
  LEAVE_POLICY_PAGE_SIZE,
  LEAVE_POLICY_SEARCH_DEBOUNCE_MS,
  LEAVE_POLICY_SKELETON_ROW_COUNT
} from "~community/leave/constants/leavePolicyConstants";
import { UNPAGINATED_SIZE } from "~community/leave/constants/policyLeaveTypeConstants";
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

  const { data: policyLeaveTypes } = useGetPolicyLeaveTypes({
    isActive: true,
    page: 0,
    size: UNPAGINATED_SIZE
  });

  const leaveTypeFilterOptions = useMemo(
    () => [
      {
        id: "all",
        label: translateText(["leaveTypeFilterAllOption"]),
        value: ""
      },
      ...(policyLeaveTypes?.items ?? []).map((leaveType) => ({
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
              : [
                  {
                    id: `leave-policy-activate-${policy.id}`,
                    label: translateText(["menuActivate"]),
                    onClick: () => handleActivate(policy)
                  }
                ])
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

  const handleActivate = (policy: LeavePolicyType): void => {
    if (isActivating) {
      return;
    }
    setActivatingPolicyName(policy.name);
    setOpenKebabMenuId(null);
    activateLeavePolicy(policy.id);
  };

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
