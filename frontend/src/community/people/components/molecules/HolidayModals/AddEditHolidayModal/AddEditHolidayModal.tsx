import { debounce } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import { DateTime } from "luxon";
import { useRouter } from "next/router";
import {
  ChangeEvent,
  JSX,
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import DropdownAutocomplete from "~community/common/components/molecules/DropdownAutocomplete/DropdownAutocomplete";
import DurationSelector from "~community/common/components/molecules/DurationSelector/DurationSelector";
import InputDate from "~community/common/components/molecules/InputDate/InputDate";
import InputField from "~community/common/components/molecules/InputField/InputField";
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
import {
  useAddIndividualHoliday,
  useGetWorkLocations
} from "~community/people/api/HolidayApi";
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

  const {
    data: workLocationData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetWorkLocations();

  const ALL_LOCATIONS_OPTION = {
    value: "All locations",
    label: "All locations"
  };

  const workLocationDropDownList = useMemo(() => {
    if (workLocationData === undefined) {
      return [ALL_LOCATIONS_OPTION];
    }

    const pages = (workLocationData as any)?.pages ?? [];

    const locations = pages
      .flatMap((page: { items?: { workLocationId: number; name: string }[] }) =>
        (page?.items ?? []).map((workLocation) => ({
          value: workLocation.name,
          label: workLocation.name
        }))
      )
      .sort((a: { label: string }, b: { label: string }) =>
        a.label.localeCompare(b.label)
      );

    return [ALL_LOCATIONS_OPTION, ...locations];
  }, [workLocationData]);

  const [selectedWorkLocations, setSelectedWorkLocations] = useState<
    { value: string; label: string }[]
  >([]);

  const handleWorkLocationChange = (
    _e: SyntheticEvent,
    newValue: { value: string; label: string }[]
  ): void => {
    if (!Array.isArray(newValue)) return;

    const wasAllLocationsSelected = selectedWorkLocations.some(
      (v) => v.value === ALL_LOCATIONS_OPTION.value
    );
    const isAllLocationsInNew = newValue.some(
      (v) => v.value === ALL_LOCATIONS_OPTION.value
    );

    if (!wasAllLocationsSelected && isAllLocationsInNew) {
      setSelectedWorkLocations([ALL_LOCATIONS_OPTION]);
    } else if (wasAllLocationsSelected && newValue.length > 1) {
      setSelectedWorkLocations(
        newValue.filter((v) => v.value !== ALL_LOCATIONS_OPTION.value)
      );
    } else if (newValue.length === 0) {
      setSelectedWorkLocations([ALL_LOCATIONS_OPTION]);
    } else {
      setSelectedWorkLocations(newValue);
    }
  };

  const [duration, setDuration] = useState<string>(
    newHolidayDetails?.duration || ""
  );
  const [selectedDate, setSelectedDate] = useState<DateTime | undefined>(
    undefined
  );
  const [holidayData, setHolidayData] = useState<holiday[] | undefined>(
    holidays
  );

  const currentYear = DateTime.now().year;
  const numericSelectedYear = parseInt(selectedYear, 10);

  const onSuccess = useCallback(
    (response: holidayBulkUploadResponse): void => {
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
        resetHolidayDetails();
        setIsHolidayModalOpen(false);
      }
    },
    [resetHolidayDetails, setIsHolidayModalOpen]
  );

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
    duration: newHolidayDetails?.duration || ""
  };

  const handleAddNewHoliday = useCallback(async (): Promise<void> => {
    const dateFormatted = formatDate(newHolidayDetails?.holidayDate);

    const payload = {
      date: dateFormatted ?? "",
      name: newHolidayDetails?.holidayReason,
      holidayDuration: newHolidayDetails?.duration
    };

    mutate({ holidayData: payload, selectedYear });
    resetHolidayDetails();
    setIsHolidayModalOpen(false);
  }, [newHolidayDetails, mutate]);

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
    holidayRefetch();
  }, []);

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
        <DropdownAutocomplete
          inputName="workLocation"
          label={translateText(["workLocation"])}
          placeholder={translateText(["workLocationPlaceholder"])}
          itemList={workLocationDropDownList}
          required
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          isDisableOptionFilter
          multiple
          value={selectedWorkLocations}
          onChange={handleWorkLocationChange as any}
          actionItem={{
            label: "Add work location +",
            onClick: () => {
              void router.push(`${ROUTES.CONFIGURATIONS.BASE}?tab=attendance`);
            }
          }}
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
