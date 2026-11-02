import { Stack } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Box } from "@mui/system";
import { DateTime } from "luxon";
import { JSX, useMemo, useState } from "react";

import BasicChip from "~community/common/components/atoms/Chips/BasicChip/BasicChip";
import { FilledArrow } from "~community/common/components/atoms/FilledArrow/FilledArrow";
import MultiTeamSelector from "~community/common/components/molecules/TeamSelector/MultiTeamSelector";
import YearSelector from "~community/common/components/molecules/YearSelctor/YearSelector";
import { AdminTypes } from "~community/common/types/AuthTypes";
import { getMonthName } from "~community/common/utils/dateTimeUtils";
import { useDefaultCapacity } from "~community/configurations/api/timeConfigurationApi";
import { useGetResourceAvailabilityCalendar } from "~community/leave/api/LeaveDashboard";
import { useGetPolicyResourceAvailability } from "~community/leave/api/PolicyLeaveApi";
import AvailabilityCalendarCard from "~community/leave/components/molecules/AvailabilityCalendar/AvailabilityCalendarCard";
import AvailabilityWidgetSkeleton from "~community/leave/components/molecules/AvailabilityCalendar/AvailabilityWidgetSkeleton";
import useLeavePoliciesEnabled from "~community/leave/hooks/useLeavePoliciesEnabled";
import { ResourceAvailabilityRecord } from "~community/leave/types/ResourceAvailabilityTypes";
import { getNavigateDays } from "~community/leave/utils/dashboardUtils";
import {
  getResourceAvailabilityCalendarRange,
  toResourceAvailabilityRecords
} from "~community/leave/utils/policyLeave/policyLeaveUtils";

const ResourceAvailabilityCalendar = (): JSX.Element => {
  const { data: timeConfigData } = useDefaultCapacity();

  let navigateDates = getNavigateDays(timeConfigData) * 2;

  const [month, setMonth] = useState<number>(DateTime.now().month);
  const [year, setYear] = useState<number>(DateTime.now().year);
  const [teamIds, setTeamIds] = useState<(string | number)[]>([-1]);
  const [_, setTeamNames] = useState<(string | number)[]>([]);

  const { isLeavePoliciesEnabled, isLoading: isPolicyConfigLoading } =
    useLeavePoliciesEnabled();

  const {
    data: legacyResourceAvailability,
    isLoading: isLegacyResourceAvailabilityLoading
  } = useGetResourceAvailabilityCalendar(
    teamIds?.join(),
    year,
    getMonthName(month),
    !isPolicyConfigLoading && !isLeavePoliciesEnabled
  );

  const { startDate, endDate } = getResourceAvailabilityCalendarRange(
    year,
    month
  );

  const {
    data: policyResourceAvailability,
    isLoading: isPolicyResourceAvailabilityLoading
  } = useGetPolicyResourceAvailability({
    teamIds: teamIds?.join(),
    startDate,
    endDate,
    enabled: isLeavePoliciesEnabled
  });

  const workingDays = useMemo(
    () => timeConfigData?.map((config) => config.day) ?? [],
    [timeConfigData]
  );

  const resourceAvailbility = useMemo(() => {
    if (!isLeavePoliciesEnabled) return legacyResourceAvailability;
    return policyResourceAvailability
      ? toResourceAvailabilityRecords(policyResourceAvailability, workingDays)
      : undefined;
  }, [
    isLeavePoliciesEnabled,
    legacyResourceAvailability,
    policyResourceAvailability,
    workingDays
  ]);

  const isResourceAvailbilityLoading =
    isPolicyConfigLoading ||
    isLegacyResourceAvailabilityLoading ||
    isPolicyResourceAvailabilityLoading;

  return (
    <Box>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 1,
          justifyContent: "space-between"
        }}
      >
        <Box sx={{ display: "block" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <YearSelector setYear={setYear} />
            {/*Month Navigator */}
            <Stack
              direction="row"
              gap={"0.25rem"}
              m={"1.5rem 0"}
              justifyContent={"start"}
            >
              <FilledArrow
                onClick={() => {
                  setMonth(month - 1);
                }}
                isRightArrow={false}
                backgroundColor={"grey.100"}
                disabled={month === 1}
              />
              <BasicChip
                label={getMonthName(month)}
                chipStyles={{ backgroundColor: "grey.100", width: "7.5rem" }}
              />
              <FilledArrow
                onClick={() => {
                  setMonth(month + 1);
                }}
                isRightArrow={true}
                backgroundColor={"grey.100"}
                disabled={month === 12}
              />
            </Stack>
          </Box>
        </Box>

        <Box sx={{ display: "block" }}>
          <MultiTeamSelector
            setTeamIds={setTeamIds}
            setTeamNames={setTeamNames}
            moduleAdminType={AdminTypes.LEAVE_ADMIN}
          />
        </Box>
      </Box>

      <Grid
        container
        sx={{
          width: "100%",
          height: "auto"
        }}
        spacing={1}
      >
        {isResourceAvailbilityLoading ? (
          <AvailabilityWidgetSkeleton itemsLength={42} />
        ) : (
          resourceAvailbility?.map(
            (resourceData: ResourceAvailabilityRecord) => {
              return (
                <AvailabilityCalendarCard
                  key={resourceData?.date}
                  dateAndMonth={resourceData?.date}
                  day={resourceData?.dayOfWeek}
                  holidays={resourceData?.holidays}
                  availableCount={resourceData?.availableCount}
                  unavailableCount={resourceData?.leaveCount}
                  onLeaveEmployees={resourceData?.leaveRequests}
                  cards={navigateDates / 2}
                  actualDate={resourceData.actualDate}
                />
              );
            }
          )
        )}
      </Grid>
      <></>
    </Box>
  );
};

export default ResourceAvailabilityCalendar;
