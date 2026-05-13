import { debounce } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import { DateTime } from "luxon";
import { useRouter } from "next/router";
import { ChangeEvent, JSX, useCallback, useEffect, useState } from "react";

import { useGetAllWorkLocations } from "~community/common/api/WorkLocationApi";
import Icon from "~community/common/components/atoms/Icon/Icon";
import DurationSelector from "~community/common/components/molecules/DurationSelector/DurationSelector";
import InputDate from "~community/common/components/molecules/InputDate/InputDate";
import InputField from "~community/common/components/molecules/InputField/InputField";
import MultivalueDropdownList from "~community/common/components/molecules/MultiValueDropdownList/MultivalueDropdownList";
import ROUTES from "~community/common/constants/routes";
import { LONG_DATE_TIME_FORMAT } from "~community/common/constants/timeConstants";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { theme } from "~community/common/theme/theme";
import { LeaveStates } from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import { formatDate } from "~community/common/utils/commonUtil";
import { convertDateToFormat } from "~community/common/utils/dateTimeUtils";
import { useAddIndividualHoliday } from "~community/people/api/HolidayApi";
import {
  CONCURRENT_HOLIDAY,
  MAX_HOLIDAY_COUNT_PER_DAY,
  MAX_HOLIDAY_NAME_CHARACTERS
} from "~community/people/constants/configs";
import { usePeopleStore } from "~community/people/store/store";
import {
  HolidayDurationType,
  holiday,
  holidayBulkUploadResponse,
  holidayModalTypes
} from "~community/people/types/HolidayTypes";
import { holidayDatePreprocessor } from "~community/people/utils/holidayUtils/commonUtils";
import { addHolidayValidation } from "~community/people/utils/validation";

const ALL_LOCATIONS_ID = 0;
const ALL_LOCATIONS_LABEL = "All locations";

type Props = {
  holidays: holiday[] | undefined;
  holidayRefetch: () => void;
};

