import { Box, Typography } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC, useEffect, useMemo } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import {
  useGetAllTeams,
  useGetMemberTeams,
  useTransferTeamMembers
} from "~community/people/api/TeamApi";
import { usePeopleStore } from "~community/people/store/store";
import {
  TeamModelTypes,
  TeamType,
  TransferableMember
} from "~community/people/types/TeamTypes";

interface Props {
  onReassign: (transferableMembersMap: Map<number, TeamType[]>) => void;
}

const DeleteConfirmModal: FC<Props> = ({ onReassign }) => {
  const translateText = useTranslator("peopleModule", "teams");
  const {
    setTeamModalType,
    setIsTeamModalOpen,
    setCurrentDeletingTeam,
    currentDeletingTeam
  } = usePeopleStore((state) => ({
    setTeamModalType: state.setTeamModalType,
    setIsTeamModalOpen: state.setIsTeamModalOpen,
    setCurrentDeletingTeam: state.setCurrentDeletingTeam,
    currentDeletingTeam: state.currentDeletingTeam
  }));

  const { setToastMessage } = useToast();

  const deletingTeamId = Number(currentDeletingTeam?.teamId);

  const { isLoading: teamsIsLoading, data: allTeams } = useGetAllTeams();
  const {
    data: memberTeams,
    isLoading: memberTeamsLoading,
    isError: memberTeamsError
  } = useGetMemberTeams(deletingTeamId);

  const transferableMembersMap = useMemo<Map<number, TeamType[]>>(() => {
    if (!memberTeams || !allTeams) return new Map();

    const otherTeams = allTeams.filter(
      (team) => Number(team.teamId) !== deletingTeamId
    );
    const transferableMembers: TransferableMember[] = memberTeams
      .map((member) => ({
        employeeId: member.employeeId,
        transferableTeams: otherTeams.filter(
          (team) => !member.teamIds.includes(Number(team.teamId))
        )
      }))
      .filter((member) => member.transferableTeams.length > 0);

    return new Map(
      transferableMembers.map((member) => [
        member.employeeId,
        member.transferableTeams
      ])
    );
  }, [memberTeams, allTeams, deletingTeamId]);

  const hasTransferableMembers = transferableMembersMap.size > 0;
  const isLoadingMemberData = memberTeamsLoading || teamsIsLoading;

  useEffect(() => {
    if (memberTeamsError) {
      setToastMessage({
        open: true,
        toastType: "error",
        title: translateText(["teamDeleteFailTitle"]),
        description: translateText(["teamDeleteFailDes"]),
        isIcon: true
      });
    }
  }, [memberTeamsError, setToastMessage, translateText]);

  const handleSuccess = () => {
    setToastMessage({
      open: true,
      toastType: "success",
      title: translateText(["teamDeleteSuccessTitle"]),
      description: translateText(["teamDeleteSuccessDes"]),
      isIcon: true
    });
  };

  const handleError = () => {
    setToastMessage({
      open: true,
      toastType: "error",
      title: translateText(["teamDeleteFailTitle"]),
      description: translateText(["teamDeleteFailDes"]),
      isIcon: true
    });
  };

  const { mutate } = useTransferTeamMembers(handleSuccess, handleError);

  const handleReassignClick = () => {
    onReassign(transferableMembersMap);
  };

  const handleDeleteClick = async () => {
    setIsTeamModalOpen(false);
    setTeamModalType(TeamModelTypes.CONFIRM_DELETE);

    const transferMembers: never[] = [];

    const data = {
      teamId: currentDeletingTeam?.teamId.toString(),
      transferMembers
    };

    await mutate(data);
    setCurrentDeletingTeam(undefined);
  };

  return (
    <Box>
      <Typography>{translateText(["confirmDeleteModalDes"])}</Typography>
      <Box>
        <div className="flex flex-row gap-3 mt-4 justify-end">
          {(isLoadingMemberData || hasTransferableMembers) && (
            <ButtonV2
              variant={"primary"}
              onClick={handleReassignClick}
              disabled={isLoadingMemberData}
              icon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
              iconPosition="end"
            >
              {translateText(["reassignBtnText"])}
            </ButtonV2>
          )}
          <ButtonV2
            variant={"error"}
            onClick={handleDeleteClick}
            icon={
              <Icon
                name={IconName.DELETE_BUTTON_ICON}
                fill="var(--color-semantic-red-text)"
              />
            }
            iconPosition="end"
          >
            {translateText(["teamDeleteConfirmBtnText"])}
          </ButtonV2>
        </div>
      </Box>
    </Box>
  );
};

export default DeleteConfirmModal;
