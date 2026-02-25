import { Box, Stack, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { rejects } from "assert";
import { useFormik } from "formik";
import { DateTime } from "luxon";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { useGetPeriodAvailability } from "~community/attendance/api/AttendanceEmployeeApi";
import {
  TIME_LENGTH,
  durationSelector,
  holidayDurationSelector
} from "~community/attendance/constants/constants";
import { EmployeeTimesheetModalTypes } from "~community/attendance/enums/timesheetEnums";
import useAddEntry from "~community/attendance/hooks/useAddEntry";
import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import {
  TimeAvailabilityType,
  TimeSlotsType
} from "~community/attendance/types/timeSheetTypes";
import {
  addHoursToTime,
  convert24TimeTo12Hour,
  convertTo12HourByDateObject,
  convertTo12HourByDateString,
  convertToDateObjectBy12Hour,
  getDuration,
  getTotalSlotTypeHours
} from "~community/attendance/utils/TimeUtils";
import { timeEntryValidation } from "~community/attendance/utils/validations";
import Button from "~community/common/components/atoms/Button/Button";
import BasicChip from "~community/common/components/atoms/Chips/BasicChip/BasicChip";
import IconChip from "~community/common/components/atoms/Chips/IconChip.tsx/IconChip";
import TimeInput from "~community/common/components/atoms/TimeInput/TimeInput";
import Form from "~community/common/components/molecules/Form/Form";
import InputDate from "~community/common/components/molecules/InputDate/InputDate";
import InputField from "~community/common/components/molecules/InputField/InputField";
import { attendanceModalsTestId } from "~community/common/constants/testIds";
import {
  ButtonStyle,
  ButtonTypes
} from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { datePatternReverse } from "~community/common/regex/regexPatterns";
import { IconName } from "~community/common/types/IconTypes";
import {
  currentYear,
  formatDateWithOrdinalIndicator,
  getLocalDate,
  getMinDateOfYear
} from "~community/common/utils/dateTimeUtils";
import { useDefaultCapacity } from "~community/configurations/api/timeConfigurationApi";
import { useGetEmployeeLeaveRequests } from "~community/leave/api/MyRequestApi";
import { LeaveStatusEnums } from "~community/leave/enums/MyRequestEnums";
import { useLeaveStore } from "~community/leave/store/store";
import { useGetAllHolidaysInfinite } from "~community/people/api/HolidayApi";

import styles from "./styles";

interface Props {
  setFromDateTime: Dispatch<SetStateAction<string>>;
  setToDateTime: Dispatch<SetStateAction<string>>;
}

const AddEditTimeEntry = ({ setFromDateTime, setToDateTime }: Props) => {
  const theme: Theme = useTheme();
  const translateText = useTranslator("attendanceModule", "timesheet");
  const [duration, setDuration] = useState<string>();
  const [breakHours, setBreakHours] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<DateTime | undefined>(
    undefined
  );
  const [timeAvailability, setTimeAvailability] =
    useState<TimeAvailabilityType>();
  const classes = styles(theme);
  const { data: timeConfigData } = useDefaultCapacity();

  const { data: allHolidays } = useGetAllHolidaysInfinite(
    currentYear.toString()
  );

  const { data: leaveRequests } = useGetEmployeeLeaveRequests();

  const { setLeaveRequestParams } = useLeaveStore((state) => state);

  useEffect(() => {
    setLeaveRequestParams("status", [
      LeaveStatusEnums.APPROVED,
      LeaveStatusEnums.PENDING
    ]);
  }, []);

  const {
    selectedDailyRecord,
    employeeTimesheetModalType,
    currentAddTimeChanges,
    setIsEmployeeTimesheetModalOpen
  } = useAttendanceStore((state) => state);

  const {
    isDurationValid,
    handleTimeEntrySubmit,
    isSubmitDisabled,
    clockInOutWithPrevTimeValidation,
    clockInOutValidation
  } = useAddEntry();

  const initialValues = {
    timeEntryDate: "",
    fromTime: "",
    toTime: ""
  };

  const { values, errors, setFieldValue, setFieldError, handleSubmit } =
    useFormik({
      initialValues,
      validationSchema: timeEntryValidation,
      validateOnChange: false,
      validateOnBlur: true,
      onSubmit: (values) => {
        handleTimeEntrySubmit(
          values,
          timeAvailability as TimeAvailabilityType,
          setFromDateTime,
          setToDateTime
        );
      }
    });

  const {
    data: timeAvailabilityForPeriod,
    refetch: getTimeAvailability,
    isLoading: isGetTimeAvailabilityLoading,
    fetchStatus: getAvailabilityFetchStatus
  } = useGetPeriodAvailability(
    values.timeEntryDate,
    values.fromTime,
    values.toTime
  );

  const isInvalidTimeForDisableButton = () => {
    if (
      employeeTimesheetModalType ===
        EmployeeTimesheetModalTypes.EDIT_AVAILABLE_TIME_ENTRY ||
      employeeTimesheetModalType ===
        EmployeeTimesheetModalTypes.EDIT_LEAVE_TIME_ENTRY
    ) {
      return clockInOutWithPrevTimeValidation(
        values.fromTime,
        values.toTime,
        selectedDailyRecord?.timeSlots[0]?.startTime as string,
        selectedDailyRecord?.timeSlots[
          selectedDailyRecord?.timeSlots?.length - 1
        ]?.endTime as string,
        false
      );
    } else if (
      employeeTimesheetModalType ===
        EmployeeTimesheetModalTypes.ADD_TIME_ENTRY ||
      employeeTimesheetModalType ===
        EmployeeTimesheetModalTypes.ADD_LEAVE_TIME_ENTRY ||
      employeeTimesheetModalType ===
        EmployeeTimesheetModalTypes.ADD_TIME_ENTRY_BY_TABLE
    ) {
      return clockInOutValidation(values.fromTime, values.toTime, false);
    } else {
      return false;
    }
  };

  useEffect(() => {
    if (
      values.timeEntryDate &&
      values.fromTime &&
      values.toTime &&
      datePatternReverse().test(values.timeEntryDate)
    ) {
      getTimeAvailability().catch(rejects);
    }
  }, [
    values.timeEntryDate,
    values.fromTime,
    values.toTime,
    getTimeAvailability
  ]);

  useEffect(() => {
    if (timeAvailabilityForPeriod) {
      setTimeAvailability(timeAvailabilityForPeriod);
    }
  }, [timeAvailabilityForPeriod]);

  useEffect(() => {
    setDuration("");
    if (
      values.fromTime?.length === TIME_LENGTH &&
      values.toTime?.length === TIME_LENGTH &&
      employeeTimesheetModalType !==
        EmployeeTimesheetModalTypes.EDIT_AVAILABLE_TIME_ENTRY &&
      employeeTimesheetModalType !==
        EmployeeTimesheetModalTypes.EDIT_AVAILABLE_TIME_ENTRY
    ) {
      const duration = getDuration(values.fromTime, values.toTime);
      if (!duration?.includes("-")) {
        setDuration(getDuration(values.fromTime, values.toTime));
      }
      // check - don't we need else condition
    }
  }, [values.fromTime, values.toTime]);

  useEffect(() => {
    if (
      currentAddTimeChanges &&
      employeeTimesheetModalType === EmployeeTimesheetModalTypes.ADD_TIME_ENTRY
    ) {
      void setFieldValue("fromTime", currentAddTimeChanges?.fromTime);
      void setFieldValue("toTime", currentAddTimeChanges?.toTime);
    } else if (
      timeConfigData &&
      (employeeTimesheetModalType ===
        EmployeeTimesheetModalTypes.ADD_TIME_ENTRY ||
        employeeTimesheetModalType ===
          EmployeeTimesheetModalTypes.ADD_LEAVE_TIME_ENTRY ||
        employeeTimesheetModalType ===
          EmployeeTimesheetModalTypes.ADD_TIME_ENTRY_BY_TABLE)
    ) {
      void setFieldValue(
        "fromTime",
        convert24TimeTo12Hour(timeConfigData?.[0]?.startTime as string)
      );
      void setFieldValue(
        "toTime",
        addHoursToTime(
          timeConfigData?.[0]?.startTime as string,
          timeConfigData?.[0]?.totalHours
        )
      );
    }
  }, [
    timeConfigData,
    employeeTimesheetModalType,
    setFieldValue,
    currentAddTimeChanges
  ]);

  useEffect(() => {
    if (
      employeeTimesheetModalType ===
        EmployeeTimesheetModalTypes.EDIT_AVAILABLE_TIME_ENTRY ||
      employeeTimesheetModalType ===
        EmployeeTimesheetModalTypes.EDIT_LEAVE_TIME_ENTRY
    ) {
      void setFieldValue("timeEntryDate", selectedDailyRecord?.date);
      setSelectedDate(DateTime.fromISO(selectedDailyRecord?.date as string));
      void setFieldValue(
        "fromTime",
        convertTo12HourByDateString(
          selectedDailyRecord?.timeSlots[0]?.startTime as string
        )
      );
      void setFieldValue(
        "toTime",
        convertTo12HourByDateString(
          selectedDailyRecord?.timeSlots[
            selectedDailyRecord?.timeSlots?.length - 1
          ].endTime as string
        )
      );
    } else if (
      employeeTimesheetModalType ===
        EmployeeTimesheetModalTypes.ADD_LEAVE_TIME_ENTRY ||
      employeeTimesheetModalType ===
        EmployeeTimesheetModalTypes.ADD_TIME_ENTRY_BY_TABLE
    ) {
      void setFieldValue("timeEntryDate", selectedDailyRecord?.date);
    } else if (
      employeeTimesheetModalType === EmployeeTimesheetModalTypes.ADD_TIME_ENTRY
    ) {
      if (currentAddTimeChanges) {
        void setFieldValue(
          "timeEntryDate",
          currentAddTimeChanges?.timeEntryDate
        );
      } else {
        void setFieldValue("timeEntryDate", "");
      }
    }
  }, [
    currentAddTimeChanges,
    employeeTimesheetModalType,
    selectedDailyRecord?.date,
    selectedDailyRecord?.timeSlots,
    setFieldValue
  ]);

  useEffect(() => {
    if (
      employeeTimesheetModalType ===
        EmployeeTimesheetModalTypes.EDIT_AVAILABLE_TIME_ENTRY ||
      employeeTimesheetModalType ===
        EmployeeTimesheetModalTypes.EDIT_LEAVE_TIME_ENTRY
    ) {
      const breakHours = getTotalSlotTypeHours(
        selectedDailyRecord?.timeSlots as TimeSlotsType[],
        values.fromTime,
        values.toTime,
        "BREAK"
      );
      setBreakHours(breakHours);

      const workHours = getTotalSlotTypeHours(
        selectedDailyRecord?.timeSlots as TimeSlotsType[],
        values.fromTime,
        values.toTime,
        "WORK"
      );
      isDurationValid(values.fromTime, values.toTime);
      setDuration(workHours);
    }
  }, [
    employeeTimesheetModalType,
    selectedDailyRecord?.timeSlots,
    values.fromTime,
    values.toTime
  ]);

  useEffect(() => {
    if (
      employeeTimesheetModalType ===
        EmployeeTimesheetModalTypes.EDIT_AVAILABLE_TIME_ENTRY ||
      employeeTimesheetModalType ===
        EmployeeTimesheetModalTypes.EDIT_LEAVE_TIME_ENTRY
    ) {
      clockInOutWithPrevTimeValidation(
        values.fromTime,
        values.toTime,
        selectedDailyRecord?.timeSlots[0]?.startTime as string,
        selectedDailyRecord?.timeSlots[
          selectedDailyRecord?.timeSlots?.length - 1
        ]?.endTime as string,
        true
      );
    } else if (
      employeeTimesheetModalType ===
        EmployeeTimesheetModalTypes.ADD_TIME_ENTRY ||
      employeeTimesheetModalType ===
        EmployeeTimesheetModalTypes.ADD_LEAVE_TIME_ENTRY ||
      employeeTimesheetModalType ===
        EmployeeTimesheetModalTypes.ADD_TIME_ENTRY_BY_TABLE
    ) {
      clockInOutValidation(values.fromTime, values.toTime, true);
    }
  }, [selectedDailyRecord?.timeSlots, values.fromTime, values.toTime]);

  useEffect(() => {
    if (values.timeEntryDate) {
      const timeEntryDate = DateTime.fromISO(values.toTime);
      setSelectedDate(timeEntryDate);
    }
  }, []);

  return (
    <Form onSubmit={handleSubmit}>
      {(employeeTimesheetModalType ===
        EmployeeTimesheetModalTypes.ADD_TIME_ENTRY ||
        employeeTimesheetModalType ===
          EmployeeTimesheetModalTypes.EDIT_AVAILABLE_TIME_ENTRY) && (
        <InputDate
          label={translateText(["dateInputLabel"])}
          onchange={async (newValue: string) => {
            await setFieldValue(
              "timeEntryDate",
              newValue ? getLocalDate(new Date(newValue)) : ""
            );
            setFieldError("timeEntryDate", "");
          }}
          isWithLeaves
          isWithHolidays
          error={errors.timeEntryDate}
          readOnly={
            employeeTimesheetModalType ===
            EmployeeTimesheetModalTypes.EDIT_AVAILABLE_TIME_ENTRY
          }
          placeholder={translateText(["datePickerPlaceholder"])}
          maxDate={DateTime.fromISO(new Date()?.toISOString()?.split("T")[0])}
          disableMaskedInput
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          holidays={allHolidays}
          myLeaveRequests={leaveRequests?.items ?? []}
          minDate={getMinDateOfYear()}
        />
      )}
      {(employeeTimesheetModalType ===
        EmployeeTimesheetModalTypes.ADD_LEAVE_TIME_ENTRY ||
        employeeTimesheetModalType ===
          EmployeeTimesheetModalTypes.EDIT_LEAVE_TIME_ENTRY) && (
        <Box sx={{ py: "1rem" }}>
          <Stack sx={classes.leaveDurationStack}>
            <Typography variant="body1">
              {translateText(["durationLabel"])}
            </Typography>
            <BasicChip
              label={
                selectedDailyRecord?.holiday
                  ? holidayDurationSelector[
                      selectedDailyRecord?.holiday?.holidayDuration
                    ]
                  : durationSelector[
                      selectedDailyRecord?.leaveRequest?.leaveState as string
                    ]
              }
              chipStyles={classes.leaveStateChip}
            />
            <BasicChip
              label={formatDateWithOrdinalIndicator(
                new Date(selectedDailyRecord?.date as string)
              )}
              chipStyles={classes.leaveDateChip}
            />
          </Stack>
          <Stack sx={classes.leaveDurationStack}>
            <Typography variant="body1">
              {translateText(["leaveTypeLabel"])}
            </Typography>
            <IconChip
              label={
                selectedDailyRecord?.holiday
                  ? selectedDailyRecord?.holiday?.name
                  : selectedDailyRecord?.leaveRequest?.leaveType?.name
              }
              icon={
                selectedDailyRecord?.holiday
                  ? "1f3d6-fe0f"
                  : selectedDailyRecord?.leaveRequest?.leaveType?.emojiCode
              }
              chipStyles={classes.leaveStateChip}
              isTruncated={false}
            />
          </Stack>
        </Box>
      )}
      <Stack sx={classes.timeStack}>
        <TimeInput
          label={
            employeeTimesheetModalType ===
              EmployeeTimesheetModalTypes.EDIT_AVAILABLE_TIME_ENTRY ||
            employeeTimesheetModalType ===
              EmployeeTimesheetModalTypes.EDIT_LEAVE_TIME_ENTRY
              ? translateText(["clockInLabel"])
              : translateText(["fromTimeLabel"])
          }
          time={convertToDateObjectBy12Hour(values.fromTime)}
          setTime={async (time: Date) => {
            await setFieldValue("fromTime", convertTo12HourByDateObject(time));
            setFieldError("fromTime", "");
          }}
          error={errors.fromTime}
        />
        <Typography sx={{ mt: "3.5rem" }}>-</Typography>
        <TimeInput
          label={
            employeeTimesheetModalType ===
              EmployeeTimesheetModalTypes.EDIT_AVAILABLE_TIME_ENTRY ||
            employeeTimesheetModalType ===
              EmployeeTimesheetModalTypes.EDIT_LEAVE_TIME_ENTRY
              ? translateText(["clockOutLabel"])
              : translateText(["toTimeLabel"])
          }
          time={convertToDateObjectBy12Hour(values.toTime)}
          setTime={async (time: Date) => {
            await setFieldValue("toTime", convertTo12HourByDateObject(time));
            setFieldError("toTime", "");
          }}
          error={errors.toTime}
        />
      </Stack>
      <InputField
        label={translateText(["workedHoursLabel"])}
        inputName={"worked_hours"}
        value={duration}
        placeHolder="0h 00m"
        componentStyle={classes.inputField}
        isDisabled
      />
      {(employeeTimesheetModalType ===
        EmployeeTimesheetModalTypes.EDIT_LEAVE_TIME_ENTRY ||
        employeeTimesheetModalType ===
          EmployeeTimesheetModalTypes.EDIT_AVAILABLE_TIME_ENTRY) && (
        <InputField
          label={translateText(["breakLabel"])}
          inputName={"break"}
          value={breakHours}
          placeHolder="0h 00m"
          componentStyle={classes.inputField}
          isDisabled
        />
      )}
      <Button
        label={translateText(["submitRequestBtnTxt"])}
        styles={classes.button}
        buttonStyle={ButtonStyle.PRIMARY}
        endIcon={IconName.CHECK_ICON}
        type={ButtonTypes.SUBMIT}
        dataTestId={attendanceModalsTestId.addEditTimeEntry.submitBtn}
        disabled={
          isSubmitDisabled(
            values,
            isGetTimeAvailabilityLoading &&
              getAvailabilityFetchStatus !== "idle"
          ) || isInvalidTimeForDisableButton()
        }
      />
      <Button
        label={translateText(["cancelBtnTxt"])}
        styles={classes.button}
        buttonStyle={ButtonStyle.TERTIARY}
        endIcon={IconName.CLOSE_ICON}
        onClick={() => setIsEmployeeTimesheetModalOpen(false)}
        type={ButtonTypes.RESET}
        dataTestId={attendanceModalsTestId.addEditTimeEntry.cancelBtn}
      />
    </Form>
  );
};

export default AddEditTimeEntry;
