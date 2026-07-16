import {
  ButtonV2,
  Dropdown,
  InputField,
  KebabMenu,
  SearchIcon,
  StatusComponent,
  Table
} from "@rootcodelabs/skapp-ui";
import { ChangeEvent, JSX, useMemo, useState } from "react";

import { useAuth } from "~community/auth/providers/AuthProvider";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { AdminTypes } from "~community/common/types/AuthTypes";
import { getEmoji } from "~community/common/utils/commonUtil";
import {
  useGetLeavePoliciesInfinite,
  useGetPolicyLeaveTypes
} from "~community/leave/api/LeavePolicyApi";
import DeactivateLeavePolicyModal from "~community/leave/components/molecules/DeactivateLeavePolicyModal/DeactivateLeavePolicyModal";
import EditLeavePolicyModal from "~community/leave/components/molecules/EditLeavePolicyModal/EditLeavePolicyModal";
import {
  LEAVE_POLICY_PAGE_SIZE,
  LEAVE_POLICY_SEARCH_DEBOUNCE_MS
} from "~community/leave/constants/leavePolicyConstants";
import {
  PolicyType,
  LeavePolicyStatus,
  LeavePolicyType
} from "~community/leave/types/LeavePolicyTypes";

interface Props {
  onCreatePolicy: () => void;
}

const LeavePoliciesTable = ({ onCreatePolicy }: Props): JSX.Element => {
  const translateText = useTranslator("leaveModule", "leavePolicies");
  const { user } = useAuth();
  const isPeopleAdmin = user?.roles?.includes(AdminTypes.PEOPLE_ADMIN);

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

  const { data: policyLeaveTypes = [] } = useGetPolicyLeaveTypes();

  const leaveTypeFilterOptions = useMemo(
    () => [
      {
        id: "all",
        label: translateText(["leaveTypeFilterAllOption"]),
        value: ""
      },
      ...policyLeaveTypes.map((leaveType) => ({
        id: String(leaveType.typeId),
        label: leaveType.name,
        value: String(leaveType.typeId)
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
  } = useGetLeavePoliciesInfinite(
    debouncedSearch,
    leaveTypeFilter,
    LEAVE_POLICY_PAGE_SIZE
  );

  const policies: LeavePolicyType[] = useMemo(
    () => policyPages?.pages?.flatMap((page) => page?.items ?? []) ?? [],
    [policyPages]
  );

  const tableData = policies.map((policy: LeavePolicyType) => ({
    id: policy.policyId,
    policyName: policy.name,
    leaveType: policy,
    policyType:
      policy.policyType === PolicyType.ACCRUAL
        ? translateText(["accrual"])
        : translateText(["flexible"]),
    status: policy.status,
    actions: policy
  }));

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
          <span className="body2 inline-flex w-fit items-center gap-2 rounded-full bg-secondary-background px-5 py-3 text-secondary-text">
            {policy.leaveTypeEmoji && (
              <span role="img" aria-hidden="true">
                {getEmoji(policy.leaveTypeEmoji)}
              </span>
            )}
            {policy.leaveTypeName}
          </span>
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
          <StatusComponent
            text={
              isActive
                ? translateText(["active"])
                : translateText(["inactive"])
            }
            iconColor={
              isActive
                ? "var(--color-semantic-green-accent)"
                : "var(--color-semantic-red-accent)"
            }
            textColor="text-secondary-text"
            className="w-fit"
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
          id={`leave-policy-kebab-menu-${policy.policyId}`}
          isOpen={openKebabMenuId === policy.policyId}
          onToggle={(isOpen: boolean) =>
            setOpenKebabMenuId(isOpen ? policy.policyId : null)
          }
          menuItems={[
            {
              id: `leave-policy-edit-${policy.policyId}`,
              label: translateText(["menuEdit"]),
              onClick: () => setEditingPolicy(policy)
            },
            ...(policy.status === LeavePolicyStatus.ACTIVE
              ? [
                  {
                    id: `leave-policy-deactivate-${policy.policyId}`,
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

  const columns = isPeopleAdmin ? [...baseColumns, actionsColumn] : baseColumns;

  const isFiltering = Boolean(debouncedSearch.trim() || leaveTypeFilter);

  if (isError && policies.length === 0) {
    return (
      <div className="mt-4 flex flex-col items-center gap-4 rounded-lg border border-secondary-accent px-6 py-16 text-center">
        <p className="subtitle2 text-black">
          {translateText(["errorStateTitle"])}
        </p>
        <p className="body2 text-secondary-text">
          {translateText(["errorStateDescription"])}
        </p>
        <ButtonV2 variant="tertiary" size="md" onClick={() => refetch()}>
          {translateText(["retryBtnTxt"])}
        </ButtonV2>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="flex flex-row items-center justify-between gap-3">
        <div className="w-full max-w-lg">
          <InputField
            value={searchTerm}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(event.target.value)
            }
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
            onChange={(value: string) => setLeaveTypeFilter(value)}
            width="100%"
          />
        </div>
      </div>
      <Table<TableRow>
        columns={columns}
        data={tableData}
        tableAriaLabel={translateText(["title"])}
        isLoading={isLoading}
        emptyStateType={isFiltering ? "no-search-results" : "no-data"}
        onLoadMore={
          hasNextPage
            ? async () => {
                if (hasNextPage && !isFetchingNextPage) await fetchNextPage();
              }
            : undefined
        }
        hasMore={hasNextPage ?? false}
        noDataState={{
          title: translateText(["noPoliciesYetTitle"]),
          ...(isPeopleAdmin
            ? {
                buttonText: translateText(["createPolicyBtnTxt"]),
                onButtonClick: onCreatePolicy
              }
            : {})
        }}
        noSearchResultsState={{
          title: translateText(["noSearchResultsTitle"])
        }}
      />
      <EditLeavePolicyModal
        policy={editingPolicy}
        isOpen={!!editingPolicy}
        onClose={() => setEditingPolicy(null)}
      />
      <DeactivateLeavePolicyModal
        policy={deactivatingPolicy}
        isOpen={!!deactivatingPolicy}
        onClose={() => setDeactivatingPolicy(null)}
      />
    </div>
  );
};

export default LeavePoliciesTable;
