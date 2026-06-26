import { Box, Stack, Theme, Typography, useTheme } from "@mui/material";
import { ChangeEvent, FC, useEffect, useMemo, useState } from "react";

import NoDataIcon from "~community/common/assets/Icons/NoDataIcon";
import Pagination from "~community/common/components/atoms/Pagination/Pagination";
import AnalyticCardSkeleton from "~community/common/components/molecules/AnalyticCardSkeleton/AnalyticCardSkeleton";
import TableEmptyScreen from "~community/common/components/molecules/TableEmptyScreen/TableEmptyScreen";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetEmployeeEntitlements } from "~community/leave/api/LeaveAnalyticsApi";
import useResponsiveCardSize from "~community/leave/hooks/useResponsiveCardSize";
import { LeaveEntitlementsCardType } from "~community/leave/types/MyRequests";
import { getPercentage } from "~community/leave/utils/LeavePreprocessors";
import entitlementMockData from "~enterprise/leave/data/entitlementMockData.json";

import AnalyticCard from "../AnalyticCard/AnalyticCard";
import useTier from "~enterprise/common/hooks/useTier";

interface Props {
  employeeId: number;
  pageSize: number;
}

const UserAssignedLeaveTypes: FC<Props> = ({ employeeId, pageSize }) => {
  const theme: Theme = useTheme();

  const { isAtLeastCoreTier } = useTier();

  const translateText = useTranslator(
    "peopleModule",
    "individualLeaveAnalytics"
  );

  const { responsivePageSize, responsiveCardSize } =
    useResponsiveCardSize(pageSize);

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [currentEntitlementData, setCurrentEntitlementData] =
    useState<LeaveEntitlementsCardType[]>();

  const { data: entitlementData, isLoading } = useGetEmployeeEntitlements(
    employeeId,
    isAtLeastCoreTier
  );

  const entitlement = useMemo(() => {
    return isAtLeastCoreTier ? entitlementData : entitlementMockData;
  }, [isAtLeastCoreTier, entitlementData]);

  useEffect(() => {
    if (entitlement) {
      entitlement?.sort(
        (a: LeaveEntitlementsCardType, b: LeaveEntitlementsCardType) =>
          a.leaveType.name.localeCompare(b.leaveType.name)
      );
    }
  }, [entitlement]);

  useEffect(() => {
    if (entitlement) {
      setCurrentEntitlementData(
        [...entitlement].splice(
          currentPage * responsivePageSize,
          responsivePageSize
        )
      );
    }
  }, [currentPage, entitlement, responsivePageSize]);

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.grey[50],
        p: "1rem",
        borderRadius: "0.75rem"
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "start",
          width: "full",
          height: "full",
          columnGap: "0.65%",
          rowGap: "0.75rem",
          mr: 0
        }}
      >
        {!isLoading &&
          currentEntitlementData?.length !== 0 &&
          currentEntitlementData?.map(
            (leave: LeaveEntitlementsCardType, index: number) => {
              return (
                <AnalyticCard
                  emoji={leave?.leaveType?.emojiCode}
                  cardTitle={leave?.leaveType?.name}
                  value={leave?.balanceInDays}
                  denominator={leave?.totalDaysAllocated}
                  cardStyles={{
                    minWidth: responsiveCardSize,
                    maxWidth: responsiveCardSize
                  }}
                  pieChartSeriesData={[
                    {
                      name: leave?.leaveType?.name,
                      value: getPercentage(
                        leave.totalDaysAllocated,
                        leave.balanceInDays
                      )
                    }
                  ]}
                  isIndividualCard={true}
                  key={index}
                />
              );
            }
          )}
        {isLoading && (
          <Stack
            direction="row"
            gap={1}
            sx={{
              width: "50%",
              flex: 1,
              p: "0.75rem 1rem 1.25rem",
              backgroundColor: theme.palette.grey[50],
              borderRadius: "0.75rem",
              justifyContent: "space-between",
              marginRight: "0.938rem"
            }}
          >
            <AnalyticCardSkeleton
              style={{ width: "100%" }}
              isBoundary
              isIndividual
              isProgressCircle
            />
            <AnalyticCardSkeleton
              style={{ width: "100%" }}
              isBoundary
              isIndividual
              isProgressCircle
            />
            <AnalyticCardSkeleton
              style={{ width: "100%" }}
              isBoundary
              isIndividual
              isProgressCircle
            />
          </Stack>
        )}
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end"
        }}
      >
        {entitlement?.length > responsivePageSize && (
          <Pagination
            totalPages={Math.floor(
              entitlement?.length % responsivePageSize === 0
                ? entitlement?.length / responsivePageSize
                : entitlement?.length / responsivePageSize + 1
            )}
            currentPage={currentPage}
            onChange={(_event: ChangeEvent<unknown>, value: number) =>
              setCurrentPage(value - 1)
            }
            isNumbersVisible={false}
            paginationStyles={{
              ".MuiPaginationItem-root.Mui-disabled": {
                backgroundColor: theme.palette.grey[100],
                pointerEvents: "none"
              }
            }}
          />
        )}
      </Box>
      {entitlement?.length < 1 && !isLoading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            borderRadius: "0.75rem",
            flexDirection: "column",
            padding: "0.938rem 1.5rem",
            mt: "1.5rem",
            mr: 2,
            height: "14.375rem",
            alignSelf: "center",
            backgroundColor: theme.palette.grey[100]
          }}
        >
          <Typography
            sx={{
              fontSize: "1rem",
              fontWeight: 700,
              mb: "0.75rem"
            }}
          >
            Leave Entitlements
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <TableEmptyScreen
              title={translateText(["emptyCards"])}
              description={translateText(["emptyCardsDesc"])}
            >
              <NoDataIcon />
            </TableEmptyScreen>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default UserAssignedLeaveTypes;
