import { North, South, TrendingUp } from "@mui/icons-material";
import { Box, Chip, Theme, Typography, useTheme } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { JSX, useEffect, useState } from "react";

import { useAuth } from "~community/auth/providers/AuthProvider";
import AnalyticCard from "~community/common/components/molecules/AnalyticCard/AnalyticCard";
import TeamSelector from "~community/common/components/molecules/TeamSelector/TeamSelector";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { AdminTypes } from "~community/common/types/AuthTypes";
import {
  useGetEmploymentBreakdownGraphData,
  useGetGenderDistributionGraphData,
  useGetJobFamilyOverviewGraphData,
  useGetPeopleDashboardAnalytics
} from "~community/people/api/PeopleDashboardApi";
import { employmentBreakdownGraphTypes } from "~community/people/constants/peopleDashboardConstants";
import { EmploymentBreakdownTypes } from "~community/people/enums/peopleDashboardEnums";

import EmployeesWidget from "../../molecules/EmployeesWidget/EmployeesWidget";
import EmploymentBreakdownGraph from "../../molecules/Graphs/EmploymentBreakdownGraph";
import GenderDistributionGraph from "../../molecules/Graphs/GenderDistributionGraph";
import JobFamilyOverviewGraph from "../../molecules/Graphs/JobFamilyOverviewGraph";
import styles from "./styles";

