import { useEffect, useMemo } from "react";

import { daysTypes } from "~community/common/constants/stringConstants";
import { DurationSelectorDisabledOptions } from "~community/common/types/MoleculeTypes";
import { convertYYYYMMDDToDateTime } from "~community/common/utils/dateTimeUtils";
import { useDefaultCapacity } from "~community/configurations/api/timeConfigurationApi";
import { useGetMyPolicyLeaveRequests } from "~community/leave/api/PolicyLeaveApi";
import { LeaveDurationTypes } from "~community/leave/enums/LeaveTypeEnums";
import { usePolicyLeaveStore } from "~community/leave/store/policyLeaveStore";
import { MyLeaveRequestPayloadType } from "~community/leave/types/MyRequests";
import {
  getDurationInitialValue,
  getDurationSelectorDisabledOptions
} from "~community/leave/utils/myRequests/applyLeaveModalUtils";
import {
  getPolicyPeriodYears,
  mapToBlockingLeaveRequests
} from "~community/leave/utils/policyLeave/policyLeaveUtils";
import { useGetAllHolidays } from "~community/people/api/HolidayApi";
import {
  useGetEmployeeById,
  useGetUserPersonalDetails
} from "~community/people/api/PeopleApi";
import { Holiday } from "~community/people/types/HolidayTypes";

interface PolicyLeaveCalendarData {
  allHolidays: Holiday[];
  workingDays: daysTypes[];
  blockingLeaveRequests: MyLeaveRequestPayloadType[];
  minDate: Date;
  maxDate: Date;
  disabledDurationOptions: DurationSelectorDisabledOptions;
}

const usePolicyLeaveCalendarData = (): PolicyLeaveCalendarData => {
  const { selectedYear, selectedPolicyBalance, selectedDates } =
    usePolicyLeaveStore((state) => ({
      selectedYear: state.selectedYear,
      selectedPolicyBalance: state.selectedPolicyBalance,
      selectedDates: state.selectedDates
    }));

  const setSelectedDuration = usePolicyLeaveStore(
    (state) => state.setSelectedDuration
  );

  const { startYear, endYear, spansTwoYears } = getPolicyPeriodYears(
    selectedPolicyBalance,
    selectedYear
  );

  const { data: timeConfig } = useDefaultCapacity();
  const { data: currentEmployee } = useGetUserPersonalDetails();

  const { data: employeeData, isLoading: isEmployeeDataLoading } =
    useGetEmployeeById(
      currentEmployee?.employeeId ? Number(currentEmployee.employeeId) : 0
    );

  const workLocationId =
    employeeData?.employment?.employmentDetails?.workLocationId;

  const { data: holidaysInStartYear } = useGetAllHolidays(
    startYear,
    true,
    undefined,
    workLocationId,
    !isEmployeeDataLoading
  );

  const { data: holidaysInEndYear } = useGetAllHolidays(
    endYear,
    true,
    undefined,
    workLocationId,
    !isEmployeeDataLoading && spansTwoYears
  );

  const { data: requestsInStartYear } = useGetMyPolicyLeaveRequests(startYear);
  const { data: requestsInEndYear } = useGetMyPolicyLeaveRequests(
    endYear,
    spansTwoYears
  );

  const allHolidays = useMemo(
    () => [
      ...(holidaysInStartYear ?? []),
      ...(spansTwoYears ? (holidaysInEndYear ?? []) : [])
    ],
    [holidaysInStartYear, holidaysInEndYear, spansTwoYears]
  );

  const workingDays = useMemo(
    () => timeConfig?.map((config) => config.day) ?? [],
    [timeConfig]
  );

  const blockingLeaveRequests = useMemo(
    () =>
      mapToBlockingLeaveRequests([
        ...(requestsInStartYear ?? []),
        ...(spansTwoYears ? (requestsInEndYear ?? []) : [])
      ]),
    [requestsInStartYear, requestsInEndYear, spansTwoYears]
  );

  const minDate = useMemo(
    () =>
      selectedPolicyBalance
        ? convertYYYYMMDDToDateTime(selectedPolicyBalance.validFrom).toJSDate()
        : new Date(),
    [selectedPolicyBalance]
  );

  const maxDate = useMemo(
    () =>
      selectedPolicyBalance
        ? convertYYYYMMDDToDateTime(selectedPolicyBalance.validTo).toJSDate()
        : new Date(),
    [selectedPolicyBalance]
  );

  const minDuration =
    selectedPolicyBalance?.leaveType?.minDuration ?? LeaveDurationTypes.NONE;

  const disabledDurationOptions = useMemo(
    () =>
      getDurationSelectorDisabledOptions({
        selectedDates,
        duration: minDuration,
        myLeaveRequests: blockingLeaveRequests,
        allHolidays
      }),
    [selectedDates, minDuration, blockingLeaveRequests, allHolidays]
  );

  useEffect(() => {
    setSelectedDuration(
      getDurationInitialValue({
        allowedDurations: minDuration,
        disabledOptions: disabledDurationOptions
      })
    );
  }, [minDuration, disabledDurationOptions, setSelectedDuration]);

  return {
    allHolidays,
    workingDays,
    blockingLeaveRequests,
    minDate,
    maxDate,
    disabledDurationOptions
  };
};

export default usePolicyLeaveCalendarData;
