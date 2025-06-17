import { Box, Stack } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { type Theme, useTheme } from "@mui/material/styles";
import { FC, useEffect, useMemo, useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import IconButton from "~community/common/components/atoms/IconButton/IconButton";
import {
  MediaQueries,
  useMediaQuery
} from "~community/common/hooks/useMediaQuery";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { useGetLeaveAllocation } from "~community/leave/api/MyRequestApi";
import LeaveTypeCard from "~community/leave/components/molecules/LeaveTypeCard/LeaveTypeCard";
import { ALLOCATION_PER_PAGE } from "~community/leave/constants/stringConstants";
import { useLeaveStore } from "~community/leave/store/store";
import { LeaveAllocationDataTypes } from "~community/leave/types/MyRequests";
import { useCheckIfUserHasManagers } from "~community/people/api/PeopleApi";

import LeaveAllocationEmptyScreen from "./LeaveAllocationEmptyScreen";
import LeaveAllocationSkeleton from "./LeaveAllocationSkeleton";
import styles from "./styles";

const LeaveAllocation: FC = () => {
  const translateAria = useTranslator(
    "leaveAria",
    "myRequests",
    "myLeaveAllocation"
  );
  const theme: Theme = useTheme();
  const classes = styles(theme);
  const translateAria = useTranslator("leaveAria", "applyLeave", "calendar");

  const isBelow600 = useMediaQuery()(MediaQueries.BELOW_600);

  const { selectedYear } = useLeaveStore((state) => state);

  const [currentPage, setCurrentPage] = useState(1);
  const [allocationsPerPage, setAllocationsPerPage] =
    useState(ALLOCATION_PER_PAGE);

  const { data: entitlement, isLoading } = useGetLeaveAllocation(selectedYear);

  const { data: managerAvailability, isLoading: isManagerAvailabilityLoading } =
    useCheckIfUserHasManagers();

  useEffect(() => {
    setAllocationsPerPage(isBelow600 ? 4 : ALLOCATION_PER_PAGE);
  }, [isBelow600]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedYear]);

  const currentAllocations = useMemo(() => {
    const indexOfLastAllocation = currentPage * allocationsPerPage;
    const indexOfFirstAllocation = indexOfLastAllocation - allocationsPerPage;

    return entitlement?.slice(indexOfFirstAllocation, indexOfLastAllocation);
  }, [currentPage, allocationsPerPage, entitlement]);

  const totalPages = useMemo(() => {
    return Math.ceil(entitlement?.length / allocationsPerPage);
  }, [entitlement, allocationsPerPage]);

  return (
    <Box
      role="region"
      aria-label={translateAria(["myLeaveAllocationSection"], {
        year: selectedYear
      })}
    >
      <Grid container spacing={2}>
        {entitlement?.length === 0 ? (
          <LeaveAllocationEmptyScreen />
        ) : (
          currentAllocations?.map((entitlement: LeaveAllocationDataTypes) => {
            return (
              <Grid
                key={entitlement?.leaveType?.typeId}
                size={{ xs: 6, md: 4 }}
              >
                <LeaveTypeCard
                  entitlement={entitlement}
                  managers={managerAvailability ?? false}
                />
              </Grid>
            );
          })
        )}
        {(isLoading || isManagerAvailabilityLoading) && (
          <LeaveAllocationSkeleton />
        )}
      </Grid>
      {entitlement?.length > ALLOCATION_PER_PAGE && (
        <Stack sx={classes.buttonFooter}>
          <IconButton
            onClick={() => setCurrentPage(currentPage - 1)}
            icon={
              <Icon
                name={IconName.CHEVRON_LEFT_ICON}
                width="1rem"
                height="1rem"
              />
            }
            buttonStyles={{
              ...classes.button,
              opacity: currentPage === 1 ? 0.5 : 1
            }}
            disabled={currentPage === 1}
            ariaLabel={translateAria(["back"])}
          />
          <IconButton
            onClick={() => setCurrentPage(currentPage + 1)}
            icon={
              <Icon
                name={IconName.CHEVRON_RIGHT_ICON}
                width="1rem"
                height="1rem"
              />
            }
            buttonStyles={{
              ...classes.button,
              opacity: currentPage === totalPages ? 0.5 : 1
            }}
            disabled={currentPage === totalPages}
            ariaLabel={translateAria(["next"])}
          />
        </Stack>
      )}
    </Box>
  );
};

export default LeaveAllocation;
