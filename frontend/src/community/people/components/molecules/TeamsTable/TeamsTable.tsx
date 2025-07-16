import { Box, Stack } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { FC } from "react";

import Button from "~community/common/components/atoms/Button/Button";
import Icon from "~community/common/components/atoms/Icon/Icon";
import IconButton from "~community/common/components/atoms/IconButton/IconButton";
import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import AvatarGroup from "~community/common/components/molecules/AvatarGroup/AvatarGroup";
import Table from "~community/common/components/molecules/Table/Table";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { TableNames } from "~community/common/enums/Table";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { AvatarPropTypes } from "~community/common/types/MoleculeTypes";
import { useGetAllTeams } from "~community/people/api/TeamApi";
import { usePeopleStore } from "~community/people/store/store";
import { EmployeeType } from "~community/people/types/EmployeeTypes";
import { TeamModelTypes, TeamType } from "~community/people/types/TeamTypes";
import useProductTour from "~enterprise/common/hooks/useProductTour";
import { useCommonEnterpriseStore } from "~enterprise/common/store/commonStore";

import styles from "./styles";

interface Props {
  teamSearchTerm: string;
  teamAddButtonButtonClick?: () => void;
  teamAddButtonText?: string;
  isAdmin?: boolean;
}

const TeamsTable: FC<Props> = ({
  teamSearchTerm,
  teamAddButtonButtonClick,
  teamAddButtonText,
  isAdmin = false
}) => {
  const translateText = useTranslator("peopleModule", "teams");
  const ariaTranslateText = useTranslator("peopleAria", "teams");

  const theme: Theme = useTheme();
  const classes = styles(theme);

  const { data: allTeams, isLoading: isTeamsLoading } = useGetAllTeams();

  const {
    setTeamModalType,
    setIsTeamModalOpen,
    setCurrentEditingTeam,
    setCurrentDeletingTeam
  } = usePeopleStore((state) => state);

  const { ongoingQuickSetup } = useCommonEnterpriseStore((state) => ({
    ongoingQuickSetup: state.ongoingQuickSetup
  }));

  const { destroyDriverObj } = useProductTour();
  const columns = [
    { field: "teamName", headerName: translateText(["nameHeader"]) },
    { field: "supervisors", headerName: translateText(["supervisorHeader"]) },
    { field: "teamMembers", headerName: translateText(["teamMemberHeader"]) },
    { field: "actions", headerName: translateText(["actionsHeader"]) }
  ];

  const tableHeaders = columns.map((col) => ({
    id: col.field,
    label: col.headerName
  }));

  const transformToTableRows = () => {
    return (allTeams as TeamType[])
      ?.filter((team: TeamType) =>
        team?.teamName?.toLowerCase()?.includes(teamSearchTerm?.toLowerCase())
      )
      ?.map((teamDetails: TeamType) => ({
        teamId: teamDetails?.teamId,
        teamName: teamDetails?.teamName,
        supervisors:
          (teamDetails?.supervisors?.length < 3 ? (
            teamDetails?.supervisors?.map((supervisor: EmployeeType) => {
              return (
                <Stack key={supervisor?.employeeId} width="100%">
                  <AvatarChip
                    key={supervisor?.employeeId}
                    firstName={supervisor?.firstName}
                    lastName={supervisor?.lastName}
                    avatarUrl={supervisor?.authPic}
                    isResponsiveLayout={true}
                    chipStyles={classes.avatarChip}
                  />
                </Stack>
              );
            })
          ) : (
            <AvatarGroup
              componentStyles={classes.avatarGroup}
              avatars={
                teamDetails?.supervisors
                  ? teamDetails?.supervisors.map(
                      (supervisor: EmployeeType) =>
                        ({
                          firstName: supervisor?.firstName,
                          lastName: supervisor?.lastName,
                          image: supervisor?.authPic
                        }) as AvatarPropTypes
                    )
                  : []
              }
              max={6}
            />
          )) || [],
        teamMembers:
          (teamDetails?.teamMembers?.length < 2 ? (
            teamDetails?.teamMembers?.map((teamMember: EmployeeType) => {
              return (
                <Box key={teamMember?.employeeId} width="100%">
                  <AvatarChip
                    key={teamMember?.employeeId}
                    firstName={teamMember?.firstName}
                    lastName={teamMember?.lastName}
                    avatarUrl={teamMember?.authPic}
                    isResponsiveLayout={true}
                    chipStyles={classes.avatarChip}
                  />
                </Box>
              );
            })
          ) : (
            <AvatarGroup
              componentStyles={classes.avatarGroup}
              avatars={
                teamDetails?.teamMembers
                  ? teamDetails?.teamMembers?.map(
                      (teamMember: EmployeeType) =>
                        ({
                          firstName: teamMember?.firstName,
                          lastName: teamMember?.lastName,
                          image: teamMember?.authPic
                        }) as AvatarPropTypes
                    )
                  : []
              }
              max={6}
            />
          )) || [],
        actions: isAdmin ? (
          <>
            <IconButton
              icon={<Icon name={IconName.EDIT_ICON} />}
              id={`${teamDetails.teamId}-edit-btn`}
              hoverEffect={false}
              buttonStyles={classes.editIconBtn}
              onClick={() => handleEditTeam(teamDetails)}
              ariaLabel={ariaTranslateText(
                ["table", "actionColumn", "editButton", "label"],
                {
                  teamName: teamDetails?.teamName?.toLowerCase() ?? ""
                }
              )}
              ariaDescription={ariaTranslateText(
                ["table", "actionColumn", "editButton", "description"],
                {
                  teamName: teamDetails?.teamName?.toLowerCase() ?? ""
                }
              )}
            />
            <IconButton
              icon={
                <Icon
                  name={IconName.DELETE_BUTTON_ICON}
                  width="10"
                  height="12"
                />
              }
              id={`${teamDetails?.teamId}-delete-btn`}
              hoverEffect={false}
              buttonStyles={classes.deleteIconBtn}
              onClick={() => handleDeleteTeam(teamDetails)}
              ariaLabel={ariaTranslateText(
                ["table", "actionColumn", "deleteButton", "label"],
                {
                  teamName: teamDetails?.teamName?.toLowerCase() ?? ""
                }
              )}
              ariaDescription={ariaTranslateText(
                ["table", "actionColumn", "deleteButton", "description"],
                {
                  teamName: teamDetails?.teamName?.toLowerCase() ?? ""
                }
              )}
            />
          </>
        ) : (
          <Button
            label={translateText(["viewBtnText"])}
            buttonStyle={ButtonStyle.TERTIARY}
            styles={{ width: "61px", height: "42px", padding: "12px 16px" }}
            onClick={() => handleEditTeam(teamDetails)}
          />
        )
      }));
  };

  const handleEditTeam = (teamDetails: TeamType): void => {
    setCurrentEditingTeam(teamDetails);
    setTeamModalType(TeamModelTypes.EDIT_TEAM);
    setIsTeamModalOpen(true);
  };

  const handleDeleteTeam = (teamDetails: TeamType): void => {
    setCurrentDeletingTeam(teamDetails);

    if (allTeams && allTeams.length === 1) {
      setTeamModalType(TeamModelTypes.TEAM_ACTIONS);
    } else {
      setTeamModalType(TeamModelTypes.CONFIRM_DELETE);
    }
    setIsTeamModalOpen(true);
  };

  const addTeamsButton = isAdmin
    ? {
        id: "add-teams-empty-table-screen-button",
        label: teamAddButtonText,
        onClick: () => {
          teamAddButtonButtonClick?.();
          destroyDriverObj();
        },
        shouldBlink: ongoingQuickSetup.DEFINE_TEAMS
      }
    : undefined;

  return (
    <Box sx={classes.tableWrapper}>
      <Table
        tableName={TableNames.TEAMS}
        headers={tableHeaders}
        rows={transformToTableRows()}
        tableHead={{
          customStyles: {
            row: classes.tableHead,
            cell: classes.tableHeaderCellStyles
          }
        }}
        tableBody={{
          emptyState: {
            noData: {
              title:
                allTeams && allTeams?.length > 0
                  ? translateText(["emptyScreen", "title"])
                  : translateText(["emptySearchResult", "title"]),
              description:
                allTeams && allTeams?.length > 0
                  ? translateText(["emptyScreen", "description"])
                  : translateText(["emptySearchResult", "description"]),
              button: addTeamsButton
            }
          },
          loadingState: {
            skeleton: {
              rows: 3
            }
          }
        }}
        tableFoot={{
          pagination: {
            isEnabled: false
          }
        }}
        customStyles={{
          container: classes.tableContainer
        }}
        isLoading={isTeamsLoading}
      />
    </Box>
  );
};

export default TeamsTable;
