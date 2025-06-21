import {
  Box,
  Divider,
  SelectChangeEvent,
  Stack,
  Theme,
  Typography,
  useTheme
} from "@mui/material";
import { ChangeEvent, FC, useEffect, useMemo, useState } from "react";

import Button from "~community/common/components/atoms/Button/Button";
import FilterButton from "~community/common/components/molecules/FilterButton/FilterButton";
import RoundedSelect from "~community/common/components/molecules/RoundedSelect/RoundedSelect";
import Table from "~community/common/components/molecules/Table/Table";
import {
  ButtonSizes,
  ButtonStyle
} from "~community/common/enums/ComponentEnums";
import { TableNames } from "~community/common/enums/Table";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { SortKeyTypes } from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import {
  getEmoji,
  pascalCaseFormatter
} from "~community/common/utils/commonUtil";
import {
  useGetEmployeeLeaveRequestData,
  useGetEmployeeLeaveRequests,
  useGetLeaveAllocation
} from "~community/leave/api/MyRequestApi";
import { useLeaveStore } from "~community/leave/store/store";
import { LeaveRequestDataType } from "~community/leave/types/EmployeeLeaveRequestTypes";
import { LeaveStatusTypes } from "~community/leave/types/LeaveTypes";
import { generateMyLeaveRequestAriaLabel } from "~community/leave/utils/accessibilityUtils";
import { leaveStatusIconSelector } from "~community/leave/utils/leaveRequest/LeaveRequestUtils";

import LeaveRequestDates from "../LeaveRequestDates/LeaveRequestDates";
import styles from "./styles";

