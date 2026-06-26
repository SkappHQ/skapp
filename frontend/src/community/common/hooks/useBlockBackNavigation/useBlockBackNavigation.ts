import { useEffect } from "react";

import { useTranslator } from "../useTranslator";

const useBlockBackNavigation = () => {
  const translateText = useTranslator("confirmBackNavigation");

  useEffect(() => {
    let blockNavigation = true;

    /**
     * Handles the `popstate` event, which is triggered when the user navigates through the browser's history (e.g., by clicking the back or forward button).
     * If navigation blocking is active, it prompts the user with a confirmation dialog to prevent accidental data loss.
     * If the user confirms, navigation proceeds; otherwise, it cancels the navigation and restores the current history state.
     *
     * @param event - The `PopStateEvent` object containing information about the history state change.
     */
    const handlePopState = (event: PopStateEvent) => {
      if (blockNavigation) {
        const confirmLeave = window.confirm(translateText(["description"]));
        if (!confirmLeave) {
          // Prevent the default 'popstate' behavior (navigation).
          event.preventDefault();
          // Push a new state to the history to prevent the navigation.
          history.pushState(null, "", window.location.href);
        } else {
          blockNavigation = false;
          // Remove the event listener to allow navigation.
          window.removeEventListener("popstate", handlePopState);
          // Go back in history to trigger the navigation.
          history.back();
        }
      }
    };

    // Add the 'popstate' event listener to the window.
    window.addEventListener("popstate", handlePopState);
    // Push an initial state to the history to enable blocking.
    history.pushState(null, "", window.location.href);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
};

export default useBlockBackNavigation;
