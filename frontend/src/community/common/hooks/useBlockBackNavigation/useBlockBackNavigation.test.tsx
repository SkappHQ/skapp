import { fireEvent, render } from "@testing-library/react";

import useBlockBackNavigation from "./useBlockBackNavigation";

const TestComponent = () => {
  useBlockBackNavigation();
  return <div>Test Component</div>;
};

describe("useBlockBackNavigation", () => {
  let confirmSpy: jest.SpyInstance;

  beforeEach(() => {
    confirmSpy = jest.spyOn(window, "confirm").mockImplementation(() => true);
    window.history.pushState({}, "Test Title", "/test-url");
  });

  afterEach(() => {
    confirmSpy.mockRestore();
    window.history.replaceState({}, "Test Title", "/");
  });

  it("should add and remove popstate event listener", () => {
    const addEventListenerSpy = jest.spyOn(window, "addEventListener");
    const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");

    const { unmount } = render(<TestComponent />);

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "popstate",
      expect.any(Function)
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "popstate",
      expect.any(Function)
    );

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it("should block navigation and push a new state when confirm returns false", () => {
    confirmSpy.mockImplementation(() => false);
    const pushStateSpy = jest.spyOn(window.history, "pushState");

    render(<TestComponent />);

    fireEvent.popState(window);

    expect(confirmSpy).toHaveBeenCalled();
    expect(pushStateSpy).toHaveBeenCalledWith(null, "", window.location.href);

    pushStateSpy.mockRestore();
  });

  it("should allow navigation when confirm returns true", () => {
    confirmSpy.mockImplementation(() => true);
    const pushStateSpy = jest.spyOn(window.history, "pushState");
    const backSpy = jest.spyOn(window.history, "back");
    const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");

    render(<TestComponent />);

    fireEvent.popState(window);

    expect(confirmSpy).toHaveBeenCalled();
    expect(backSpy).toHaveBeenCalled();
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "popstate",
      expect.any(Function)
    );
    expect(pushStateSpy).toHaveBeenCalledTimes(1); // Only the initial pushState in useEffect

    pushStateSpy.mockRestore();
    backSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it("should not block navigation if component is unmounted", () => {
    const pushStateSpy = jest.spyOn(window.history, "pushState");

    const { unmount } = render(<TestComponent />);
    unmount();

    fireEvent.popState(window);

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(pushStateSpy).toHaveBeenCalledTimes(1); // Only the initial pushState in useEffect

    pushStateSpy.mockRestore();
  });
});
