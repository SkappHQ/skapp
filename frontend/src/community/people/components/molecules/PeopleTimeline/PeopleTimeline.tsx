import { Box, Divider, Stack, Typography, useMediaQuery } from "@mui/material";
import { FC, useMemo } from "react";

import RightArrowIcon from "~community/common/assets/Icons/RightArrowIcon";
import ReadOnlyChip from "~community/common/components/atoms/Chips/BasicChip/ReadOnlyChip";
import MultipleSkeletons from "~community/common/components/molecules/Skeletons/MultipleSkeletons";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { theme } from "~community/common/theme/theme";
import {
  formatEnumString,
  monthAbbreviations
} from "~community/common/utils/commonUtil";
import { formatISODateToMonthYear } from "~community/common/utils/dateTimeUtils";
import { useGetEmployeeTimeline } from "~community/people/api/PeopleApi";
import { getTimelineValues } from "~community/people/utils/peopleTimelineUtils";
import UpgradeOverlay from "~enterprise/common/components/molecules/UpgradeOverlay/UpgradeOverlay";
import timelineMockData from "~enterprise/people/data/timelineMockData";
import {
  EmployeeTimelineRecordsType,
  EmployeeTimelineType
} from "~enterprise/people/types/PeopleTypes";

import styles from "./styles";
import useTier from "~enterprise/common/hooks/useTier";

interface Props {
  employeeId: number | undefined;
}

