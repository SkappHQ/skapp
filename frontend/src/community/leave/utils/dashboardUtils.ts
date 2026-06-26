import { DefaultDayCapacityType } from "~community/configurations/types/TimeConfigurationsTypes";

// Resource calendar widget layout should adjust based on the number of working days
// navigateDates refers the number of records per row
export const getNavigateDays = (
  timeConfigData: DefaultDayCapacityType[] | undefined
) => {
  let navigateDates = 0;
  if (timeConfigData?.length === 1 || timeConfigData?.length === 7)
    navigateDates = 7;
  else if (
    timeConfigData?.length === 2 ||
    timeConfigData?.length === 3 ||
    timeConfigData?.length === 6
  )
    navigateDates = 6;
  else if (timeConfigData?.length === 4) navigateDates = 4;
  else if (timeConfigData?.length === 5) navigateDates = 5;
  return navigateDates;
};
