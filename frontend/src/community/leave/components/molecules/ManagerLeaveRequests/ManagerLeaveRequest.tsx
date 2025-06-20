import { Box, Stack, Theme, useTheme } from "@mui/material";
import { ChangeEvent, FC, useEffect, useState } from "react";

import { DAY_MONTH_YEAR_FORMAT } from "~community/attendance/constants/constants";
import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import DateRangePicker from "~community/common/components/molecules/DateRangePicker/DateRangePicker";
import Table from "~community/common/components/molecules/Table/Table";
import { TableNames } from "~community/common/enums/Table";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { FilterButtonTypes } from "~community/common/types/CommonTypes";
import { getEmoji } from "~community/common/utils/commonUtil";
import {
  convertDateToFormat,
  getAsDaysString,
  getDateForPeriod
} from "~community/common/utils/dateTimeUtils";
import {
  useGetLeaveRequestData,
  useGetLeaveTypes
} from "~community/leave/api/LeaveApi";
import RequestDates from "~community/leave/components/molecules/LeaveRequestRow/RequestDates";
import ManagerLeaveRequestFilterByBtn from "~community/leave/components/molecules/ManagerLeaveRequestFilterByBtn/MangerLeaveRequestFilterByBtn";
import ManagerLeaveRequestsSortByBtn from "~community/leave/components/molecules/ManagerLeaveRequestsSortByBtn/ManagerLeaveRequestsSortByBtn";
import { useLeaveStore } from "~community/leave/store/store";
import {
  LeaveRequestItemsType,
  leaveRequestRowDataTypes
} from "~community/leave/types/LeaveRequestTypes";
import {
  removeFiltersByLabel,
  requestTypeSelector,
  requestedLeaveTypesPreProcessor
} from "~community/leave/utils/LeaveRequestFilterActions";
import { generateManagerLeaveRequestAriaLabel } from "~community/leave/utils/accessibilityUtils";

interface Props {
  employeeLeaveRequests: LeaveRequestItemsType[];
  totalPages?: number;
  isLoading?: true | false;
}

