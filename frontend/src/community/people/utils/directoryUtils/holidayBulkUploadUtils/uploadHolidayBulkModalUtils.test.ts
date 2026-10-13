import { parse } from "papaparse";

import { setAttachment } from "./uploadHolidayBulkModalUtils";

jest.mock("papaparse", () => ({
  parse: jest.fn()
}));

describe("setAttachment", () => {
  it("should validate headers and process data correctly", async () => {
    const csvContent =
      "Date,Work Location,Name,Holiday Duration\n2023-04-14,Colombo,New Year,FULLDAY";
    const mockFile = new File([csvContent], "test.csv");
    // jsdom's File does not implement text()
    Object.defineProperty(mockFile, "text", {
      value: jest.fn().mockResolvedValue(csvContent)
    });
    const acceptedFiles = [{ file: mockFile }];
    const setCalendarErrors = jest.fn();
    const setIsNewCalendarDetailsValid = jest.fn();
    const setHolidayBulkList = jest.fn();
    const setNewCalendarDetails = jest.fn();
    const setToastMessage = jest.fn();
    const translateText = jest.fn((keys) => keys.join(","));

    parse.mockImplementation((file, options) => {
      options.complete({
        data: [
          {
            date: "2023-04-14",
            workLocation: "Colombo",
            name: "New Year",
            holidayDuration: "FULLDAY"
          }
        ]
      });
    });

    await setAttachment({
      acceptedFiles,
      setCalendarErrors,
      setIsNewCalendarDetailsValid,
      translateText,
      setHolidayBulkList,
      setNewCalendarDetails,
      setToastMessage
    });

    expect(setToastMessage).not.toHaveBeenCalled();
    expect(setCalendarErrors).not.toHaveBeenCalledWith("invalidTemplateError");
    expect(setIsNewCalendarDetailsValid).toHaveBeenCalledWith(true);
    expect(setHolidayBulkList).toHaveBeenCalledWith([
      {
        date: "2023-04-14",
        name: "New Year",
        holidayDuration: "FULLDAY",
        workLocations: ["Colombo"]
      }
    ]);
  });
});