const PeopleDashboard = (): JSX.Element => {
  const translateText = useTranslator("peopleModule", "dashboard");
  const [teamId, setTeamId] = useState<string | number>("");
  const [teamName, setTeamName] = useState<string>(translateText(["all"]));
  const [isFetchingEnabled, setIsFetchingEnabled] = useState<boolean>(false);
  const [dataCategory, setDataCategory] = useState(
    employmentBreakdownGraphTypes.TYPE.value
  );
  const { user } = useAuth();
  const theme: Theme = useTheme();
  const classes = styles(theme);

  const {
    data: employmentBreakdownGraphData,
    isLoading: isEmploymentBreakdownGraphLoading
  } = useGetEmploymentBreakdownGraphData(teamId, isFetchingEnabled);

  const {
    data: genderDistributionGraphData,
    isLoading: isGenderDistributionGraphLoading
  } = useGetGenderDistributionGraphData(teamId, isFetchingEnabled);

  const { data: jobFamilyGraphData, isLoading: isJobFamilyGraphLoading } =
    useGetJobFamilyOverviewGraphData(teamId, isFetchingEnabled);

  const { data: analyticsData } = useGetPeopleDashboardAnalytics(
    teamId,
    isFetchingEnabled
  );

  useEffect(() => {
    if (user) setIsFetchingEnabled(true);
  }, [user, teamId]);

  return (
    <Box>
      <Box sx={classes.container}>
        <Box sx={classes.header}>
          <Typography style={{ textTransform: "uppercase" }}>
            {` ${translateText(["records"])} ${
              teamId === -1 ? translateText(["all"]) : `${teamName}`
            }`}
          </Typography>
          <TeamSelector
            setTeamId={setTeamId}
            setTeamName={setTeamName}
            moduleAdminType={AdminTypes.PEOPLE_ADMIN}
          />
        </Box>
        <Grid container spacing={1}>
          <Grid sx={{ width: { xs: "100%", md: "24.4%" } }}>
            <AnalyticCard
              title={translateText(["analyticsCards.totalEmployees"]) ?? ""}
            >
              <Typography sx={classes.analytic}>
                {analyticsData?.totalEmployees ?? 1}
              </Typography>
            </AnalyticCard>
          </Grid>
          <Grid sx={{ width: { xs: "100%", md: "24.4%" } }}>
            <AnalyticCard
              title={translateText(["analyticsCards.averageAge"]) ?? ""}
            >
              {analyticsData?.averageEmployeeAge ? (
                <div style={{ display: "flex" }}>
                  <Typography sx={classes.analytic}>
                    {String(analyticsData?.averageEmployeeAge?.toFixed(0))}
                  </Typography>
                  <Typography sx={classes.yrs}>
                    {analyticsData?.averageEmployeeAge ? "yrs" : ""}
                  </Typography>
                </div>
              ) : (
                <Typography sx={classes.analytic}>-</Typography>
              )}
            </AnalyticCard>
          </Grid>
          <Grid sx={{ width: { xs: "100%", md: "24.4%" } }}>
            <AnalyticCard
              title={translateText(["analyticsCards.hiresVsExists"]) ?? ""}
            >
              {analyticsData?.employeeHireResponseDto ? (
                <Box sx={classes.hires}>
                  <North sx={classes.iconUp} />

                  <Typography sx={classes.analytic}>
                    {analyticsData?.employeeHireResponseDto?.newHires}
                  </Typography>
                  <South sx={classes.iconDown} />
                  <Typography sx={classes.analytic}>
                    {analyticsData?.employeeHireResponseDto?.existsThisYear}
                  </Typography>
                </Box>
              ) : (
                <Typography sx={classes.analytic}>-</Typography>
              )}
            </AnalyticCard>
          </Grid>
          <Grid sx={{ width: { xs: "100%", md: "24.4%" } }}>
            <AnalyticCard
              title={translateText(["analyticsCards.turnoverRate"]) ?? ""}
            >
              {analyticsData?.employeeTurnoverRateResponseDto ? (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Typography sx={classes.analytic}>
                    {String(
                      analyticsData?.employeeTurnoverRateResponseDto?.turnoverRate?.toFixed(
                        1
                      )
                    )}
                  </Typography>
                  <Chip
                    icon={
                      <TrendingUp
                        style={{
                          color:
                            analyticsData?.employeeTurnoverRateResponseDto
                              ?.turnOverRateChange >= 0
                              ? theme.palette.greens.midDark
                              : theme.palette.error.contrastText
                        }}
                      />
                    }
                    label={`${analyticsData?.employeeTurnoverRateResponseDto?.turnOverRateChange?.toFixed(
                      0
                    )}% ${translateText(["trend"])}`}
                    sx={{
                      color:
                        analyticsData?.employeeTurnoverRateResponseDto
                          ?.turnOverRateChange >= 0
                          ? theme.palette.greens.deepShadows
                          : theme.palette.error.contrastText,
                      backgroundColor:
                        analyticsData?.employeeTurnoverRateResponseDto
                          ?.turnOverRateChange >= 0
                          ? theme.palette.greens.lighter
                          : theme.palette.error.light,
                      [theme.breakpoints.down("md")]: {
                        fontSize: "0.625rem",
                        lineHeight: "0.625rem"
                      },
                      ml: 1
                    }}
                  />
                </div>
              ) : (
                <Typography sx={classes.analytic}>-</Typography>
              )}
            </AnalyticCard>
          </Grid>
        </Grid>
        <Box sx={classes.widgets}>
          <Grid container spacing={1}>
            <Grid sx={{ width: { xs: "100%", md: "49.5%" } }}>
              <GenderDistributionGraph
                chartData={genderDistributionGraphData ?? []}
                isDataLoading={isGenderDistributionGraphLoading}
              />
            </Grid>
            <Grid sx={{ width: { xs: "100%", md: "49.5%" } }}>
              <EmploymentBreakdownGraph
                chartData={
                  dataCategory === EmploymentBreakdownTypes.ALLOCATION
                    ? employmentBreakdownGraphData?.allocation
                    : employmentBreakdownGraphData?.type
                }
                isDataLoading={isEmploymentBreakdownGraphLoading}
                dataCategory={dataCategory}
                setDataCategory={setDataCategory}
              />
            </Grid>
          </Grid>
          <Box sx={classes.widgets}>
            <Grid container spacing={1}>
              <Grid sx={{ width: { xs: "100%", md: "49.5%" } }}>
                <JobFamilyOverviewGraph
                  chartData={jobFamilyGraphData ?? []}
                  isDataLoading={isJobFamilyGraphLoading}
                />
              </Grid>
              <Grid sx={{ width: { xs: "100%", md: "49.5%" } }}>
                <EmployeesWidget team={teamId} />
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PeopleDashboard;
