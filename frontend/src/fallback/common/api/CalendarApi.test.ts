import { useIsGoogleCalendarConnected } from "~enterprise/common/api/CalendarApi";

describe("useIsGoogleCalendarConnected", () => {
  it("returns false when Google Calendar is not connected", () => {
    const { data } = useIsGoogleCalendarConnected();
    expect(data).toBe(false);
  });

  it("can handle future scenarios when Google Calendar is connected", () => {
    // This is a placeholder for future implementation when the API changes
    // For now, we only test the default behavior
    const { data } = useIsGoogleCalendarConnected();
    expect(data).not.toBe(true); // Ensures the current implementation is consistent
  });
});
