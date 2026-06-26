import {
  Holiday,
  holidayModalTypes
} from "~community/people/types/HolidayTypes";

import {
  getFutureHolidays,
  getSelectAllCheckboxCheckedStatus,
  getSelectAllCheckboxEnableStatus,
  handleAddHolidayButtonClick,
  handleBulkDeleteClick,
  handleIndividualDelete,
  handleIndividualSelectClick,
  handleSelectAllCheckboxClick,
  isDeleteButtonDisabled
} from "./holidayTableUtils";

describe("holidayTableUtils", () => {
  describe("isDeleteButtonDisabled", () => {
    it("should return true if all holidays are in the past", () => {
      const holidayData = [
        { date: "2023-01-01" },
        { date: "2023-02-01" }
      ] as Holiday[];
      expect(isDeleteButtonDisabled(holidayData)).toBe(true);
    });

    it("should return false if there are future holidays", () => {
      const holidayData = [
        { date: "2023-01-01" },
        { date: "2099-01-01" }
      ] as Holiday[];
      expect(isDeleteButtonDisabled(holidayData)).toBe(false);
    });

    it("should return true if holidayData is empty", () => {
      expect(isDeleteButtonDisabled([])).toBe(true);
    });
  });

  describe("getFutureHolidays", () => {
    it("should return only future holidays", () => {
      const holidayData = [
        { date: "2023-01-01" },
        { date: "2099-01-01" }
      ] as Holiday[];
      const result = getFutureHolidays(holidayData);
      expect(result).toHaveLength(1);
      expect(result[0].date).toBe("2099-01-01");
    });

    it("should return an empty array if no future holidays exist", () => {
      const holidayData = [{ date: "2023-01-01" }] as Holiday[];
      expect(getFutureHolidays(holidayData)).toEqual([]);
    });
  });

  describe("getSelectAllCheckboxEnableStatus", () => {
    it("should return true if user is admin and there are future holidays", () => {
      const holidayData = [{ date: "2099-01-01" }] as Holiday[];
      expect(getSelectAllCheckboxEnableStatus(true, holidayData)).toBe(true);
    });

    it("should return false if user is not admin", () => {
      const holidayData = [{ date: "2099-01-01" }] as Holiday[];
      expect(getSelectAllCheckboxEnableStatus(false, holidayData)).toBe(false);
    });

    it("should return false if no future holidays exist", () => {
      const holidayData = [{ date: "2023-01-01" }] as Holiday[];
      expect(getSelectAllCheckboxEnableStatus(true, holidayData)).toBe(false);
    });
  });

  describe("getSelectAllCheckboxCheckedStatus", () => {
    it("should return true if all future holidays are selected", () => {
      const holidayData = [{ id: 1, date: "2099-01-01" }] as Holiday[];
      const selectedHolidays = [1];
      expect(
        getSelectAllCheckboxCheckedStatus(holidayData, selectedHolidays)
      ).toBe(true);
    });

    it("should return false if not all future holidays are selected", () => {
      const holidayData = [
        { id: 1, date: "2099-01-01" },
        { id: 2, date: "2099-02-01" }
      ] as Holiday[];
      const selectedHolidays = [1];
      expect(
        getSelectAllCheckboxCheckedStatus(holidayData, selectedHolidays)
      ).toBe(false);
    });
  });

  describe("handleSelectAllCheckboxClick", () => {
    it("should select all future holidays if none are selected", () => {
      const holidayData = [
        { id: 1, date: "2099-01-01" },
        { id: 2, date: "2099-02-01" }
      ] as Holiday[];
      const setSelectedHolidays = jest.fn();
      handleSelectAllCheckboxClick(holidayData, [], setSelectedHolidays);
      expect(setSelectedHolidays).toHaveBeenCalledWith([1, 2]);
    });

    it("should deselect all holidays if all are selected", () => {
      const holidayData = [
        { id: 1, date: "2099-01-01" },
        { id: 2, date: "2099-02-01" }
      ] as Holiday[];
      const setSelectedHolidays = jest.fn();
      handleSelectAllCheckboxClick(holidayData, [1, 2], setSelectedHolidays);
      expect(setSelectedHolidays).toHaveBeenCalledWith([]);
    });
  });

  describe("handleIndividualDelete", () => {
    it("should set individual delete state and open modal", () => {
      const setIndividualDeleteId = jest.fn();
      const setPopupTitle = jest.fn();
      const setIsHolidayModalOpen = jest.fn();
      const setHolidayModalType = jest.fn();
      const translateText = (key: string[]) => key[0];

      handleIndividualDelete(
        1,
        setIndividualDeleteId,
        setPopupTitle,
        setIsHolidayModalOpen,
        setHolidayModalType,
        translateText
      );

      expect(setIndividualDeleteId).toHaveBeenCalledWith(1);
      expect(setPopupTitle).toHaveBeenCalledWith("holidayDeleteModalTitle");
      expect(setIsHolidayModalOpen).toHaveBeenCalledWith(true);
      expect(setHolidayModalType).toHaveBeenCalledWith(
        holidayModalTypes.HOLIDAY_INDIVIDUAL_DELETE
      );
    });
  });

  describe("handleAddHolidayButtonClick", () => {
    it("should set modal type and open modal", () => {
      const setHolidayModalType = jest.fn();
      const setIsHolidayModalOpen = jest.fn();
      const destroyDriverObj = jest.fn();
      const ongoingQuickSetup = { SETUP_HOLIDAYS: true };

      handleAddHolidayButtonClick(
        setHolidayModalType,
        setIsHolidayModalOpen,
        ongoingQuickSetup,
        destroyDriverObj
      );

      expect(setHolidayModalType).toHaveBeenCalledWith(
        holidayModalTypes.ADD_CALENDAR
      );
      expect(setIsHolidayModalOpen).toHaveBeenCalledWith(true);
      expect(destroyDriverObj).toHaveBeenCalled();
    });
  });

  describe("handleIndividualSelectClick", () => {
    it("should add holiday to selected list if not already selected", () => {
      const setSelectedHolidays = jest.fn();
      const clickHandler = handleIndividualSelectClick(1, setSelectedHolidays);
      clickHandler();
      expect(setSelectedHolidays).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe("handleBulkDeleteClick", () => {
    it("should set bulk delete state and open modal", () => {
      const setSelectedDeleteIds = jest.fn();
      const setPopupTitle = jest.fn();
      const setIsHolidayModalOpen = jest.fn();
      const setHolidayModalType = jest.fn();
      const translateText = (key: string[]) => key[0];

      handleBulkDeleteClick(
        [1, 2],
        setSelectedDeleteIds,
        setPopupTitle,
        setIsHolidayModalOpen,
        setHolidayModalType,
        translateText
      );

      expect(setSelectedDeleteIds).toHaveBeenCalledWith([1, 2]);
      expect(setPopupTitle).toHaveBeenCalledWith("holidayDeleteModalTitle");
      expect(setIsHolidayModalOpen).toHaveBeenCalledWith(true);
      expect(setHolidayModalType).toHaveBeenCalledWith(
        holidayModalTypes.HOLIDAY_SELECTED_DELETE
      );
    });
  });
});
