import { SelectChangeEvent, Stack } from "@mui/material";
import { FormikErrors } from "formik";
import { DateTime } from "luxon";
import React, { useEffect, useMemo, useState } from "react";

import PeopleAutocompleteSearch from "~community/common/components/molecules/AutocompleteSearch/PeopleAutocompleteSearch";
import Form from "~community/common/components/molecules/Form/Form";
import InputDate from "~community/common/components/molecules/InputDate/InputDate";
import InputField from "~community/common/components/molecules/InputField/InputField";
import SquareSelect from "~community/common/components/molecules/SquareSelect/SquareSelect";
import { matchesNumberWithAtMostOneDecimalPlace } from "~community/common/regex/regexPatterns";
import { getEmoji } from "~community/common/utils/commonUtil";
import {
  formatDateToISO,
  getMaxDateOfYear,
  getMinDateOfYear,
  nextYear
} from "~community/common/utils/dateTimeUtils";
import { useGetLeaveTypes } from "~community/leave/api/LeaveTypesApi";
import {
  MAX_CUSTOM_LEAVE_ALLOCATION_DAYS_ALLOWED,
  MIN_CUSTOM_LEAVE_ALLOCATION_DAYS_ALLOWED
} from "~community/leave/constants/stringConstants";
import { LeaveDurationTypes } from "~community/leave/enums/LeaveTypeEnums";
import { useLeaveStore } from "~community/leave/store/store";
import {
  CustomLeaveAllocationModalTypes,
  CustomLeaveAllocationType
} from "~community/leave/types/CustomLeaveAllocationTypes";
import { useGetSearchedEmployees } from "~community/people/api/PeopleApi";
import { EmployeeType } from "~community/people/types/EmployeeTypes";

interface Props {
  values: CustomLeaveAllocationType;
  errors: FormikErrors<CustomLeaveAllocationType>;
  setFieldValue: (
    field: string,
    value: CustomLeaveAllocationType | number | Date | EmployeeType | string
  ) => void;
  setFieldError: (field: string, message: string | undefined) => void;
  translateText: (keys: string[]) => string;
  onSubmit: () => void;
  datesDisabled?: boolean;
}

