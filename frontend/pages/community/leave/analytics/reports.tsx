import { SelectChangeEvent, Stack, Typography } from "@mui/material";
import { type NextPage } from "next";
import { MouseEvent, useState } from "react";

import DropdownList from "~community/common/components/molecules/DropdownList/DropdownList";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import CustomAllocationsReportTable from "~community/leave/components/molecules/CustomAllocationsReportTable/CustomAllocationsReportTable";
import LeaveEntitlementsReportsTable from "~community/leave/components/molecules/LeaveEntitlementsReportsTable/LeaveEntitlementsReportsTable";
import LeaveRequestsReportTable from "~community/leave/components/molecules/LeaveRequestsReportTable/LeaveRequestsReportTable";
import { SheetType } from "~community/leave/enums/LeaveReportEnums";
import { useLeaveStore } from "~community/leave/store/store";
import { useGetAllManagerTeams } from "~community/people/api/TeamApi";
import UpgradeOverlay from "~enterprise/common/components/molecules/UpgradeOverlay/UpgradeOverlay";

const LeaveReportPage: NextPage = () => {
  const translateText = useTranslator("leaveModule", "leaveReports");

  const { data: teams } = useGetAllManagerTeams();

  const sheetTypeList = [
    {
      label: translateText(["cutomAllocation"]),
      value: SheetType.CustomAllocation
    },
    {
      label: translateText(["leaveRequests"]),
      value: SheetType.LeaveRequests
    },
    {
      label: translateText(["leaveEntitlement"]),
      value: SheetType.LeaveAllocation
    }
  ];

  const { reportsParams, setReportsParams } = useLeaveStore();

  const [selectedTeamId, setSelectedTeamId] = useState<string | number>(
    reportsParams.teamId
  );
  const [reportType, setReportType] = useState<string>(
    SheetType.LeaveAllocation
  );

  const onChangeTeam = (
    _event: MouseEvent<HTMLElement>,
    item: string | { [key: string]: any }
  ) => {
    setReportsParams("teamId", item);
    setSelectedTeamId(
      typeof item === "string" || typeof item === "number" ? item : ""
    );
  };

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      isBackButtonVisible={true}
      isDividerVisible={true}
    >
      <UpgradeOverlay>
        <>
          <Stack
            sx={{
              padding: "0.5rem",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              justifyContent: "space-between",
              mb: "1rem",
              gap: "1rem"
            }}
          >
            <Stack
              sx={{
                flexDirection: "row",
                alignItems: "center",
                gap: "1rem",
                width: "100%",
                maxWidth: "28.125rem"
              }}
            >
              <Typography>{translateText(["reportType"])}</Typography>
              <DropdownList
                id="reportTypeDropdownList"
                inputName="reportType"
                itemList={sheetTypeList || []}
                value={reportType}
                onChange={(event: SelectChangeEvent) => {
                  setReportType(event.target.value);
                }}
                componentStyle={{
                  width: "100%"
                }}
              />
            </Stack>

            <Stack
              sx={{
                flexDirection: "row",
                alignItems: "center",
                gap: "1rem",
                width: "100%",
                maxWidth: "28.125rem"
              }}
            >
              <Typography>{translateText(["selectTeam"])}</Typography>
              <DropdownList
                isDisabled={!teams?.managerTeams?.length}
                id="teamDropdownList"
                inputName="team"
                itemList={
                  teams?.managerTeams.map((team) => ({
                    label: team.teamName,
                    value: team.teamId
                  })) || []
                }
                value={selectedTeamId}
                onChange={(event: SelectChangeEvent) => {
                  onChangeTeam(
                    event as unknown as MouseEvent<HTMLElement>,
                    event.target.value
                  );
                }}
                componentStyle={{
                  width: "100%"
                }}
              />
            </Stack>
          </Stack>

          {reportType === SheetType.LeaveAllocation && (
            <LeaveEntitlementsReportsTable />
          )}
          {reportType === SheetType.CustomAllocation && (
            <CustomAllocationsReportTable />
          )}
          {reportType === SheetType.LeaveRequests && (
            <LeaveRequestsReportTable />
          )}
        </>
      </UpgradeOverlay>
    </ContentLayout>
  );
};

export default LeaveReportPage;
