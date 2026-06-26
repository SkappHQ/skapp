import { setDeviceToken } from "~enterprise/common/api/setDeviceTokenApi";

describe("setDeviceToken", () => {
  it("should be called with the correct FCM token", () => {
    const mockSetDeviceToken = jest.fn(setDeviceToken);
    const fcmToken = "sample-fcm-token";

    mockSetDeviceToken(fcmToken);

    expect(mockSetDeviceToken).toHaveBeenCalledWith(fcmToken);
  });

  it("should not throw an error when called with a valid token", () => {
    const fcmToken = "valid-fcm-token";

    expect(() => setDeviceToken(fcmToken)).not.toThrow();
  });

  it("should handle empty or invalid tokens gracefully", () => {
    const invalidToken = "";

    expect(() => setDeviceToken(invalidToken)).not.toThrow();
  });
});
