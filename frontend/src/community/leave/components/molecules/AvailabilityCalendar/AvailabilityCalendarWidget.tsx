import { Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Box } from "@mui/system";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { DateTime } from "luxon";
import { useRouter } from "next/router";
import { JSX, useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import ROUTES from "~community/common/constants/routes";
import { DATE_FORMAT } from "~community/common/constants/timeConstants";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { useDefaultCapacity } from "~community/configurations/api/timeConfigurationApi";
import { useGetResourceAvailability } from "~community/leave/api/LeaveDashboard";
import { ResourceAvailabilityRecord } from "~community/leave/types/ResourceAvailabilityTypes";
import { getNavigateDays } from "~community/leave/utils/dashboardUtils";

import DateNavigator from "../DateNavigator/DateNavigator";
import AvailabilityCalendarCard from "./AvailabilityCalendarCard";
import AvailabilityWidgetSkeleton from "./AvailabilityWidgetSkeleton";

interface AvailabilityCalendarWidgetProps {
  teams: string | number;
}

const AvailabilityCalendarWidget = ({
  teams
}: AvailabilityCalendarWidgetProps): JSX.Element => {
  const { data: timeConfigData } = useDefaultCapacity();
  const router = useRouter();
  const translateText = useTranslator("leaveModule", "dashboard");
  const numberOfWeeks = 2;

  let navigateDates = getNavigateDays(timeConfigData) * numberOfWeeks;
  const [startDate, setStartDate] = useState(
    DateTime.now().toFormat(DATE_FORMAT)
  );
  const [endDate, setEndDate] = useState(
    DateTime.now().plus({ weeks: numberOfWeeks }).toFormat(DATE_FORMAT)
  );
  const {
    data: resourceAvailability,
    isLoading: isResourceAvailabilityLoading
  } = useGetResourceAvailability(teams, startDate, endDate);

  return (
    <Box sx={{ margin: "1rem 0rem" }}>
      <Box sx={{ mb: 2 }} display={"flex"} justifyContent={"space-between"}>
        <Typography variant="h4">
          {translateText(["resourceAvailability"])}
        </Typography>
        <ButtonV2
          variant={"tertiary"}
          onClick={() =>
            router.replace(ROUTES.DASHBOARD.LEAVE.RESOURCE_AVAILABILITY)
          }
          size={"md"}
          icon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
          iconPosition="end"
        >
          {translateText(["fullCalendar"])}
        </ButtonV2>
      </Box>

      <Box sx={{ width: "100%" }}>
        <Grid
          container
          sx={{
            width: "100%",
            height: "auto"
          }}
          spacing={1}
        >
          {isResourceAvailabilityLoading ? (
            <AvailabilityWidgetSkeleton />
          ) : (
            resourceAvailability
              ?.slice(0, navigateDates)
              ?.map((resourceData: ResourceAvailabilityRecord) => {
                return (
                  <AvailabilityCalendarCard
                    key={resourceData?.date}
                    dateAndMonth={resourceData?.date}
                    day={resourceData?.dayOfWeek}
                    holidays={resourceData?.holidays}
                    availableCount={resourceData?.availableCount}
                    unavailableCount={resourceData?.leaveCount}
                    onLeaveEmployees={resourceData?.leaveRequests}
                    cards={navigateDates / numberOfWeeks}
                    actualDate={resourceData?.actualDate}
                  />
                );
              })
          )}
        </Grid>
        <>
          {/*Forward & Backward Navigator */}
          <DateNavigator
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            navigateWeeks={numberOfWeeks}
            dateFormat={DATE_FORMAT}
          />
        </>
      </Box>
    </Box>
  );
};

export default AvailabilityCalendarWidget;
