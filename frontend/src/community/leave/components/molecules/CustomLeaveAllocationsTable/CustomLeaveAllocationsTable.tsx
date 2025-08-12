import { Box, Chip, Theme, Typography, useTheme } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import FilterButton from "~community/common/components/molecules/FilterButton/FilterButton";
import RoundedSelect from "~community/common/components/molecules/RoundedSelect/RoundedSelect";
import Table from "~community/common/components/molecules/Table/Table";
import { TableNames } from "~community/common/enums/Table";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { getEmoji } from "~community/common/utils/commonUtil";
import {
  currentYear,
  getAdjacentYearsWithCurrent,
  nextYear
} from "~community/common/utils/dateTimeUtils";
import { useGetCustomLeaves } from "~community/leave/api/LeaveApi";
import { useGetLeaveTypes } from "~community/leave/api/LeaveTypesApi";
import { useLeaveStore } from "~community/leave/store/store";
import {
  CustomLeaveAllocationModalTypes,
  CustomLeaveAllocationType,
  LeaveAllocation
} from "~community/leave/types/CustomLeaveAllocationTypes";

import {
  tableContainerStyles,
  tableHeaderCellStyles,
  tableHeaderRowStyles,
  typographyStyles
} from "./styles";

interface Props {
  searchTerm?: string;
  setHasFilteredData: (hasData: boolean) => void;
  setHasEmptyFilterResults: (isEmpty: boolean) => void;
}

