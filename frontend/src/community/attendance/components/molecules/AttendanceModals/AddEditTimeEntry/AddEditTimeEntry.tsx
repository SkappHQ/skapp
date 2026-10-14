import { Box, Stack, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
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
  TimeEntryFormValueType,
  TimeEntryTimeErrorsType,
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
import BasicChip from "~community/common/components/atoms/Chips/BasicChip/BasicChip";
import IconChip from "~community/common/components/atoms/Chips/IconChip.tsx/IconChip";
import Icon from "~community/common/components/atoms/Icon/Icon";
import TimeInput from "~community/common/components/atoms/TimeInput/TimeInput";
import Form from "~community/common/components/molecules/Form/Form";
import InputDate from "~community/common/components/molecules/InputDate/InputDate";
import InputField from "~community/common/components/molecules/InputField/InputField";
import { useDisplayZone } from "~community/common/hooks/useDisplayZone";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { datePatternReverse } from "~community/common/regex/regexPatterns";
import { IconName } from "~community/common/types/IconTypes";
import {
  convertYYYYMMDDToDateTime,
  currentDateIn,
  currentYear,
  formatDateWithOrdinalIndicator,
  getLocalDate,
  getMinDateOfYear
} from "~community/common/utils/dateTimeUtils";
import { useDefaultCapacity } from "~community/configurations/api/timeConfigurationApi";
import { useGetEmployeeLeaveRequests } from "~community/leave/api/MyRequestApi";
import { MY_LEAVE_REQUESTS_PER_PAGE } from "~community/leave/constants/stringConstants";
import { LeaveStatusEnums } from "~community/leave/enums/MyRequestEnums";
import { useGetAllHolidaysInfinite } from "~community/people/api/HolidayApi";

import styles from "./styles";

interface Props {
  setFromDateTime: Dispatch<SetStateAction<string>>;
  setToDateTime: Dispatch<SetStateAction<string>>;
}

const AddEditTimeEntry = ({ setFromDateTime, setToDateTime }: Props) => {
  const theme: Theme = useTheme();
  const translateText = useTranslator("attendanceModule", "timesheet");
  const entryZone = useDisplayZone();
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

  const { data: leaveRequests } = useGetEmployeeLeaveRequests({
    status: `${LeaveStatusEnums.APPROVED},${LeaveStatusEnums.PENDING}`,
    size: MY_LEAVE_REQUESTS_PER_PAGE
  });

  const {
    selectedDailyRecord,
    employeeTimesheetModalType,
    currentAddTimeChanges,
    setIsEmployeeTimesheetModalOpen,
    directManualTimeEntryEligibleEmployee,
    isSelfDirectTimeEntry
  } = useAttendanceStore((state) => state);

  const {
    handleTimeEntrySubmit,
    isSubmitDisabled,
    clockInOutWithPrevTimeValidation,
    clockInOutValidation,
    getNonexistentTimeErrors
  } = useAddEntry();

  const initialValues = {
    timeEntryDate: "",
    fromTime: "",
    toTime: ""
  };

  const getTimeEntryErrors = (
    formValues: TimeEntryFormValueType
  ): TimeEntryTimeErrorsType => {
    const nonexistentTimeErrors = getNonexistentTimeErrors(formValues);
    if (nonexistentTimeErrors.fromTime || nonexistentTimeErrors.toTime) {
      return nonexistentTimeErrors;
    }

    if (
      employeeTimesheetModalType ===
        EmployeeTimesheetModalTypes.EDIT_AVAILABLE_TIME_ENTRY ||
      employeeTimesheetModalType ===
        EmployeeTimesheetModalTypes.EDIT_LEAVE_TIME_ENTRY
    ) {
      return clockInOutWithPrevTimeValidation(
        formValues.fromTime,
        formValues.toTime,
        selectedDailyRecord?.timeSlots[0]?.startTime as string,
        selectedDailyRecord?.timeSlots[
          selectedDailyRecord?.timeSlots?.length - 1
        ]?.endTime as string
      );
    }

    if (
      employeeTimesheetModalType ===
        EmployeeTimesheetModalTypes.ADD_TIME_ENTRY ||
      employeeTimesheetModalType ===
        EmployeeTimesheetModalTypes.ADD_LEAVE_TIME_ENTRY ||
      employeeTimesheetModalType ===
        EmployeeTimesheetModalTypes.ADD_TIME_ENTRY_BY_TABLE
    ) {
      return clockInOutValidation(formValues.fromTime, formValues.toTime);
    }

    return {};
  };

  const { values, errors, setFieldValue, setFieldError, handleSubmit } =
    useFormik({
      initialValues,
      validationSchema: timeEntryValidation,
      validateOnChange: false,
      validateOnBlur: true,
      onSubmit: (values, { setFieldError: setTimeEntryFieldError }) => {
        const timeErrors = getTimeEntryErrors(values);

        if (timeErrors.fromTime || timeErrors.toTime) {
          if (timeErrors.fromTime) {
            setTimeEntryFieldError("fromTime", timeErrors.fromTime);
          }
          if (timeErrors.toTime) {
            setTimeEntryFieldError("toTime", timeErrors.toTime);
          }
          return;
        }

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
          selectedDailyRecord?.timeSlots[0]?.startTime as string,
          entryZone
        )
      );
      void setFieldValue(
        "toTime",
        convertTo12HourByDateString(
          selectedDailyRecord?.timeSlots[
            selectedDailyRecord?.timeSlots?.length - 1
          ].endTime as string,
          entryZone
        )
      );
    } else if (
      employeeTimesheetModalType ===
        EmployeeTimesheetModalTypes.ADD_LEAVE_TIME_ENTRY ||
      employeeTimesheetModalType ===
        EmployeeTimesheetModalTypes.ADD_TIME_ENTRY_BY_TABLE
    ) {
      void setFieldValue("timeEntryDate", selectedDailyRecord?.date);
      setSelectedDate(DateTime.fromISO(selectedDailyRecord?.date as string));
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
    setFieldValue,
    entryZone
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
        "BREAK",
        entryZone
      );
      setBreakHours(breakHours);

      const workHours = getTotalSlotTypeHours(
        selectedDailyRecord?.timeSlots as TimeSlotsType[],
        values.fromTime,
        values.toTime,
        "WORK",
        entryZone
      );
      setDuration(workHours);
    }
  }, [
    employeeTimesheetModalType,
    selectedDailyRecord?.timeSlots,
    values.fromTime,
    values.toTime,
    entryZone
  ]);

  useEffect(() => {
    if (values.timeEntryDate) {
      const timeEntryDate = DateTime.fromISO(values.toTime);
      setSelectedDate(timeEntryDate);
    }
  }, []);

  const clearTimeEntryTimeErrors = () => {
    setFieldError("fromTime", "");
    setFieldError("toTime", "");
  };

  const isDateReadOnly =
    employeeTimesheetModalType ===
      EmployeeTimesheetModalTypes.EDIT_AVAILABLE_TIME_ENTRY ||
    employeeTimesheetModalType ===
      EmployeeTimesheetModalTypes.ADD_TIME_ENTRY_BY_TABLE;

  return (
    <Form onSubmit={handleSubmit}>
      {directManualTimeEntryEligibleEmployee && !isSelfDirectTimeEntry && (
        <InputField
          label={translateText(["directEntryEmployeeLabel"])}
          inputName={"direct_entry_employee"}
          value={directManualTimeEntryEligibleEmployee.employeeName}
          labelStyles={classes.disabledInputFieldLabel}
          isDisabled
        />
      )}
      {(employeeTimesheetModalType ===
        EmployeeTimesheetModalTypes.ADD_TIME_ENTRY ||
        employeeTimesheetModalType ===
          EmployeeTimesheetModalTypes.ADD_TIME_ENTRY_BY_TABLE ||
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
          readOnly={isDateReadOnly}
          labelStyles={
            isDateReadOnly ? classes.disabledInputFieldLabel : undefined
          }
          placeholder={translateText(["datePickerPlaceholder"])}
          maxDate={convertYYYYMMDDToDateTime(currentDateIn(entryZone))}
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
            clearTimeEntryTimeErrors();
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
            clearTimeEntryTimeErrors();
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
        labelStyles={classes.disabledInputFieldLabel}
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
          labelStyles={classes.disabledInputFieldLabel}
          isDisabled
        />
      )}
      <div className="flex flex-row gap-3 mt-4 justify-end">
        <ButtonV2
          variant={"tertiary"}
          onClick={() => setIsEmployeeTimesheetModalOpen(false)}
          type={"reset"}
          icon={<Icon name={IconName.CLOSE_ICON} />}
          iconPosition="end"
        >
          {translateText(["cancelBtnTxt"])}
        </ButtonV2>
        <ButtonV2
          variant={"primary"}
          type={"submit"}
          disabled={isSubmitDisabled(
            values,
            isGetTimeAvailabilityLoading &&
              getAvailabilityFetchStatus !== "idle"
          )}
          icon={<Icon name={IconName.CHECK_ICON} />}
          iconPosition="end"
        >
          {directManualTimeEntryEligibleEmployee
            ? translateText(["directEntrySaveBtnTxt"])
            : translateText(["submitRequestBtnTxt"])}
        </ButtonV2>
      </div>
    </Form>
  );
};

export default AddEditTimeEntry;