const PeopleTimeline: FC<Props> = ({ employeeId }) => {
  const classes = styles(theme);

  const { isCoreTier } = useTier();

  const translateText = useTranslator("peopleModule", "editAllInfo");
  const translateTimelineText = useTranslator(
    "peopleModule",
    "peoples",
    "filters",
    "selectedFiltersFilterItems"
  );

  const isExtraLargeScreen: boolean = useMediaQuery(theme.breakpoints.up("xl"));
  const isXXLScreen: boolean = useMediaQuery(theme.breakpoints.up("2xl"));

  const { data: timelineData, isLoading } = useGetEmployeeTimeline(
    employeeId ?? 0,
    isCoreTier
  );

  const timeline: EmployeeTimelineType[] = useMemo(() => {
    if (isCoreTier) {
      return timelineData !== undefined ? timelineData : [];
    }
    return timelineMockData;
  }, [isCoreTier, timelineData]);

  const getGroupTitle = (date: string): string => {
    const monthAndYear = formatISODateToMonthYear(date);
    return monthAndYear;
  };

  return (
    <UpgradeOverlay>
      <>
        {isLoading && (
          <MultipleSkeletons
            numOfSkeletons={5}
            height={"5rem"}
            styles={{ my: 1 }}
          />
        )}

        {timeline?.length !== 0 &&
          timeline?.map((recordByYear: EmployeeTimelineType) => {
            return (
              <Stack
                key={`${recordByYear?.year}-${recordByYear.month}`}
                sx={classes.outermostStack}
              >
                <Typography sx={classes.eventYearTypography}>
                  {`${monthAbbreviations[Number(recordByYear?.month) - 1]} ${recordByYear?.year}`}
                </Typography>
                <Stack sx={classes.eventContainer}>
                  {recordByYear.employeeTimelineRecords.map(
                    (event: EmployeeTimelineRecordsType, index) => {
                      return (
                        <>
                          {(event.previousValue === null ||
                            event.previousValue !== event.newValue) && (
                            <Stack key={event.id} sx={classes.eventStack}>
                              {isExtraLargeScreen && (
                                <Box
                                  sx={{
                                    ...classes.iconContainerBox,
                                    justifyContent:
                                      recordByYear?.employeeTimelineRecords
                                        ?.length === 1
                                        ? "center"
                                        : index === 0
                                          ? "end"
                                          : recordByYear
                                                ?.employeeTimelineRecords
                                                ?.length -
                                                1 ===
                                              index
                                            ? "start"
                                            : "",
                                    height: isExtraLargeScreen
                                      ? "4.75rem"
                                      : "6.875rem"
                                  }}
                                >
                                  {/* Line */}
                                  {index !== 0 && (
                                    <Divider
                                      orientation="vertical"
                                      sx={classes.iconTopLine}
                                    />
                                  )}
                                  {/* Dot */}
                                  <Box sx={classes.iconDot}></Box>
                                  {/* Line */}
                                  {recordByYear?.employeeTimelineRecords
                                    ?.length -
                                    1 !==
                                    index && (
                                    <Divider
                                      orientation="vertical"
                                      sx={classes.iconBottomLine}
                                    />
                                  )}
                                </Box>
                              )}
                              <Stack
                                direction={
                                  isExtraLargeScreen ? "row" : "column"
                                }
                                sx={{
                                  ...classes.eventContainerStack,
                                  minHeight: isExtraLargeScreen
                                    ? "4rem"
                                    : "6.375rem"
                                }}
                                alignItems={
                                  isExtraLargeScreen ? "center" : "flex-start"
                                }
                                gap={
                                  isExtraLargeScreen
                                    ? isXXLScreen
                                      ? "4.625rem"
                                      : "0.625rem"
                                    : "0.75rem"
                                }
                              >
                                <Stack
                                  sx={{
                                    ...classes.displayDateStack,
                                    width: isExtraLargeScreen
                                      ? "9.375rem"
                                      : "100%"
                                  }}
                                >
                                  <Typography
                                    sx={classes.displayDateTypography}
                                  >
                                    {getGroupTitle(event?.date ?? "")}
                                  </Typography>
                                  {!isExtraLargeScreen && (
                                    <Typography
                                      sx={classes.eventTitleTypography}
                                    >
                                      {formatEnumString(event?.timelineType)}
                                    </Typography>
                                  )}
                                </Stack>
                                <Stack sx={classes.eventDataStack}>
                                  {isExtraLargeScreen && (
                                    <Stack
                                      sx={classes.eventTitleTypographyWrapper}
                                    >
                                      <Typography
                                        sx={classes.eventTitleTypography}
                                      >
                                        {formatEnumString(event?.timelineType)}
                                      </Typography>
                                    </Stack>
                                  )}
                                  <Stack sx={classes.eventNameStack}>
                                    {event?.previousValue && (
                                      <ReadOnlyChip
                                        label={getTimelineValues(
                                          event?.previousValue,
                                          translateTimelineText
                                        )}
                                        chipStyles={classes.basicChip}
                                      />
                                    )}
                                    {event?.newValue && (
                                      <>
                                        {event?.previousValue && (
                                          <Box sx={classes.rightArrowBox}>
                                            <RightArrowIcon />
                                          </Box>
                                        )}
                                        <ReadOnlyChip
                                          label={getTimelineValues(
                                            event?.newValue,
                                            translateTimelineText
                                          )}
                                          chipStyles={{
                                            ...classes.basicChip,
                                            ...(event?.previousValue ===
                                              null && {
                                              maxWidth: "none"
                                            }),
                                            ...(event?.previousValue ===
                                              null && {
                                              "& .MuiChip-label": {
                                                maxWidth: "100%"
                                              }
                                            })
                                          }}
                                        />
                                      </>
                                    )}
                                  </Stack>
                                  {event?.recordedBy && (
                                    <Stack sx={classes.eventCreatedByStack}>
                                      <Typography
                                        sx={classes.lighterTextTypography}
                                      >
                                        {translateText(["entryAdded"])}
                                      </Typography>
                                      <Typography
                                        sx={classes.createdByTypography}
                                      >
                                        {translateText(["by"], {
                                          name: event?.recordedBy
                                        })}
                                      </Typography>
                                    </Stack>
                                  )}
                                </Stack>
                              </Stack>
                            </Stack>
                          )}
                        </>
                      );
                    }
                  )}
                </Stack>
              </Stack>
            );
          })}
      </>
    </UpgradeOverlay>
  );
};

export default PeopleTimeline;