const CustomLeaveAllocationForm: React.FC<Props> = ({
  values,
  errors,
  setFieldValue,
  setFieldError,
  translateText,
  onSubmit,
  datesDisabled
}) => {
  const [selectedValidFromDate, setSelectedValidFromDate] = useState<
    DateTime | undefined
  >(undefined);
  const [selectedValidToDate, setSelectedValidToDate] = useState<
    DateTime | undefined
  >(undefined);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const {
    customLeaveAllocationModalType,
    currentEditingLeaveAllocation,
    selectedYear
  } = useLeaveStore((state) => ({
    customLeaveAllocationModalType: state.customLeaveAllocationModalType,
    currentEditingLeaveAllocation: state.currentEditingLeaveAllocation,
    selectedYear: state.selectedYear
  }));

  useEffect(() => {
    if (
      customLeaveAllocationModalType ===
        CustomLeaveAllocationModalTypes.EDIT_LEAVE_ALLOCATION &&
      currentEditingLeaveAllocation?.assignedTo
    ) {
      const employeeName =
        `${currentEditingLeaveAllocation.assignedTo.firstName ?? ""} ${
          currentEditingLeaveAllocation.assignedTo.lastName ?? ""
        }`.trim();
      setSearchTerm(employeeName);
    }
  }, [customLeaveAllocationModalType, currentEditingLeaveAllocation]);

  useEffect(() => {
    if (
      customLeaveAllocationModalType ===
      CustomLeaveAllocationModalTypes.ADD_LEAVE_ALLOCATION
    ) {
      const employeeName = `${values.name ?? ""}`.trim();
      setSearchTerm(employeeName);
    }
  }, [customLeaveAllocationModalType, values.name]);

  const { data: leaveTypesData } = useGetLeaveTypes();

  const { data: suggestions, isPending: isSuggestionsPending } =
    useGetSearchedEmployees(searchTerm?.length > 0 ? searchTerm : "");

  const leaveTypesDropDownList = useMemo(() => {
    if (leaveTypesData === undefined) {
      return [];
    }

    const activeLeaveTypes = leaveTypesData?.filter(
      (leaveType) => leaveType.isActive
    );

    if (activeLeaveTypes === undefined) {
      return [];
    }

    return activeLeaveTypes.map((leaveType) => {
      const emoji = getEmoji(leaveType.emojiCode);

      return {
        value: leaveType.typeId,
        label: `${emoji} ${leaveType.name}`
      };
    });
  }, [leaveTypesData]);

  useEffect(() => {
    if (values.employeeId && suggestions) {
      const selectedUser = suggestions.find(
        (user) => user.employeeId === values.employeeId
      );
      if (selectedUser) {
        setSearchTerm(`${selectedUser.firstName} ${selectedUser.lastName}`);
      }
    }
  }, [values.employeeId, suggestions]);

  const onSelectUser = async (user: EmployeeType): Promise<void> => {
    if (user) {
      setFieldValue("employeeId", Number(user.employeeId));
      const fullName = `${user.firstName} ${user.lastName}`.trim();
      setFieldValue("name", fullName);
      setFieldValue("assignedTo", user);
      setSearchTerm(fullName);
    }
  };

  const handleLeaveTypeChange = (e: SelectChangeEvent) => {
    const selectedValue = e.target.value;

    const selectedLeaveType = Array.isArray(leaveTypesData)
      ? (leaveTypesData.find(
          (type) =>
            (type as unknown as CustomLeaveAllocationType).typeId ===
            Number(selectedValue)
        ) as CustomLeaveAllocationType | undefined)
      : undefined;

    setFieldValue("typeId", selectedLeaveType ? selectedLeaveType.typeId : 0);
    setFieldError("typeId", undefined);
  };

  const handleNumberOfDaysOffChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    const numericValue = parseFloat(value);

    const selectedLeaveType = leaveTypesData?.find(
      (leaveType) => leaveType.typeId === values.typeId
    );

    if (selectedLeaveType) {
      const { leaveDuration } = selectedLeaveType;

      if (value === "") {
        setFieldValue("numberOfDaysOff", "");
        setFieldError("numberOfDaysOff", "");
        return;
      }

      if (
        leaveDuration === LeaveDurationTypes.FULL_DAY &&
        value.includes(".")
      ) {
        setFieldValue("numberOfDaysOff", value);
        setFieldError(
          "numberOfDaysOff",
          translateText(["validNoOfDaysFullDayError"])
        );
        return;
      }
    }

    if (numericValue % MIN_CUSTOM_LEAVE_ALLOCATION_DAYS_ALLOWED !== 0) {
      setFieldError(
        "numberOfDaysOff",
        translateText(["validNoOfDaysIncrementError"])
      );
      return;
    }

    if (
      matchesNumberWithAtMostOneDecimalPlace().test(value) &&
      MIN_CUSTOM_LEAVE_ALLOCATION_DAYS_ALLOWED <= numericValue &&
      numericValue <= MAX_CUSTOM_LEAVE_ALLOCATION_DAYS_ALLOWED
    ) {
      setFieldValue("numberOfDaysOff", value);
      setFieldError("numberOfDaysOff", "");
      return;
    } else {
      if (numericValue < MIN_CUSTOM_LEAVE_ALLOCATION_DAYS_ALLOWED) {
        setFieldValue("numberOfDaysOff", value);
        setFieldError(
          "numberOfDaysOff",
          translateText(["validNoOfDaysLowerRangeError"])
        );
        return;
      } else if (MAX_CUSTOM_LEAVE_ALLOCATION_DAYS_ALLOWED < numericValue) {
        setFieldValue("numberOfDaysOff", value);
        setFieldError(
          "numberOfDaysOff",
          translateText(["validNoOfDaysUpperRangeError"])
        );
        return;
      }
    }
  };

  useEffect(() => {
    if (values.validFromDate) {
      const formattedValidFromDate = DateTime.fromISO(values.validFromDate);
      setSelectedValidFromDate(formattedValidFromDate);
    }
    if (values.validToDate) {
      const formattedValidToDate = DateTime.fromISO(values.validToDate);
      setSelectedValidToDate(formattedValidToDate);
    }
  }, [values.validFromDate, values.validToDate]);

  const validateDateRange = (
    validFromDate: string | undefined,
    validToDate: string | undefined
  ): boolean => {
    if (!validFromDate || !validToDate) return true;
    const validFrom = DateTime.fromISO(validFromDate);
    const validTo = DateTime.fromISO(validToDate);
    return validFrom.isValid && validTo.isValid && validFrom <= validTo;
  };

  const handleFromDateChange = async (newValue: string) => {
    const datePart = formatDateToISO(newValue);
    await setFieldValue("validFromDate", datePart);

    const validFrom = DateTime.fromISO(datePart);
    if (!validFrom.isValid) {
      setFieldError("validFromDate", translateText(["invalidDateFormat"]));
      return;
    }

    if (values.validToDate) {
      if (!validateDateRange(datePart, values.validToDate)) {
        setFieldError(
          "validFromDate",
          translateText(["fromDateMustBeBeforeToDate"])
        );
        return;
      }
    }

    setFieldError("validFromDate", undefined);
    setFieldError("validToDate", undefined);
    setSelectedValidFromDate(validFrom);
  };

  const handleToDateChange = async (newValue: string) => {
    const datePart = formatDateToISO(newValue);
    await setFieldValue("validToDate", datePart);

    const to = DateTime.fromISO(datePart);
    if (!to.isValid) {
      setFieldError("validToDate", translateText(["invalidDateFormat"]));
      return;
    }

    if (values.validFromDate) {
      if (!validateDateRange(values.validFromDate, datePart)) {
        setFieldError(
          "validToDate",
          translateText(["toDateMustBeAfterFromDate"])
        );
        return;
      }
    }

    setFieldError("validFromDate", undefined);
    setFieldError("validToDate", undefined);
    setSelectedValidToDate(to);
  };

  const isLeaveTypeSelected = !values.typeId;

  const leaveType =
    leaveTypesData?.find(
      (leaveType) => Number(leaveType.typeId) === values.typeId
    )?.typeId ?? "";

  return (
    <Form onSubmit={onSubmit}>
      <PeopleAutocompleteSearch
        name="leave-allocation-employee-name"
        required={true}
        id={{
          textField: "leave-allocation-employee-name-text-field",
          autocomplete: "leave-allocation-name-autocomplete"
        }}
        label={translateText(["leaveAllocationNameInputLabel"])}
        placeholder={translateText(["searchEmployeePlaceholder"])}
        options={(suggestions ?? []) as EmployeeType[]}
        value={values.assignedTo}
        inputValue={searchTerm}
        onInputChange={(value) => setSearchTerm(value)}
        onChange={(value) => onSelectUser(value)}
        error={errors.employeeId}
        isDisabled={
          customLeaveAllocationModalType ===
          CustomLeaveAllocationModalTypes.EDIT_LEAVE_ALLOCATION
        }
        isLoading={isSuggestionsPending}
      />

      <Stack spacing={2} sx={{ mt: 2 }}>
        <SquareSelect
          id="leave-allocation-leave-type-select"
          label={translateText(["CustomLeaveAllocationTypeInputLabel"])}
          placeholder={translateText(["leaveTypePlaceholder"])}
          error={errors.typeId}
          value={leaveType.toString()}
          options={leaveTypesDropDownList}
          onChange={handleLeaveTypeChange}
          disabled={
            customLeaveAllocationModalType ===
            CustomLeaveAllocationModalTypes.EDIT_LEAVE_ALLOCATION
          }
          required
        />
        <InputField
          id="leave-allocation-number-of-days-input"
          inputName="numberOfDaysOff"
          inputType="text"
          inputProps={{
            min: MIN_CUSTOM_LEAVE_ALLOCATION_DAYS_ALLOWED,
            max: MAX_CUSTOM_LEAVE_ALLOCATION_DAYS_ALLOWED,
            step: MIN_CUSTOM_LEAVE_ALLOCATION_DAYS_ALLOWED
          }}
          label={translateText(["leaveAllocationNumberOfDaysInputLabel"])}
          placeHolder={translateText(["noOfDaysPlaceholder"])}
          labelStyles={{ fontWeight: 500 }}
          error={errors.numberOfDaysOff}
          value={
            values.numberOfDaysOff ? values.numberOfDaysOff.toString() : ""
          }
          onChange={handleNumberOfDaysOffChange}
          isDisabled={isLeaveTypeSelected}
          required
        />
      </Stack>

      <Stack
        direction="row"
        alignItems="flex-start"
        gap="16px"
        marginTop="1rem"
        justifyContent={"space-between"}
      >
        <InputDate
          label={translateText(["effectiveDate"])}
          onchange={handleFromDateChange}
          isWithHolidays
          error={errors.validFromDate}
          placeholder={translateText(["validFromDate"])}
          minDate={getMinDateOfYear()}
          maxDate={
            values.validToDate
              ? DateTime.fromISO(values.validToDate)
              : getMaxDateOfYear(nextYear)
          }
          inputFormat="dd/MM/yyyy"
          disableMaskedInput
          isPreviousHolidayDisabled
          selectedDate={selectedValidFromDate}
          setSelectedDate={setSelectedValidFromDate}
          initialMonthlyView={getMinDateOfYear(Number(selectedYear))}
          disabled={datesDisabled}
        />
        <InputDate
          label={translateText(["expirationDate"])}
          onchange={handleToDateChange}
          isWithHolidays
          error={errors.validToDate}
          placeholder={translateText(["validToDate"])}
          minDate={
            values.validFromDate
              ? DateTime.fromISO(values.validFromDate)
              : getMinDateOfYear()
          }
          maxDate={getMaxDateOfYear(nextYear)}
          inputFormat="dd/MM/yyyy"
          disableMaskedInput
          isPreviousHolidayDisabled
          selectedDate={selectedValidToDate}
          setSelectedDate={setSelectedValidToDate}
          initialMonthlyView={getMaxDateOfYear(Number(selectedYear))}
          disabled={datesDisabled}
        />
      </Stack>
    </Form>
  );
};

export default CustomLeaveAllocationForm;
