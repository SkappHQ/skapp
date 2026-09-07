import { useEffect } from "react";

import { usePeopleStore } from "../store/store";
import { EditPeopleFormTypes } from "../types/PeopleEditTypes";

const useDefaultTabNavigation = () => {
  const { setNextStep } = usePeopleStore((state) => state);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const tab = new URLSearchParams(window.location.search).get("tab");

    if (!tab) {
      return;
    }

    const matchedStep = Object.values(EditPeopleFormTypes).find(
      (step) => step.toLowerCase() === tab.toLowerCase()
    );

    if (matchedStep) {
      setNextStep(matchedStep);
    }
  }, []);
};

export default useDefaultTabNavigation;