const CustomLeaveAllocationsTable: React.FC<Props> = ({
  searchTerm,
  setHasFilteredData,
  setHasEmptyFilterResults
}) => {
  const translateText = useTranslator("leaveModule", "customLeave");
  const translateAria = useTranslator(
    "leaveAria",
    "entitlement",
    "customLeaveAllocationTable"
  );
  const theme: Theme = useTheme();

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
  const [tempSelectedLeaveTypes, setTempSelectedLeaveTypes] = useState<
    string[]
  >([]);

  const leaveTypes = selectedLeaveTypes.join(",");
  const { data: customLeaveData, isLoading } = useGetCustomLeaves(
    currentPage,
    5,
    searchTerm,
    Number(selectedYear),
    leaveTypes
  );

  useEffect(() => {
    if (customLeaveData?.items) {
      setCustomLeaveAllocations(customLeaveData.items);
      setHasFilteredData(customLeaveData.items.length > 0);
      setHasEmptyFilterResults(
        customLeaveData.items.length === 0 &&
          (!!searchTerm || selectedLeaveTypes.length > 0)
      );
    } else {
      setHasFilteredData(false);
      setHasEmptyFilterResults(false);
    }
  }, [
    customLeaveData?.items,
    searchTerm,
    selectedLeaveTypes,
    setCustomLeaveAllocations,
    setHasFilteredData,
    setHasEmptyFilterResults
  ]);

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

  const columns = useMemo(
    () => [
      { field: "employee", headerName: translateText(["tableHeaderOne"]) },
      { field: "duration", headerName: translateText(["tableHeaderTwo"]) },
      { field: "type", headerName: translateText(["tableHeaderThree"]) }
    ],
    [translateText]
  );

  const tableHeaders = useMemo(
    () => columns.map((col) => ({ id: col.field, label: col.headerName })),
    [columns]
  );

  const yearFilter = (
    <RoundedSelect
      id="custom-leave-allocations-table-year-filter"
      onChange={(event) => setSelectedYear(event?.target?.value)}
      value={selectedYear}
      options={getAdjacentYearsWithCurrent()}
      accessibility={{
        label: translateAria(["selectYear"])
      }}
    />
  );

  const transformToTableRows = useCallback(() => {
    return (
      customLeaveData?.items?.map((leaveAllocation) => {
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
                maxWidth: "fit-content"
              }}
            />
          ),
          duration: (
            <div
              style={{
                backgroundColor: theme.palette.common.white,
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
                backgroundColor: theme.palette.common.white,
                borderRadius: "9.375rem",
                padding: "0.5rem 1rem"
              }}
            >
              <span role="img" aria-hidden="true">
                {getEmoji(leaveAllocation.leaveType?.emojiCode || "")}
              </span>
              &nbsp;
              {leaveAllocation.leaveType?.name}
            </div>
          ),
          actionData: leaveAllocation,
          ariaLabel: {
            editButton: translateText(["editButton.label"], {
              leaveType: leaveAllocation.leaveType?.name,
              recordName: `${leaveAllocation.employee?.firstName} ${leaveAllocation.employee?.lastName}`
            })
          },
          ariaDescription: {
            editButton: translateText(["editButton.description"], {
              leaveType: leaveAllocation.leaveType?.name,
              recordName: `${leaveAllocation.employee?.firstName} ${leaveAllocation.employee?.lastName}`
            })
          }
        };
      }) || []
    );
  }, [customLeaveData?.items, translateText]);

  const handleApplyFilters = () => {
    setSelectedLeaveTypes(tempSelectedLeaveTypes);
    setCurrentPage(0);
  };

  const handleResetFilters = () => {
    setTempSelectedLeaveTypes([]);
    setSelectedLeaveTypes([]);
    setCurrentPage(0);
  };

  const handleLeaveTypeFilter = (leaveType: { id: string; text: string }) => {
    setTempSelectedLeaveTypes((prev) =>
      prev.includes(leaveType.id)
        ? prev.filter((i) => i !== leaveType.id)
        : [...prev, leaveType.id]
    );
  };

  const { data: leaveTypesData } = useGetLeaveTypes();

  const leaveTypeOptions = useMemo(
    () =>
      leaveTypesData?.map((leaveType) => ({
        id: leaveType.typeId,
        name: leaveType.name
      })) || [],
    [leaveTypesData]
  );

  const filterButton = (
    <FilterButton
      handleApplyBtnClick={handleApplyFilters}
      handleResetBtnClick={handleResetFilters}
      selectedFilters={selectedLeaveTypes.map((type) => ({
        filter: [
          leaveTypeOptions.find((btn) => btn.id === Number(type))?.name ?? ""
        ],
        handleFilterDelete: () => {
          setTempSelectedLeaveTypes((prev) => prev.filter((i) => i !== type));
          setSelectedLeaveTypes((prev) => prev.filter((i) => i !== type));
        }
      }))}
      position={"bottom-end"}
      id={"filter-types"}
      isResetBtnDisabled={tempSelectedLeaveTypes.length === 0}
    >
      <Typography variant="h5" sx={typographyStyles(theme)}>
        {translateText(["filterButtonTitle"])}
      </Typography>
      <Box display="flex" flexWrap="wrap" gap={1}>
        {leaveTypeOptions.map((leaveType) => (
          <Chip
            key={leaveType.id}
            tabIndex={0}
            role="button"
            label={leaveType.name}
            aria-label={translateAria(["filterOption"], {
              filterName: leaveType.name
            })}
            onClick={() =>
              handleLeaveTypeFilter({
                id: leaveType.id.toString(),
                text: leaveType.name
              })
            }
            sx={{
              backgroundColor: tempSelectedLeaveTypes.includes(
                leaveType.id.toString()
              )
                ? theme.palette.secondary.main
                : theme.palette.grey[100],
              color: tempSelectedLeaveTypes.includes(leaveType.id.toString())
                ? theme.palette.common.black
                : theme.palette.text.primary,
              "&:hover": {
                backgroundColor: tempSelectedLeaveTypes.includes(
                  leaveType.id.toString()
                )
                  ? theme.palette.secondary.dark
                  : theme.palette.grey[200]
              }
            }}
          />
        ))}
      </Box>
    </FilterButton>
  );

  const handleAddLeaveAllocation = () => {
    setCustomLeaveAllocationModalType(
      CustomLeaveAllocationModalTypes.ADD_LEAVE_ALLOCATION
    );
    setIsLeaveAllocationModalOpen(true);
  };

  const showEmptyTableButton =
    (selectedYear === currentYear.toString() ||
      selectedYear === nextYear.toString()) &&
    !searchTerm &&
    selectedLeaveTypes.length === 0;

  return (
    <Box>
      <Table
        tableName={TableNames.CUSTOM_LEAVE_ALLOCATIONS}
        headers={tableHeaders}
        isLoading={isLoading}
        rows={transformToTableRows()}
        tableHead={{
          customStyles: {
            row: tableHeaderRowStyles(theme),
            cell: tableHeaderCellStyles(theme)
          }
        }}
        tableBody={{
          emptyState: {
            noData: {
              title:
                !!searchTerm || selectedLeaveTypes.length > 0
                  ? translateText(["emptySearchResult", "title"])
                  : translateText(["emptyCustomLeaveScreen", "title"]),
              description:
                !!searchTerm || selectedLeaveTypes.length > 0
                  ? translateText(["emptySearchResult", "description"])
                  : translateText(["emptyCustomLeaveScreen", "description"]),
              button: showEmptyTableButton
                ? {
                    label: translateText(["CustomLeaveAllocationsSectionBtn"]),
                    onClick: handleAddLeaveAllocation
                  }
                : undefined
            }
          },
          loadingState: {
            skeleton: {
              rows: 5
            }
          },
          actionColumn: {
            isEnabled: true,
            actionBtns: {
              left: {
                onClick: (leaveAllocation) => {
                  return handleEdit({
                    ...leaveAllocation,
                    employee: {
                      ...leaveAllocation.employee,
                      employeeId: Number(leaveAllocation.employee.employeeId)
                    },
                    validTo: leaveAllocation.validTo || "",
                    validFrom: leaveAllocation.validFrom || ""
                  });
                }
              }
            }
          }
        }}
        tableFoot={{
          pagination: {
            isEnabled: (customLeaveData?.items?.length ?? 0) > 0,
            totalPages: customLeaveData?.totalPages || 1,
            currentPage: currentPage,
            onChange: (_, value) => setCurrentPage(value - 1)
          }
        }}
        customStyles={{
          container: tableContainerStyles(theme)
        }}
        actionToolbar={{
          firstRow: {
            leftButton: yearFilter,
            rightButton: filterButton
          }
        }}
      />
    </Box>
  );
};

export default CustomLeaveAllocationsTable;
