import { useRouter } from "next/router";
import { useEffect } from "react";

import { usePeopleStore } from "../store/store";
import { EditPeopleFormTypes } from "../types/PeopleEditTypes";

const useDefaultTabNavigation = () => {
  const router = useRouter();
  const { tab } = router.query;

  const { nextStep, setNextStep } = usePeopleStore((state) => state);

  useEffect(() => {
    if (
      tab === EditPeopleFormTypes.leave.toLowerCase() &&
      nextStep !== EditPeopleFormTypes.leave
    ) {
      setNextStep(EditPeopleFormTypes.leave);
    } else if (
      tab === EditPeopleFormTypes.timesheet.toLowerCase() &&
      nextStep !== EditPeopleFormTypes.timesheet
    ) {
      setNextStep(EditPeopleFormTypes.timesheet);
    }
  }, []);
};

export default useDefaultTabNavigation;
