import { create } from "zustand";

import { addNewCalenderModalSlice } from "./calendarModalSlice";

describe("calendarModalSlice", () => {
  it("should set new calendar details correctly", () => {
    const useStore = create(addNewCalenderModalSlice);
    const { setNewCalendarDetails } = useStore.getState();

    const mockFile = [{ file: new File([], "test.csv") }];
    setNewCalendarDetails(mockFile);

    expect(useStore.getState().newCalenderDetails.acceptedFile).toEqual(
      mockFile
    );
  });

  it("should set isNewCalendarDetailsValid correctly", () => {
    const useStore = create(addNewCalenderModalSlice);
    const { setIsNewCalendarDetailsValid } = useStore.getState();

    setIsNewCalendarDetailsValid(true);
    expect(useStore.getState().isNewCalendarDetailsValid).toBe(true);

    setIsNewCalendarDetailsValid(false);
    expect(useStore.getState().isNewCalendarDetailsValid).toBe(false);
  });

  it("should set calendar errors correctly", () => {
    const useStore = create(addNewCalenderModalSlice);
    const { setCalendarErrors } = useStore.getState();

    setCalendarErrors("Invalid file format");
    expect(useStore.getState().calendarErrors).toBe("Invalid file format");
  });

  it("should reset calendar details correctly", () => {
    const useStore = create(addNewCalenderModalSlice);
    const {
      setNewCalendarDetails,
      setIsNewCalendarDetailsValid,
      setCalendarErrors,
      removeAddedCalendarDetails
    } = useStore.getState();

    const mockFile = [{ file: new File([], "test.csv") }];
    setNewCalendarDetails(mockFile);
    setIsNewCalendarDetailsValid(true);
    setCalendarErrors("Some error");

    removeAddedCalendarDetails();

    expect(useStore.getState().newCalenderDetails.acceptedFile).toEqual([]);
    expect(useStore.getState().isNewCalendarDetailsValid).toBe(false);
    expect(useStore.getState().calendarErrors).toBe("");
  });
});
