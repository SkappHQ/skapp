import {
  Button,
  FilterIcon,
  InputField,
  KebabMenu,
  SearchIcon,
  StatusComponent,
  Table
} from "@rootcodelabs/skapp-ui";
import { JSX, useMemo, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { leavePolicyMockData } from "~community/leave/constants/leavePolicyConstants";
import {
  LeavePolicyEntitlementType,
  LeavePolicyStatus,
  LeavePolicyType
} from "~community/leave/types/LeavePolicyTypes";

const LeavePoliciesTable = (): JSX.Element => {
  const translateText = useTranslator("leaveModule", "leavePolicies");

  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredPolicies = useMemo(
    () =>
      leavePolicyMockData.filter((policy: LeavePolicyType) =>
        policy.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [searchTerm]
  );

  const tableData = filteredPolicies.map((policy: LeavePolicyType) => ({
    id: policy.policyId,
    policyName: policy.name,
    leaveType: policy,
    entitlementType:
      policy.entitlementType === LeavePolicyEntitlementType.ACCRUAL
        ? translateText(["accrual"])
        : translateText(["fixed"]),
    status: policy.status,
    assignedEmployees: policy.assignedEmployees,
    actions: policy
  }));

  type TableRow = (typeof tableData)[number];

  const columns = [
    {
      key: "policyName",
      header: translateText(["policyNameHeader"]),
      render: (value: unknown) => (
        <span className="text-sm font-medium text-gray-900">
          {value as string}
        </span>
      )
    },
    {
      key: "leaveType",
      header: translateText(["leaveTypeHeader"]),
      render: (value: unknown) => {
        const policy = value as LeavePolicyType;
        return (
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-900">
            <span role="img" aria-hidden="true">
              {policy.leaveTypeEmoji}
            </span>
            {policy.leaveTypeName}
          </span>
        );
      }
    },
    {
      key: "entitlementType",
      header: translateText(["entitlementTypeHeader"]),
      render: (value: unknown) => (
        <span className="text-sm text-gray-900">{value as string}</span>
      )
    },
    {
      key: "status",
      header: translateText(["statusHeader"]),
      render: (value: unknown) => {
        const isActive = (value as LeavePolicyStatus) ===
          LeavePolicyStatus.ACTIVE;
        return (
          <StatusComponent
            text={
              isActive
                ? translateText(["active"])
                : translateText(["inactive"])
            }
            iconColor={isActive ? "text-green-500" : "text-red-500"}
          />
        );
      }
    },
    {
      key: "assignedEmployees",
      header: translateText(["assignedEmployeesHeader"]),
      render: (value: unknown) => (
        <span className="text-sm text-gray-900">{value as number}</span>
      )
    },
    {
      key: "actions",
      header: "",
      width: "3.5rem",
      render: (value: unknown) => {
        const policy = value as LeavePolicyType;
        return (
          <KebabMenu
            id={`leave-policy-kebab-menu-${policy.policyId}`}
            menuItems={[
              {
                id: `leave-policy-edit-${policy.policyId}`,
                label: translateText(["menuEdit"]),
                onClick: () => {}
              },
              {
                id: `leave-policy-delete-${policy.policyId}`,
                label: translateText(["menuDelete"]),
                onClick: () => {}
              }
            ]}
          />
        );
      }
    }
  ];

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="flex flex-row items-center justify-between gap-3">
        <div className="w-full max-w-lg">
          <InputField
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={translateText(["searchPlaceholder"])}
            leftIcon={<SearchIcon className="size-4 text-gray-500" />}
            fullWidth
            aria-label={translateText(["searchPlaceholder"])}
          />
        </div>
        <Button
          variant="tertiary"
          size="md"
          icon={<FilterIcon />}
          aria-label="Filter"
        />
      </div>
      <Table<TableRow>
        columns={columns}
        data={tableData}
        tableAriaLabel={translateText(["title"])}
        emptyStateType="no-search-results"
        noSearchResultsState={{
          title: translateText(["searchPlaceholder"])
        }}
      />
    </div>
  );
};

export default LeavePoliciesTable;