const LeaveRequests: FC = () => {
  const theme: Theme = useTheme();
  const currentPage = useLeaveStore((state) => state.leaveRequestParams.page);
  const leaveRequestSort = useLeaveStore(
    (state) => state.leaveRequestParams.sortKey
  );
  const classes = styles(theme);
  const {
    resetLeaveRequestParams,
    leaveRequestsFilter,
    setLeaveRequestParams,
    setPagination,
    selectedYear,
    handleLeaveRequestsSort,
    setIsEmployeeModal,
    setEmployeeLeaveRequestData,
    newLeaveId,
    setNewLeaveId
  } = useLeaveStore((state) => state);

  const [filter, setFilter] = useState<{ status: string[]; type: string[] }>({
    status: leaveRequestsFilter.status || [],
    type: leaveRequestsFilter.type || []
  });

  const { data: leaveRequests, isLoading } = useGetEmployeeLeaveRequests();
  const { data: leaveTypesData } = useGetLeaveAllocation(selectedYear);

  const {
    refetch,
    isSuccess,
    data: leaveData
  } = useGetEmployeeLeaveRequestData(newLeaveId as number);

  const translateText = useTranslator("leaveModule", "myRequests");
  const translateAria = useTranslator("leaveAria", "myRequests");

  useEffect(() => {
    if (isSuccess && leaveData) {
      setEmployeeLeaveRequestData(leaveData);
    }
  }, [isSuccess, leaveData]);

  const columns = [
    {
      field: "duration",
      headerName: translateText([
        "myLeaveRequests",
        "duration"
      ]).toLocaleUpperCase()
    },
    {
      field: "type",
      headerName: translateText(["myLeaveRequests", "type"]).toLocaleUpperCase()
    },
    {
      field: "status",
      headerName: translateText([
        "myLeaveRequests",
        "status"
      ]).toLocaleUpperCase()
    }
  ];

  const tableHeaders = columns.map((col) => ({
    id: col.field,
    label: col.headerName
  }));

  const tableHeaderTypographyStyles = {
    pl: "1.5rem"
  };

  const transformToTableRows = () => {
    return leaveRequests?.items?.map((employeeLeaveRequest: any) => ({
      id: employeeLeaveRequest.leaveRequestId,
      ariaLabel: {
        row: generateMyLeaveRequestAriaLabel(
          translateAria,
          translateText,
          employeeLeaveRequest
        )
      },
      duration: (
        <LeaveRequestDates
          days={employeeLeaveRequest.durationDays}
          startDate={employeeLeaveRequest.startDate}
          endDate={employeeLeaveRequest.endDate}
        />
      ),
      type: (
        <div style={classes.iconStyles}>
          <span role="img" aria-hidden="true">
            {getEmoji(employeeLeaveRequest.leaveType.emojiCode || "")}
          </span>
          {employeeLeaveRequest.leaveType.name}
        </div>
      ),
      status: (
        <div style={{ ...classes.iconStyles, textTransform: "capitalize" }}>
          <span role="img" aria-hidden="true">
            {leaveStatusIconSelector(employeeLeaveRequest.status)}
          </span>
          {employeeLeaveRequest.status.toLowerCase()}
        </div>
      )
    }));
  };

  const leaveTypeOptions = useMemo(
    () =>
      leaveTypesData?.map(
        (result: { leaveType: { typeId: string; name: string } }) => ({
          id: result.leaveType.typeId,
          name: result.leaveType.name
        })
      ) || [],
    [leaveTypesData]
  );

  const getLeaveTypeNameById = (id: string) => {
    const leaveType = leaveTypeOptions.find(
      (type: { id: string; name: string }) => type.id === id
    );
    return leaveType ? leaveType.name : null;
  };

  const handleApplyFilters = () => {
    setLeaveRequestParams("status", filter.status);
    setLeaveRequestParams("leaveType", filter.type);
  };

  const handleResetFilters = () => {
    setFilter({
      status: [],
      type: []
    });
    resetLeaveRequestParams();
  };

  const leaveStatusArray = [
    LeaveStatusTypes.PENDING,
    LeaveStatusTypes.APPROVED,
    LeaveStatusTypes.DENIED,
    LeaveStatusTypes.REVOKED,
    LeaveStatusTypes.CANCELLED
  ];

  const filterButton = (
    <FilterButton
      handleApplyBtnClick={handleApplyFilters}
      handleResetBtnClick={handleResetFilters}
      selectedFilters={[
        {
          filter: filter.type.map((typeId) => getLeaveTypeNameById(typeId)),
          handleFilterDelete: (option) => {
            const updatedTypeFilter = filter.type.filter(
              (item) => getLeaveTypeNameById(item) !== option
            );
            setFilter((prev) => ({
              ...prev,
              type: updatedTypeFilter
            }));
            setLeaveRequestParams("leaveType", updatedTypeFilter);
          }
        },
        {
          filter: filter.status,
          handleFilterDelete: (option) => {
            const updatedStatusFilter = filter.status.filter(
              (item) => item !== option
            );
            setFilter((prev) => ({
              ...prev,
              status: updatedStatusFilter
            }));
            setLeaveRequestParams("status", updatedStatusFilter);
          }
        }
      ]}
      position={"bottom-end"}
      id={"filter-types"}
      isResetBtnDisabled={!filter.type.length && !filter.status.length}
      accessibility={{
        ariaLabel: translateAria(["myLeaveRequests", "filterSection"])
      }}
    >
      <Box
        role="region"
        aria-label={translateAria(["myLeaveRequests", "statusFilterSection"])}
      >
        <Typography variant="h5">
          {translateText(["myLeaveRequests", "filterButtonStatus"])}
        </Typography>
        <Stack sx={classes.filterStackStyles}>
          {leaveStatusArray.map((leaveStatus) => (
            <Button
              key={leaveStatus}
              label={pascalCaseFormatter(leaveStatus)}
              isFullWidth={false}
              onClick={() => {
                setFilter((prev) => ({
                  ...prev,
                  status: prev.status.includes(leaveStatus)
                    ? prev.status.filter((item) => item !== leaveStatus)
                    : [...prev.status, leaveStatus]
                }));
              }}
              buttonStyle={
                filter.status.includes(leaveStatus)
                  ? ButtonStyle.SECONDARY
                  : ButtonStyle.TERTIARY
              }
              size={ButtonSizes.MEDIUM}
              startIcon={
                filter.status.includes(leaveStatus)
                  ? IconName.CHECK_CIRCLE_ICON
                  : null
              }
              styles={classes.filterChipButtonStyles}
              ariaLabel={
                filter.status.includes(leaveStatus)
                  ? translateAria(["myLeaveRequests", "filterSelected"], {
                      filterName: pascalCaseFormatter(leaveStatus)
                    })
                  : translateAria(["myLeaveRequests", "filterOption"], {
                      filterName: pascalCaseFormatter(leaveStatus)
                    })
              }
            />
          ))}
        </Stack>
      </Box>
      <Box
        role="region"
        aria-label={translateAria(["myLeaveRequests", "typeFilterSection"])}
      >
        <Typography variant="h5">
          {translateText(["myLeaveRequests", "filterButtonType"])}
        </Typography>
        <Stack sx={classes.filterStackStyles}>
          {leaveTypeOptions.map(
            ({ id, name }: { id: string; name: string }) => (
              <Button
                key={id}
                label={name}
                isFullWidth={false}
                onClick={() => {
                  setFilter((prev) => ({
                    ...prev,
                    type: prev.type.includes(id)
                      ? prev.type.filter((item) => item !== id)
                      : [...prev.type, id]
                  }));
                }}
                buttonStyle={
                  filter.type.includes(id)
                    ? ButtonStyle.SECONDARY
                    : ButtonStyle.TERTIARY
                }
                size={ButtonSizes.MEDIUM}
                startIcon={
                  filter.type.includes(id) ? IconName.CHECK_CIRCLE_ICON : null
                }
                styles={classes.filterChipButtonStyles}
                ariaLabel={
                  filter.type.includes(id)
                    ? translateAria(["myLeaveRequests", "filterSelected"], {
                        filterName: pascalCaseFormatter(name)
                      })
                    : translateAria(["myLeaveRequests", "filterOption"], {
                        filterName: pascalCaseFormatter(name)
                      })
                }
              />
            )
          )}
        </Stack>
      </Box>
    </FilterButton>
  );

  const dropdownItems = [
    {
      label: translateText(["myLeaveRequests", "dateRequested"]),
      value: SortKeyTypes.CREATED_DATE
    },
    {
      label: translateText(["myLeaveRequests", "leaveDate"]),
      value: SortKeyTypes.START_DATE
    }
  ];

  const handleItemClick = (event: SelectChangeEvent) => {
    handleLeaveRequestsSort("sortKey", event.target.value);
  };

  const selectedItem = dropdownItems.find(
    (item) => item.value === leaveRequestSort
  );

  const handleRowClick = (leaveRequest: any): void => {
    setIsEmployeeModal(false);
    setEmployeeLeaveRequestData({} as LeaveRequestDataType);
    setNewLeaveId(leaveRequest.id);
  };

  useEffect(() => {
    if (newLeaveId) {
      refetch()
        .then(() => {
          setIsEmployeeModal(true);
        })
        .catch(console.error);
    }
  }, [newLeaveId]);

  return (
    <Box
      role="region"
      aria-label={translateAria(["myLeaveRequests", "myLeaveRequestsSection"])}
    >
      <Typography
        variant="h1"
        sx={{
          marginBottom: "1.5rem",
          marginTop: "1.5rem"
        }}
      >
        {translateText(["myLeaveRequests", "requestTitle"])}
      </Typography>
      <Divider sx={{ mb: "1rem" }} />
      <Table
        tableName={TableNames.LEAVE_REQUESTS}
        headers={tableHeaders}
        rows={transformToTableRows()}
        tableHead={{
          customStyles: {
            typography: tableHeaderTypographyStyles
          }
        }}
        tableBody={{
          emptyState: {
            noData: {
              title: translateText([
                "myLeaveRequests",
                "emptyLeaveRequestTitle"
              ]),
              description: translateText([
                "myLeaveRequests",
                "emptyLeaveRequestDes"
              ])
            }
          },
          loadingState: {
            skeleton: {
              rows: 5
            }
          },
          onRowClick: handleRowClick
        }}
        tableFoot={{
          pagination: {
            isEnabled: true,
            totalPages: leaveRequests?.totalPages || 1,
            currentPage: currentPage as number,
            onChange: (_event: ChangeEvent<unknown>, value: number) =>
              setPagination(value - 1)
          }
        }}
        actionToolbar={{
          firstRow: {
            leftButton: (
              <Box
                role="group"
                aria-label={translateAria(["myLeaveRequests", "sortGroup"])}
              >
                <RoundedSelect
                  id="leave-requests-filter"
                  onChange={handleItemClick}
                  value={selectedItem?.value ?? ""}
                  options={dropdownItems}
                  renderValue={(selectedValue: string) => {
                    const selectedOption = dropdownItems.find(
                      (item) => item.value === selectedValue
                    );
                    const displayLabel = selectedOption?.label || selectedValue;
                    return (
                      <Typography
                        aria-label={translateAria(
                          ["myLeaveRequests", "sortBy"],
                          {
                            sortBy: displayLabel
                          }
                        )}
                      >
                        {translateText(["myLeaveRequests", "sortBy"], {
                          sortBy: displayLabel
                        })}
                      </Typography>
                    );
                  }}
                  accessibility={{
                    label: translateAria(["myLeaveRequests", "sort"])
                  }}
                />
              </Box>
            ),
            rightButton: filterButton
          }
        }}
        isLoading={isLoading}
      />
    </Box>
  );
};

export default LeaveRequests;
