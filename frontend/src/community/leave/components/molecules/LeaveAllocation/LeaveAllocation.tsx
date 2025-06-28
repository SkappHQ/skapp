import { Box, Stack } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { type Theme, useTheme } from "@mui/material/styles";
import { FC, useEffect, useMemo, useRef, useState } from "react";

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
  const translateAria = useTranslator("leaveAria");
  const theme: Theme = useTheme();
  const classes = styles(theme);

  const isBelow600 = useMediaQuery()(MediaQueries.BELOW_600);

  const { selectedYear } = useLeaveStore((state) => state);

  const [currentPage, setCurrentPage] = useState(1);
  const [allocationsPerPage, setAllocationsPerPage] =
    useState(ALLOCATION_PER_PAGE);

  const shouldFocusFirstCard = useRef(false);
  const firstCardRefs = useRef<{ [key: string]: HTMLElement | null }>({});

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

  useEffect(() => {
    if (
      shouldFocusFirstCard.current &&
      currentAllocations &&
      currentAllocations.length > 0
    ) {
      const firstCardId = currentAllocations[0]?.leaveType?.typeId;
      if (firstCardId && firstCardRefs.current[firstCardId]) {
        firstCardRefs.current[firstCardId]?.focus();
        shouldFocusFirstCard.current = false;
      }
    }
  }, [currentPage, currentAllocations]);

  const totalPages = useMemo(() => {
    return Math.ceil(entitlement?.length / allocationsPerPage);
  }, [entitlement, allocationsPerPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      shouldFocusFirstCard.current = true;
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      shouldFocusFirstCard.current = true;
      setCurrentPage(currentPage - 1);
    }
  };

  const setFirstCardRef = (typeId: number, element: HTMLElement | null) => {
    firstCardRefs.current[typeId] = element;
  };

  return (
    <Box
      role="region"
      aria-label={translateAria(
        ["myRequests", "myLeaveAllocation", "myLeaveAllocationSection"],
        {
          year: selectedYear
        }
      )}
    >
      <Grid container spacing={2}>
        {entitlement?.length === 0 ? (
          <LeaveAllocationEmptyScreen />
        ) : (
          currentAllocations?.map(
            (entitlement: LeaveAllocationDataTypes, index: number) => {
              const isFirstCard = index === 0;
              return (
                <Grid
                  key={entitlement?.leaveType?.typeId}
                  size={{ xs: 6, md: 4 }}
                >
                  <LeaveTypeCard
                    entitlement={entitlement}
                    managers={managerAvailability ?? false}
                    ref={
                      isFirstCard
                        ? (el: HTMLElement | null) =>
                            setFirstCardRef(entitlement?.leaveType?.typeId, el)
                        : undefined
                    }
                  />
                </Grid>
              );
            }
          )
        )}
        {(isLoading || isManagerAvailabilityLoading) && (
          <LeaveAllocationSkeleton />
        )}
      </Grid>
      {entitlement?.length > ALLOCATION_PER_PAGE && (
        <Stack sx={classes.buttonFooter}>
          <IconButton
            onClick={handlePreviousPage}
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
            ariaLabel={translateAria(["applyLeave", "calendar", "back"])}
          />
          <IconButton
            onClick={handleNextPage}
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
            ariaLabel={translateAria(["applyLeave", "calendar", "next"])}
          />
        </Stack>
      )}
    </Box>
  );
};

export default LeaveAllocation;
