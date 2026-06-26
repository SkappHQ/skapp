import React from "react";

import { isDateGraterThanToday } from "~community/common/utils/dateTimeUtils";
import {
  Holiday,
  HolidayDataType,
  holidayModalTypes
} from "~community/people/types/HolidayTypes";

export const isDeleteButtonDisabled = (
  holidayData: Holiday[] | undefined
): boolean => {
  if (holidayData && holidayData?.length > 0) {
    const currentDate = new Date().toISOString().slice(0, 10);
    const filteredHolidays = holidayData?.filter(
      (holiday: HolidayDataType) => (holiday?.date || "") < currentDate
    );

    return filteredHolidays?.length === holidayData?.length;
  }

  return holidayData?.length === 0;
};

export const getFutureHolidays = (
  holidayData: Holiday[] | undefined
): Holiday[] => {
  if (holidayData && holidayData?.length > 0) {
    const filteredHolidays = holidayData?.filter((holiday: HolidayDataType) => {
      return isDateGraterThanToday(holiday?.date || "");
    });

    return filteredHolidays;
  }

  return [];
};

export const getSelectAllCheckboxVisibility = (
  isPeopleAdmin: boolean | undefined,
  holidayData: Holiday[] | undefined
): boolean => {
  if (!isPeopleAdmin || !holidayData) {
    return false;
  }

  const futureHolidays = getFutureHolidays(holidayData);

  return futureHolidays?.length !== 0;
};

export const getSelectAllCheckboxCheckedStatus = (
  holidayData: Holiday[] | undefined,
  selectedHolidays: number[]
): boolean => {
  if (selectedHolidays.length > 0) {
    const futureHolidays = getFutureHolidays(holidayData);

    return futureHolidays.every((holiday) =>
      selectedHolidays.includes(holiday.id)
    );
  }
  return false;
};

export const handleSelectAllCheckboxClick = (
  holidayData: Holiday[] | undefined,
  selectedHolidays: number[],
  setSelectedHolidays: React.Dispatch<React.SetStateAction<number[]>>
) => {
  const futureHolidays = getFutureHolidays(holidayData);

  if (selectedHolidays.length === futureHolidays?.length) {
    setSelectedHolidays([]);
  } else {
    setSelectedHolidays(
      futureHolidays?.map((holiday) => holiday.id || 0) || []
    );
  }
};

export const handleIndividualDelete = (
  holidayId: number,
  setIndividualDeleteId: (id: number) => void,
  setPopupTitle: ((title: string) => string | undefined) | undefined,
  setIsHolidayModalOpen: ((isOpen: boolean) => void) | undefined,
  setHolidayModalType: ((type: holidayModalTypes) => void) | undefined,
  translateText: (key: string[]) => string
) => {
  setIndividualDeleteId(holidayId);
  if (setPopupTitle && setIsHolidayModalOpen && setHolidayModalType) {
    setPopupTitle(translateText(["holidayDeleteModalTitle"]));
    setHolidayModalType(holidayModalTypes.HOLIDAY_INDIVIDUAL_DELETE);
    setIsHolidayModalOpen(true);
  }
};

export const handleAddHolidayButtonClick = (
  setHolidayModalType: (type: holidayModalTypes) => void,
  setIsHolidayModalOpen: (isOpen: boolean) => void,
  ongoingQuickSetup: { SETUP_HOLIDAYS: boolean },
  destroyDriverObj: () => void
) => {
  setHolidayModalType(holidayModalTypes.ADD_CALENDAR);
  setIsHolidayModalOpen(true);

  if (ongoingQuickSetup.SETUP_HOLIDAYS) {
    destroyDriverObj();
  }
};

export const handleIndividualSelectClick =
  (
    id: number,
    setSelectedHolidays: React.Dispatch<React.SetStateAction<number[]>>
  ) =>
  () => {
    setSelectedHolidays((prevSelectedHolidays) => {
      if (!prevSelectedHolidays.includes(id)) {
        return [...prevSelectedHolidays, id];
      } else {
        return prevSelectedHolidays.filter((selectedId) => selectedId !== id);
      }
    });
  };

export const handleBulkDeleteClick = (
  selectedHolidays: number[],
  setSelectedDeleteIds: (ids: number[]) => void,
  setPopupTitle: ((title: string) => string | undefined) | undefined,
  setIsHolidayModalOpen: ((isOpen: boolean) => void) | undefined,
  setHolidayModalType: ((type: holidayModalTypes) => void) | undefined,
  translateText: (key: string[]) => string
) => {
  if (selectedHolidays.length) {
    setSelectedDeleteIds(selectedHolidays);
    if (setPopupTitle && setIsHolidayModalOpen && setHolidayModalType) {
      setPopupTitle(translateText(["holidayDeleteModalTitle"]));
      setHolidayModalType(holidayModalTypes.HOLIDAY_SELECTED_DELETE);
      setIsHolidayModalOpen(true);
    }
  } else {
    if (setPopupTitle && setIsHolidayModalOpen && setHolidayModalType) {
      setSelectedDeleteIds(selectedHolidays);
      setPopupTitle(translateText(["holidayDeleteModalTitle"]));
      setHolidayModalType(holidayModalTypes.HOLIDAY_BULK_DELETE);
      setIsHolidayModalOpen(true);
    }
  }
};
