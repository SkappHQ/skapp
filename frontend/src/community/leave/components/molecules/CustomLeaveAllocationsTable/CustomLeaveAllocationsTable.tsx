import { EditIcon, IconButton } from "@rootcodelabs/skapp-ui";
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import TableView from "~community/common/components/organisms/TableView/TableView";
import type {
  GridHeader,
  GridRow,
  TableViewFilterContentArgs
} from "~community/common/components/organisms/TableView/types";
import { TableNames } from "~community/common/enums/Table";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  getEmoji,
  removeSpecialCharacters
} from "~community/common/utils/commonUtil";
import {
  currentYear,
  getAdjacentYearsWithCurrent,
  nextYear
} from "~community/common/utils/dateTimeUtils";
import { useGetCustomLeaves } from "~community/leave/api/LeaveApi";
import CustomLeaveAllocationFilterBody from "~community/leave/components/molecules/CustomLeaveAllocationFilterBody/CustomLeaveAllocationFilterBody";
import { useLeaveStore } from "~community/leave/store/store";
import {
  CustomLeaveAllocationModalTypes,
  CustomLeaveAllocationType,
  LeaveAllocation
} from "~community/leave/types/CustomLeaveAllocationTypes";

interface Props {
  searchTerm?: string;
  onSearchTermChange: (searchTerm: string) => void;
}