const AddEditHolidayModal = ({
  holidays,
  holidayRefetch
}: Props): JSX.Element => {
  const translateText = useTranslator("peopleModule", "holidays");
  const translateAria = useTranslator("peopleAria", "holiday");
  const router = useRouter();

  const { setToastMessage } = useToast();

  const {
    setIsHolidayModalOpen,
    newHolidayDetails,
    setHolidayDetails,
    setHolidayModalType,
    resetHolidayDetails,
    setIsBulkUpload,
    selectedYear
  } = usePeopleStore((state) => ({
    selectedYear: state.selectedYear,
    newHolidayDetails: state.newHolidayDetails,
    setIsBulkUpload: state.setIsBulkUpload,
    setHolidayDetails: state.setHolidayDetails,
    setHolidayModalType: state.setHolidayModalType,
    resetHolidayDetails: state.resetHolidayDetails,
    setIsHolidayModalOpen: state.setIsHolidayModalOpen
  }));

  const [duration, setDuration] = useState<string>(
    newHolidayDetails?.duration || ""
  );
  const [selectedDate, setSelectedDate] = useState<DateTime | undefined>(
    undefined
  );
  const [holidayData, setHolidayData] = useState<holiday[] | undefined>(
    holidays
  );
  const [selectedWorkLocationIds, setSelectedWorkLocationIds] = useState<
    number[]
  >([]);

  const currentYear = DateTime.now().year;
  const numericSelectedYear = parseInt(selectedYear, 10);

  const { data: workLocations } = useGetAllWorkLocations();
  const workLocationList = [
    { label: ALL_LOCATIONS_LABEL, value: ALL_LOCATIONS_ID },
    ...(workLocations ?? []).map((wl) => ({
      label: wl.name,
      value: wl.workLocationId
    }))
  ];

  const onSuccess = useCallback((response: holidayBulkUploadResponse): void => {
    if (
      response?.bulkRecordErrorLogs[0]?.errorMessage?.includes(
        CONCURRENT_HOLIDAY
      )
    ) {
      setToastMessage({
        toastType: ToastType.WARN,
        title: translateText(["maxholidayWarningTitle"]),
        description: translateText(["maxholidayWarningDescription"]),
        open: true
      });
    } else {
      setToastMessage({
        toastType: ToastType.SUCCESS,
        title: translateText(["addholidaySuccessTitle"]),
        description: translateText(["addholidaySuccessDescription"]),
        open: true
      });
    }
  }, []);

  const onError = useCallback((): void => {
    setToastMessage({
      toastType: ToastType.ERROR,
      title: translateText(["addholidayFailTitle"]),
      description: translateText(["addholidayFailDescription"]),
      open: true
    });
  }, []);

  const { mutate } = useAddIndividualHoliday(onSuccess, onError);

  const onMaxLimit = useCallback((): void => {
    setToastMessage({
      toastType: ToastType.WARN,
      title: translateText(["maxholidayWarningTitle"]),
      description: translateText(["maxholidayWarningDescription"]),
      open: true
    });
  }, []);

  const initialValues = {
    holidayReason: newHolidayDetails?.holidayReason || "",
    holidayDate: newHolidayDetails?.holidayDate || "",
    holidayColor:
      newHolidayDetails?.holidayColor || theme.palette.text.blackText,
    duration: newHolidayDetails?.duration || "",
    workLocation: [] as number[]
  };

  const handleAddNewHoliday = useCallback(async (): Promise<void> => {
    const dateFormatted = formatDate(newHolidayDetails?.holidayDate);

    const selectedLocationNames = selectedWorkLocationIds.includes(
      ALL_LOCATIONS_ID
    )
      ? [ALL_LOCATIONS_LABEL]
      : selectedWorkLocationIds.map(
          (id) =>
            workLocationList.find((wl) => wl.value === id)?.label as string
        );

    const payload = {
      date: dateFormatted ?? "",
      name: newHolidayDetails?.holidayReason,
      holidayDuration: newHolidayDetails?.duration,
      workLocations: selectedLocationNames
    };

    mutate({ holidayData: payload, selectedYear });
    resetHolidayDetails();
    setIsHolidayModalOpen(false);
  }, [
    newHolidayDetails,
    mutate,
    selectedWorkLocationIds,
    workLocationList,
    resetHolidayDetails,
    setIsHolidayModalOpen
  ]);

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    setFieldValue,
    setFieldError
  } = useFormik({
    initialValues,
    validationSchema: addHolidayValidation(translateText),
    onSubmit: handleAddNewHoliday,
    validateOnChange: false
  });

  const handleWorkLocationChange = useCallback(
    (value: (string | number)[]) => {
      const numericValues = value as number[];
      const wasAllSelected = selectedWorkLocationIds.includes(ALL_LOCATIONS_ID);
      const isAllNowSelected = numericValues.includes(ALL_LOCATIONS_ID);

      let newSelection: number[];
      if (!wasAllSelected && isAllNowSelected) {
        newSelection = [ALL_LOCATIONS_ID];
      } else if (wasAllSelected && numericValues.length > 1) {
        newSelection = numericValues.filter((id) => id !== ALL_LOCATIONS_ID);
      } else if (numericValues.length === 0) {
        newSelection = [];
      } else {
        newSelection = numericValues;
      }

      setSelectedWorkLocationIds(newSelection);
      void setFieldValue("workLocation", newSelection);
      if (newSelection.length > 0) {
        void setFieldError("workLocation", "");
      }
    },
    [selectedWorkLocationIds, setFieldValue, setFieldError]
  );

  const findHolidayAvailability = useCallback(
    (date: string | undefined): boolean | undefined => {
      if (date) {
        const holidayCount =
          holidayData?.filter((holiday) => holiday?.date === date)?.length ?? 0;
        return holidayCount >= MAX_HOLIDAY_COUNT_PER_DAY;
      }
      return false;
    },
    [holidayData]
  );

  const handleInput = debounce(async (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (
      name === "holidayReason" &&
      value.length > MAX_HOLIDAY_NAME_CHARACTERS
    ) {
      setFieldError(name, translateText(["maxCharacterLimitError"]));

      return;
    }

    await setFieldValue(name, value);
    setFieldError(name, "");
    setHolidayDetails({
      ...newHolidayDetails,
      [name]: value
    });
  }, 400);

  const dateOnChange = async (
    fieldName: string,
    newValue: string
  ): Promise<void> => {
    const formattedDate = holidayDatePreprocessor(newValue);
    const isMaxLimitReached = findHolidayAvailability(formattedDate);
    if (isMaxLimitReached) {
      onMaxLimit();
      await setFieldValue(fieldName, "");
    } else {
      const selectedValue = newValue?.toString().split("T")[0];
      await setFieldValue(fieldName, selectedValue);
      setHolidayDetails({
        ...newHolidayDetails,
        holidayDate: selectedValue
      });
      setFieldError(fieldName, "");
    }
  };
  useEffect(() => {
    setHolidayData(Array.isArray(holidays) ? holidays : []);
  }, [holidays]);

  useEffect(() => {
    if (values.holidayDate) {
      const holidayDateTime = DateTime.fromISO(values.holidayDate);
      setSelectedDate(holidayDateTime);
    }
  }, []);

  useEffect(() => {
    if (
      duration !== translateText(["duration"]) &&
      newHolidayDetails.duration !== HolidayDurationType.HALFDAY
    ) {
      void setFieldValue("duration", duration);
      void setFieldError("duration", "");
    } else {
      void setFieldValue("duration", "");
    }
  }, [newHolidayDetails.duration]);

  const onCloseClick = () => {
    if (!values.holidayDate && !values.duration && !values.holidayReason) {
      setIsHolidayModalOpen(false);
      resetHolidayDetails();
      setHolidayModalType(holidayModalTypes.NONE);
      setFieldValue("duration", "");
      setFieldValue("name", "");
      setFieldValue("holidayDate", "");
    } else {
      setIsHolidayModalOpen(true);
      setHolidayModalType(holidayModalTypes.HOLIDAY_EXIT_CONFIRMATION);
      setIsBulkUpload(false);
    }
  };

  const handleDuration = (selectedDuration: string): void => {
    setDuration(selectedDuration);

    if (selectedDuration === translateText(["FULLDAY"])) {
      setHolidayDetails({
        ...newHolidayDetails,
        duration:
          selectedDuration === translateText(["FULLDAY"])
            ? HolidayDurationType.FULLDAY
            : HolidayDurationType.HALFDAY,
        halfDayState: ""
      });
    } else {
      setHolidayDetails({
        ...newHolidayDetails,
        duration:
          selectedDuration === translateText(["HALFDAY_MORNING"])
            ? HolidayDurationType.HALFDAY_MORNING
            : HolidayDurationType.HALFDAY_EVENING,
        halfDayState: selectedDuration
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col">
        <InputField
          inputName="holidayReason"
          inputType="text"
          label={translateText(["holidayName"])}
          placeHolder={translateText(["holidayNamePlaceholder"])}
          componentStyle={{ marginTop: "1rem" }}
          onChange={handleChange}
          onInput={handleInput}
          value={values.holidayReason}
          error={errors.holidayReason}
          required
          inputProps={{ maxLength: 50 }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
        />
        <InputDate
          value={
            numericSelectedYear === currentYear
              ? DateTime.now()
              : DateTime.fromObject({
                  year: numericSelectedYear,
                  month: 1,
                  day: 1
                })
          }
          holidays={holidays}
          label={translateText(["date"])}
          onchange={async (newValue: string) => {
            await dateOnChange(
              "holidayDate",
              convertDateToFormat(new Date(newValue), LONG_DATE_TIME_FORMAT)
            );
          }}
          isWithHolidays
          error={errors.holidayDate}
          placeholder={translateText(["datePlaceholder"])}
          minDate={
            numericSelectedYear === currentYear
              ? DateTime.now()
              : DateTime.fromObject({
                  year: numericSelectedYear,
                  month: 1,
                  day: 1
                })
          }
          maxDate={DateTime.fromObject({
            year: numericSelectedYear,
            month: 12,
            day: 31
          })}
          inputFormat="dd/MM/yyyy"
          disableMaskedInput
          isPreviousHolidayDisabled
          required
          componentStyle={{}}
          placeHolder={translateText(["SelectADate"])}
          setSelectedDate={setSelectedDate}
          selectedDate={selectedDate}
          accessibility={{
            ariaLabel: translateAria(["selectDateField"])
          }}
        />

        <MultivalueDropdownList
          inputName="workLocationId"
          label={translateText(["workLocation"])}
          isMultiValue
          value={selectedWorkLocationIds}
          placeholder={translateText(["workLocationPlaceholder"])}
          onChange={handleWorkLocationChange}
          componentStyle={{
            mt: "0rem"
          }}
          isCheckSelected
          isErrorFocusOutlineNeeded={false}
          itemList={workLocationList}
          maxVisibleItems={4}
          isRequired
          onAddNewClickBtn={() => {
            router.push(`${ROUTES.SETTINGS.BASE}?tab=organization`);
          }}
          addNewClickBtnText={translateText(["addNewWorkLocation"])}
          error={errors.workLocation as string}
          ariaLabel={translateAria(["selectWorkLocation"])}
        />
        <DurationSelector
          label={translateText(["duration"])}
          onChange={(e) => handleDuration(e)}
          options={{
            fullDay: LeaveStates.FULL_DAY,
            halfDayMorning: LeaveStates.MORNING,
            halfDayEvening: LeaveStates.EVENING
          }}
          disabledOptions={{
            fullDay: false,
            halfDayMorning: false,
            halfDayEvening: false
          }}
          error={errors.duration}
          commonButtonStyles={{ height: "3.1875rem" }}
          value={duration}
          isRequired={true}
        />

        <div className="flex flex-row justify-end gap-3 mt-4">
          <ButtonV2
            variant={"tertiary"}
            type={"button"}
            onClick={onCloseClick}
            icon={<Icon name={IconName.CLOSE_ICON} />}
            iconPosition="end"
          >
            {translateText(["cancelBtnText"])}
          </ButtonV2>
          <ButtonV2
            variant={"primary"}
            type={"submit"}
            icon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
            iconPosition="end"
          >
            {translateText(["saveBtnText"])}
          </ButtonV2>
        </div>
      </div>
    </form>
  );
};

export default AddEditHolidayModal;
