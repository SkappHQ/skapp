import { DateTime } from "luxon";

import { useDefaultCapacity } from "~community/configurations/api/timeConfigurationApi";
import { WorkingDaysTypes } from "~community/configurations/types/TimeConfigurationsTypes";

const useGetWorkingDays = () => {
  const { data: timeConfiguration } = useDefaultCapacity();

  const workingDaysArray: WorkingDaysTypes[] =
    timeConfiguration?.map((item) => ({
      id: item.id,
      day: item?.day
    })) || [];

  const isDateWorkingDay = (date: string) => {
    const isoDate = DateTime.fromISO(date);
    const dayOfWeek = isoDate.toFormat("ccc").toUpperCase();
    const isDateWorkingDay = workingDaysArray.some(
      (day) => day?.day === dayOfWeek
    );
    return isDateWorkingDay;
  };

  return { isDateWorkingDay };
};

export default useGetWorkingDays;