const CustomLeaveAllocationsTable: React.FC<Props> = ({
  searchTerm,
  onSearchTermChange
}) => {
  const translateText = useTranslator("leaveModule", "customLeave");
  const translateAria = useTranslator(
    "leaveAria",
    "entitlement",
    "customLeaveAllocationTable"
  );

  const {
    selectedYear,
    currentPage,
    setCurrentEditingLeaveAllocation,
    setCustomLeaveAllocationModalType,
    setIsLeaveAllocationModalOpen,
    setSelectedYear,
    setCurrentPage,
    setCustomLeaveAllocations
  } = useLeaveStore((state) => state);

  const [selectedLeaveTypes, setSelectedLeaveTypes] = useState<string[]>([]);

  const leaveTypes = selectedLeaveTypes.join(",");
  const { data: customLeaveData, isLoading } = useGetCustomLeaves(
    currentPage,
    5,
    searchTerm,
    Number(selectedYear),
    leaveTypes
  );

  const isEmptySearchResult = !!searchTerm || selectedLeaveTypes.length > 0;
  const searchPlaceholder = translateText([
    "CustomLeaveAllocationsSectionSearchBarPlaceholder"
  ]);

  useEffect(() => {
    if (customLeaveData?.items) {
      setCustomLeaveAllocations(customLeaveData.items);
    }
  }, [customLeaveData?.items]);

  const handleEdit = useCallback(
    (leaveAllocation: LeaveAllocation) => {
      const updatedLeaveAllocation: CustomLeaveAllocationType = {
        entitlementId: leaveAllocation.entitlementId,
        employeeId: leaveAllocation.employee.employeeId,
        numberOfDaysOff: leaveAllocation.totalDaysAllocated,
        typeId: leaveAllocation.leaveType.typeId,
        assignedTo: {
          employeeId: leaveAllocation.employee.employeeId,
          firstName: leaveAllocation.employee.firstName,
          lastName: leaveAllocation.employee.lastName,
          avatarUrl: leaveAllocation.employee.authPic
        },
        validToDate: leaveAllocation.validTo,
        validFromDate: leaveAllocation.validFrom,
        totalDaysUsed: leaveAllocation.totalDaysUsed,
        totalDaysAllocated: leaveAllocation.totalDaysAllocated
      };

      setCurrentEditingLeaveAllocation(updatedLeaveAllocation);
      setCustomLeaveAllocationModalType(
        CustomLeaveAllocationModalTypes.EDIT_LEAVE_ALLOCATION
      );
      setIsLeaveAllocationModalOpen(true);
    },
    [
      setCurrentEditingLeaveAllocation,
      setCustomLeaveAllocationModalType,
      setIsLeaveAllocationModalOpen
    ]
  );

  const tableHeaders: GridHeader[] = useMemo(
    () => [
      {
        id: "employee",
        label: translateText(["tableHeaderOne"]),
        align: "left"
      },
      { id: "duration", label: translateText(["tableHeaderTwo"]) },
      { id: "type", label: translateText(["tableHeaderThree"]) },
      {
        id: "actions",
        label: translateText(["tableHeaderFour"]),
        align: "right",
        width: "6rem"
      }
    ],
    [translateText]
  );

  const transformToTableRows = useCallback((): GridRow[] => {
    return (customLeaveData?.items ?? []).map((leaveAllocation) => {
      const recordName = `${leaveAllocation.employee?.firstName} ${leaveAllocation.employee?.lastName}`;

      return {
        id: leaveAllocation.entitlementId,
        employee: (
          <AvatarChip
            firstName={leaveAllocation.employee?.firstName}
            lastName={leaveAllocation.employee?.lastName}
            avatarUrl={leaveAllocation.employee?.authPic}
            chipStyles={{
              display: "flex",
              justifyContent: "start",
              maxWidth: "fit-content",
              backgroundColor: "var(--color-tertiary-background)"
            }}
          />
        ),
        duration: (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "var(--color-tertiary-background)",
              borderRadius: "9.375rem",
              padding: "0.5rem 1rem"
            }}
          >
            {leaveAllocation.totalDaysAllocated === 0.5
              ? translateText(["halfDayChip"])
              : `${leaveAllocation.totalDaysAllocated} ${
                  leaveAllocation.totalDaysAllocated === 1
                    ? translateText(["day"])
                    : translateText(["days"])
                }`}
          </div>
        ),
        type: (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "var(--color-tertiary-background)",
              borderRadius: "9.375rem",
              padding: "0.5rem 1rem"
            }}
          >
            <span role="img" aria-hidden="true">
              {getEmoji(leaveAllocation.leaveType?.emojiCode || "")}
            </span>
            {leaveAllocation.leaveType?.name}
          </div>
        ),
        actions: (
          <IconButton
            icon={<EditIcon />}
            onClick={() =>
              handleEdit({
                ...leaveAllocation,
                employee: {
                  ...leaveAllocation.employee,
                  employeeId: Number(leaveAllocation.employee.employeeId)
                },
                validTo: leaveAllocation.validTo || "",
                validFrom: leaveAllocation.validFrom || ""
              })
            }
            aria-label={translateText(["editButton.label"], {
              leaveType: leaveAllocation.leaveType?.name,
              recordName
            })}
          />
        )
      };
    });
  }, [customLeaveData?.items, handleEdit, translateText]);

  const handleApplyFilters = (leaveTypeIds: string[]) => {
    setSelectedLeaveTypes(leaveTypeIds);
    setCurrentPage(0);
  };

  const handleResetFilters = () => {
    setSelectedLeaveTypes([]);
    setCurrentPage(0);
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchTermChange(removeSpecialCharacters(event.target.value.trimStart()));
  };

  const handleAddLeaveAllocation = () => {
    setCustomLeaveAllocationModalType(
      CustomLeaveAllocationModalTypes.ADD_LEAVE_ALLOCATION
    );
    setIsLeaveAllocationModalOpen(true);
  };

  const showEmptyTableButton =
    (selectedYear === currentYear.toString() ||
      selectedYear === nextYear.toString()) &&
    !isEmptySearchResult;

  const emptyState = {
    title: isEmptySearchResult
      ? translateText(["emptySearchResult", "title"])
      : translateText(["emptyCustomLeaveScreen", "title"]),
    description: isEmptySearchResult
      ? translateText(["emptySearchResult", "description"])
      : translateText(["emptyCustomLeaveScreen", "description"]),
    actions: showEmptyTableButton
      ? [
          {
            label: translateText(["CustomLeaveAllocationsSectionBtn"]),
            onClick: handleAddLeaveAllocation
          }
        ]
      : undefined
  };

  const renderFilterContent = ({ onClose }: TableViewFilterContentArgs) => (
    <CustomLeaveAllocationFilterBody
      appliedLeaveTypeIds={selectedLeaveTypes}
      onApply={handleApplyFilters}
      onReset={handleResetFilters}
      onClose={onClose}
    />
  );

  return (
    <TableView
      className="body2"
      tableName={TableNames.CUSTOM_LEAVE_ALLOCATIONS}
      ariaLabel={{
        regionAriaLabel: translateAria(["tableRegion"]),
        paginationAriaLabel: translateAria(["pagination"]),
        previousPageLabel: translateAria(["previousPage"]),
        nextPageLabel: translateAria(["nextPage"]),
        getPageAriaLabel: (page) => translateAria(["page"], { page })
      }}
      headers={tableHeaders}
      rows={transformToTableRows()}
      isLoading={isLoading}
      skeletonRows={5}
      emptyState={emptyState}
      pagination={{
        totalPages: customLeaveData?.totalPages,
        currentPage,
        onPageChange: setCurrentPage
      }}
      toolbar={{
        searchBar: {
          value: searchTerm ?? "",
          onChange: handleSearchChange,
          placeholder: searchPlaceholder,
          "aria-label": searchPlaceholder
        },
        dropdown: {
          id: "custom-leave-allocations-table-year-filter",
          options: getAdjacentYearsWithCurrent().map((year) => ({
            id: year.value,
            label: year.label,
            value: year.value
          })),
          value: selectedYear,
          onChange: setSelectedYear,
          ariaLabel: translateAria(["selectYear"])
        }
      }}
      filter={{
        filterCount: selectedLeaveTypes.length,
        filterButtonAriaLabel: translateAria(["filterButton"]),
        popoverId: "custom-leave-allocations-filter",
        filterContent: renderFilterContent
      }}
    />
  );
};

export default CustomLeaveAllocationsTable;
