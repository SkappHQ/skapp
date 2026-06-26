import { parse } from "papaparse";

import { setAttachment } from "./uploadHolidayBulkModalUtils";

jest.mock("papaparse", () => ({
  parse: jest.fn()
}));

describe("setAttachment", () => {
  it("should validate headers and process data correctly", async () => {
    const mockFile = new File(
      ["Date,Name,Holiday Duration\n2023-04-14,New Year,FULLDAY"],
      "test.csv"
    );
    const acceptedFiles = [{ file: mockFile }];
    const setCalendarErrors = jest.fn();
    const setIsNewCalendarDetailsValid = jest.fn();
    const setHolidayBulkList = jest.fn();
    const setNewCalendarDetails = jest.fn();
    const translateText = jest.fn((keys) => keys.join(","));

    parse.mockImplementation((file, options) => {
      options.complete({
        data: [
          { date: "2023-04-14", name: "New Year", holidayDuration: "FULLDAY" }
        ]
      });
    });

    await setAttachment({
      acceptedFiles,
      setCalendarErrors,
      setIsNewCalendarDetailsValid,
      translateText,
      setHolidayBulkList,
      setNewCalendarDetails
    });

    expect(setIsNewCalendarDetailsValid).toHaveBeenCalledWith(true);
    expect(setHolidayBulkList).toHaveBeenCalledWith([
      { date: "2023-04-14", name: "New Year", holidayDuration: "FULLDAY" }
    ]);
  });
});
