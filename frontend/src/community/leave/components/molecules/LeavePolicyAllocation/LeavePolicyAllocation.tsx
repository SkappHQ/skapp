import { Box, Stack } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { type Theme, useTheme } from "@mui/material/styles";
import {
  FC,
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import IconButton from "~community/common/components/atoms/IconButton/IconButton";
import {
  MediaQueries,
  useMediaQuery
} from "~community/common/hooks/useMediaQuery";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { useGetMyPolicyBalances } from "~community/leave/api/PolicyLeaveApi";
import LeaveAllocationSkeleton from "~community/leave/components/molecules/LeaveAllocation/LeaveAllocationSkeleton";
import LeavePolicyCard from "~community/leave/components/molecules/LeavePolicyCard/LeavePolicyCard";
import PolicyLeaveErrorState from "~community/leave/components/molecules/PolicyLeaveErrorState/PolicyLeaveErrorState";
import {
  ALLOCATION_PER_PAGE,
  ALLOCATION_PER_PAGE_MOBILE
} from "~community/leave/constants/stringConstants";
import { usePolicyLeaveStore } from "~community/leave/store/policyLeaveStore";
import { EmployeePolicyBalanceType } from "~community/leave/types/PolicyLeaveTypes";

import styles from "../LeaveAllocation/styles";
import LeavePolicyAllocationEmptyScreen from "./LeavePolicyAllocationEmptyScreen";

const LeavePolicyAllocation: FC = () => {
  const translateAria = useTranslator("leaveAria");
  const translateErrorText = useTranslator(
    "leaveModule",
    "myRequests",
    "leavePolicyAllocation",
    "errorState"
  );
  const theme: Theme = useTheme();
  const classes = styles(theme);

  const isBelow600 = useMediaQuery()(MediaQueries.BELOW_600);

  const selectedYear = usePolicyLeaveStore((state) => state.selectedYear);

  const [currentPage, setCurrentPage] = useState(1);
  const [allocationsPerPage, setAllocationsPerPage] =
    useState(ALLOCATION_PER_PAGE);

  const firstCardRef = useRef<HTMLDivElement | null>(null);

  const {
    data: policyBalances,
    isLoading,
    isError,
    isFetching,
    refetch
  } = useGetMyPolicyBalances(selectedYear);

  useEffect(() => {
    setAllocationsPerPage(
      isBelow600 ? ALLOCATION_PER_PAGE_MOBILE : ALLOCATION_PER_PAGE
    );
    setCurrentPage(1);
  }, [isBelow600]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedYear]);

  const currentAllocations = useMemo(() => {
    const indexOfLastAllocation = currentPage * allocationsPerPage;
    const indexOfFirstAllocation = indexOfLastAllocation - allocationsPerPage;

    return policyBalances?.slice(indexOfFirstAllocation, indexOfLastAllocation);
  }, [currentPage, allocationsPerPage, policyBalances]);

  const totalPages = useMemo(
    () => Math.ceil((policyBalances?.length ?? 0) / allocationsPerPage),
    [policyBalances, allocationsPerPage]
  );

  const handleRetry = (): void => {
    void refetch();
  };

  const handleNextPage = (
    event: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>
  ): void => {
    event.preventDefault();
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = (
    event: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>
  ): void => {
    event.preventDefault();
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  useEffect(() => {
    if (firstCardRef.current) {
      firstCardRef.current?.focus();
    }
  }, [currentPage]);

  return (
    <Box
      role="region"
      aria-label={translateAria(
        ["myRequests", "myLeaveAllocation", "myLeaveAllocationSection"],
        { year: selectedYear }
      )}
    >
      <Grid container spacing={2}>
        {isError ? (
          <PolicyLeaveErrorState
            message={translateErrorText(["message"])}
            retryLabel={translateErrorText(["retry"])}
            onRetry={handleRetry}
            isRetrying={isFetching}
          />
        ) : !isLoading && policyBalances?.length === 0 ? (
          <LeavePolicyAllocationEmptyScreen />
        ) : (
          currentAllocations?.map(
            (policyBalance: EmployeePolicyBalanceType, index: number) => (
              <Grid key={policyBalance.assignmentId} size={{ xs: 6, md: 4 }}>
                <LeavePolicyCard
                  policyBalance={policyBalance}
                  ref={index === 0 ? firstCardRef : undefined}
                />
              </Grid>
            )
          )
        )}
        {isLoading && <LeaveAllocationSkeleton />}
      </Grid>
      {(policyBalances?.length ?? 0) > allocationsPerPage && (
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

export default LeavePolicyAllocation;
