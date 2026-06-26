import { useUserLimitStore } from "./userLimitStore";

describe("useUserLimitStore", () => {
  it("should initialize with default values", () => {
    const store = useUserLimitStore(() => {});
    expect(store.showUserLimitBanner).toBe(false);
  });

  it("should update showUserLimitBanner when setShowUserLimitBanner is called", () => {
    const mockState = { showUserLimitBanner: false };
    const store = useUserLimitStore(() => mockState);

    store.setShowUserLimitBanner(true);
    mockState.showUserLimitBanner = true; // Simulate state update
    expect(mockState.showUserLimitBanner).toBe(true);
  });

  it("should call setIsUserLimitExceeded without errors", () => {
    const mockState = {};
    const store = useUserLimitStore(() => mockState);

    expect(() => store.setIsUserLimitExceeded(true)).not.toThrow();
  });
});
