import { HolidayDurationType } from "~community/people/types/HolidayTypes";

import {
  getTableHeaders,
  returnDurationLabel,
  transformToTableRows
} from "./holidayTableComponentUtils";

describe("holidayTableComponentUtils", () => {
  describe("returnDurationLabel", () => {
    const mockTranslateText = (key: string[]) => key[0];

    it("should return 'fullDay' for FULLDAY duration", () => {
      const result = returnDurationLabel(
        HolidayDurationType.FULLDAY,
        mockTranslateText
      );
      expect(result).toBe("fullDay");
    });

    it("should return 'halfDayMorning' for HALFDAY_MORNING duration", () => {
      const result = returnDurationLabel(
        HolidayDurationType.HALFDAY_MORNING,
        mockTranslateText
      );
      expect(result).toBe("halfDayMorning");
    });

    it("should return 'halfDayEvening' for HALFDAY_EVENING duration", () => {
      const result = returnDurationLabel(
        HolidayDurationType.HALFDAY_EVENING,
        mockTranslateText
      );
      expect(result).toBe("halfDayEvening");
    });

    it("should return the duration itself for an unknown duration", () => {
      const result = returnDurationLabel(
        "UNKNOWN" as HolidayDurationType,
        mockTranslateText
      );
      expect(result).toBe("UNKNOWN");
    });
  });

  describe("getTableHeaders", () => {
    const mockTranslateText = (key: string[]) => key[0];

    it("should return the correct table headers", () => {
      const headers = getTableHeaders(mockTranslateText);
      expect(headers).toEqual([
        { id: "date", label: "tableDateColumnTitle" },
        { id: "holidayName", label: "tableHolidayNameColumnTitle" }
      ]);
    });
  });

  describe("transformToTableRows", () => {
    const mockTranslateText = (key: string[]) => key[0];
    const mockIsRowDisabled = (id: number) => id === 2;
    const mockDateWrapperStyles = { color: "red" };

    it("should transform holiday data into table rows", () => {
      const holidayData = [
        {
          id: 1,
          name: "Holiday 1",
          date: "2023-10-15",
          holidayDuration: HolidayDurationType.FULLDAY
        },
        {
          id: 2,
          name: "Holiday 2",
          date: "2023-10-16",
          holidayDuration: HolidayDurationType.HALFDAY_MORNING
        }
      ];

      const rows = transformToTableRows(
        holidayData,
        mockTranslateText,
        mockIsRowDisabled,
        mockDateWrapperStyles
      );

      expect(rows).toHaveLength(2);
      expect(rows[0]).toMatchObject({
        id: 1,
        ariaLabel: "Holiday 1",
        holidayName: "Holiday 1",
        actionData: 1
      });
      expect(rows[1]).toMatchObject({
        id: 2,
        ariaLabel: "Holiday 2",
        holidayName: "Holiday 2",
        actionData: 2
      });
    });

    it("should return an empty array if holidayData is undefined", () => {
      const rows = transformToTableRows(
        undefined,
        mockTranslateText,
        mockIsRowDisabled,
        mockDateWrapperStyles
      );
      expect(rows).toEqual([]);
    });
  });
});
