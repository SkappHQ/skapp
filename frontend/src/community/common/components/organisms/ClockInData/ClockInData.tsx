import { Box, Stack } from "@mui/material";
import { useEffect, useState } from "react";

import { useGetClockInData } from "~community/attendance/api/AttendanceApi";
import ClockInTable from "~community/attendance/components/molecules/ClockInTable/ClockInTable";
import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import SearchBox from "~community/common/components/molecules/SearchBox/SearchBox";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { getLocalDate } from "~community/common/utils/dateTimeUtils";
import { usePeopleStore } from "~community/people/store/store";
import {
  DataFilterEnums,
  EmploymentStatusTypes
} from "~community/people/types/EmployeeTypes";

const ClockInData = () => {
  const translateTexts = useTranslator("peopleModule", "peoples");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedDate, setSelectedDate] = useState<Date[]>([new Date()]);
  const [isFetchingEnabled, setIsFetchingEnabled] = useState<boolean>(true);
  const [employeeClockInDataItems, setEmployeeClockInDataItems] = useState<any>(
    []
  );
  const [_, setIsConcatonationDone] = useState<boolean>(false);

  const { clockInType } = useAttendanceStore((state) => state);
  const [selectedFilters, setSelectedFilters] = useState<{
    [key: string]: (string | number)[];
  }>(clockInType);
  const {
    data: employeeData,
    fetchNextPage,
    isLoading: isEmployeeDataLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage
  } = useGetClockInData(
    selectedFilters["Teams"]?.join(),
    selectedFilters["Clock-ins"]?.join(),
    getLocalDate(selectedDate[0]),
    searchTerm,
    isFetchingEnabled
  );

  useEffect(() => {
    setIsFetchingEnabled(true);
  }, [searchTerm]);

  const {
    isPendingInvitationListOpen,
    setSearchKeyword,
    setEmployeeDataParams
  } = usePeopleStore((state) => state);

  useEffect(() => {
    if (employeeData?.pages) {
      const employeeDataItems = employeeData?.pages
        ?.map((page: any) => page)
        ?.flat();
      setEmployeeClockInDataItems(employeeDataItems);
      setIsConcatonationDone(true);
    } else if (isFetching && !isEmployeeDataLoading) {
      setIsConcatonationDone(true);
    } else {
      setIsConcatonationDone(false);
    }
  }, [
    employeeData,
    isEmployeeDataLoading,
    isFetching,
    isFetchingNextPage,
    isPendingInvitationListOpen
  ]);

  useEffect(() => {
    setSearchKeyword(searchTerm.trimStart());
  }, [searchTerm, setSearchKeyword]);

  useEffect(() => {
    setSearchTerm("");
    if (isPendingInvitationListOpen) {
      setEmployeeDataParams(DataFilterEnums.ACCOUNT_STATUS, [
        EmploymentStatusTypes.PENDING
      ]);
    }
  }, [isPendingInvitationListOpen, setEmployeeDataParams]);

  return (
    <Stack>
      <Box sx={{ mb: 2 }}>
        <SearchBox
          value={searchTerm}
          setSearchTerm={setSearchTerm}
          placeHolder={translateTexts(["employeeSearchPlaceholder"])}
        />
      </Box>

      <ClockInTable
        clockInData={employeeClockInDataItems}
        fetchNextPage={fetchNextPage}
        isFetching={isEmployeeDataLoading}
        isFetchingNextPage={isFetchingNextPage}
        onSearch={searchTerm?.length > 0}
        hasNextPage={hasNextPage}
        setSelectedFilters={setSelectedFilters}
        selectedFilters={selectedFilters}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        setIsFetchEnable={setIsFetchingEnabled}
      />
    </Stack>
  );
};

export default ClockInData;