const ManagerLeaveRequest: FC<Props> = ({
  totalPages,
  employeeLeaveRequests,
  isLoading
}) => {
  const theme: Theme = useTheme();

  const commonTranslateText = useTranslator(
    "commonComponents",
    "dateRangePicker"
  );

  const translateText = useTranslator(
    "leaveModule",
    "leaveRequests",
    "leaveRequestTable"
  );

  const translateAria = useTranslator("leaveAria", "allLeaveRequests");

  const {
    resetLeaveRequestParams,
    leaveRequestsFilter,
    leaveRequestFilterOrder,
    setLeaveRequestFilterOrder,
    setLeaveRequestsFilter,
    setLeaveRequestParams,
    setPagination,
    setIsManagerModal,
    setLeaveRequestData,
    setNewLeaveId,
    newLeaveId
  } = useLeaveStore((state) => ({
    resetLeaveRequestParams: state.resetLeaveRequestParams,
    leaveRequestsFilter: state.leaveRequestsFilter,
    leaveRequestFilterOrder: state.leaveRequestFilterOrder,
    setLeaveRequestFilterOrder: state.setLeaveRequestFilterOrder,
    setLeaveRequestsFilter: state.setLeaveRequestsFilter,
    setLeaveRequestParams: state.setLeaveRequestParams,
    setPagination: state.setPagination,
    setIsManagerModal: state.setIsManagerModal,
    setLeaveRequestData: state.setLeaveRequestData,
    setNewLeaveId: state.setNewLeaveId,
    newLeaveId: state.newLeaveId
  }));

  const currentPage: number = useLeaveStore(
    (state) => state.leaveRequestParams.page
  ) as number;

  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [filterArray, setFilterArray] = useState<string[]>([]);
  const [leaveTypeButtons, setLeaveTypeButtons] = useState<FilterButtonTypes[]>(
    []
  );

  const { data: leaveTypes, isLoading: leaveTypesLoading } = useGetLeaveTypes();

  const {
    refetch,
    isSuccess: getLeaveByIdSuccess,
    data: getLeaveByIdData
  } = useGetLeaveRequestData(newLeaveId as number);

  const columns = [
    {
      field: "name",
      headerName: translateText(["name"]).toLocaleUpperCase()
    },
    {
      field: "duration",
      headerName: translateText(["duration"]).toLocaleUpperCase()
    },
    { field: "type", headerName: translateText(["type"]).toLocaleUpperCase() },
    {
      field: "status",
      headerName: translateText(["status"]).toLocaleUpperCase()
    }
  ];

  const tableHeaders = columns.map((col) => ({
    id: col.field,
    label: col.headerName
  }));

  const onClickReset = () => {
    resetLeaveRequestParams();
    setFilterArray([]);
    setSelectedDates([]);
  };

  const handelRowClick = async (leaveRequest: { id: number }) => {
    setIsManagerModal(false);
    setLeaveRequestData({} as leaveRequestRowDataTypes);
    setNewLeaveId(leaveRequest.id);
  };

  const removeFilters = (label?: string) => {
    removeFiltersByLabel(
      leaveRequestsFilter,
      setLeaveRequestFilterOrder,
      setLeaveRequestsFilter,
      setLeaveRequestParams,
      leaveTypeButtons,
      filterArray,
      setFilterArray,
      label
    );
  };

  const transformToTableRows = () => {
    return employeeLeaveRequests?.map((employeeLeaveRequest) => ({
      id: employeeLeaveRequest.leaveRequestId,
      ariaLabel: {
        row: generateManagerLeaveRequestAriaLabel(
          translateAria,
          employeeLeaveRequest
        )
      },
      name: (
        <Box
          role="group"
          aria-label={`${employeeLeaveRequest?.employee?.firstName} ${employeeLeaveRequest?.employee?.lastName}`}
        >
          <Box aria-hidden={true}>
            <AvatarChip
              firstName={employeeLeaveRequest?.employee?.firstName ?? ""}
              lastName={employeeLeaveRequest?.employee?.lastName ?? ""}
              avatarUrl={employeeLeaveRequest?.employee.authPic ?? ""}
              isResponsiveLayout
              chipStyles={{
                maxWidth: "15.625rem"
              }}
            />
          </Box>
        </Box>
      ),
      duration: (
        <RequestDates
          days={getAsDaysString(employeeLeaveRequest?.durationDays ?? "")}
          dates={employeeLeaveRequest?.leaveRequestDates}
        />
      ),
      type: (
        <div
          style={{
            backgroundColor: theme.palette.common.white,
            borderRadius: "9.375rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem"
          }}
        >
          <span role="img" aria-hidden="true">
            {getEmoji(employeeLeaveRequest?.leaveType?.emojiCode || "")}
          </span>
          {employeeLeaveRequest?.leaveType?.name}
        </div>
      ),
      status: (
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
            backgroundColor: theme.palette.common.white,
            borderRadius: "9.375rem",
            padding: "0.5rem 1rem",
            textTransform: "capitalize"
          }}
        >
          <span role="img" aria-hidden="true">
            {requestTypeSelector(employeeLeaveRequest?.status)}
          </span>
          {employeeLeaveRequest?.status.toLowerCase()}
        </div>
      )
    }));
  };

  useEffect(() => {
    if (leaveTypes && !leaveTypesLoading) {
      setLeaveTypeButtons(requestedLeaveTypesPreProcessor(leaveTypes));
    }
  }, [leaveTypes, leaveTypesLoading]);

  useEffect(() => {
    setFilterArray(leaveRequestFilterOrder);
    setLeaveRequestParams("size", "6");
    const startDate = getDateForPeriod("year", "start");
    const endDate = getDateForPeriod("year", "end");

    const selectedStartDate = selectedDates[0]
      ? convertDateToFormat(selectedDates[0], "yyyy-MM-dd")
      : startDate;
    const selectedEndDate = selectedDates[1]
      ? convertDateToFormat(selectedDates[1], "yyyy-MM-dd")
      : endDate;

    setLeaveRequestParams("startDate", selectedStartDate);
    setLeaveRequestParams("endDate", selectedEndDate);
  }, [leaveRequestFilterOrder, selectedDates, setLeaveRequestParams]);

  useEffect(() => {
    if (employeeLeaveRequests?.length === 0 && totalPages === 0) {
      if (currentPage !== 0) {
        setLeaveRequestParams("page", (currentPage - 1).toString());
        setPagination(currentPage - 1);
      }
    }
  }, [
    currentPage,
    employeeLeaveRequests?.length,
    setLeaveRequestParams,
    setPagination,
    totalPages
  ]);

  useEffect(() => {
    if (getLeaveByIdSuccess && getLeaveByIdData) {
      setLeaveRequestData(getLeaveByIdData);
    }
  }, [getLeaveByIdData, getLeaveByIdSuccess]);

  useEffect(() => {
    if (newLeaveId) {
      refetch()
        .then(() => setIsManagerModal(true))
        .catch(console.error);
    }
  }, [newLeaveId]);

  return (
    <Box role="region" aria-label={translateAria(["allLeaveRequestTable"])}>
      <Table
        tableName={TableNames.MANAGER_LEAVE_REQUESTS}
        headers={tableHeaders}
        rows={transformToTableRows()}
        tableBody={{
          emptyState: {
            noData: {
              title: translateText(["noLeaveRequests"]),
              description: translateText(["noLeaveRequestsManagerDetails"])
            }
          },
          loadingState: {
            skeleton: {
              rows: 5
            }
          },
          onRowClick: handelRowClick
        }}
        tableFoot={{
          pagination: {
            isEnabled: true,
            totalPages: totalPages,
            currentPage: currentPage,
            onChange: (_event: ChangeEvent<unknown>, value: number) =>
              setPagination(value - 1)
          }
        }}
        actionToolbar={{
          firstRow: {
            leftButton: (
              <Stack flexDirection={"row"} gap="1.25rem">
                <ManagerLeaveRequestsSortByBtn />
                <DateRangePicker
                  label={commonTranslateText(["label"])}
                  selectedDates={selectedDates}
                  setSelectedDates={setSelectedDates}
                  accessibility={{
                    ariaLabel: translateAria(["dateRangeFilter"], {
                      startDate: selectedDates[0]
                        ? convertDateToFormat(
                            selectedDates[0],
                            DAY_MONTH_YEAR_FORMAT
                          )
                        : getDateForPeriod("year", "start"),
                      endDate: selectedDates[1]
                        ? convertDateToFormat(
                            selectedDates[1],
                            DAY_MONTH_YEAR_FORMAT
                          )
                        : getDateForPeriod("year", "end")
                    })
                  }}
                />
              </Stack>
            ),
            rightButton: (
              <ManagerLeaveRequestFilterByBtn
                leaveTypeButtons={leaveTypeButtons}
                onClickReset={onClickReset}
                removeFilters={removeFilters}
              />
            )
          }
        }}
        isLoading={isLoading}
      />
    </Box>
  );
};

export default ManagerLeaveRequest;
