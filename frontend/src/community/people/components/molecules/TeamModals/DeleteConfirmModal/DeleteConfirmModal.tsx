import { Box, Typography } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC, useMemo } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import {
  useGetEmployeeTransferableTeams,
  useTransferTeamMembers
} from "~community/people/api/TeamApi";
import { usePeopleStore } from "~community/people/store/store";
import {
  TeamModelTypes,
  TeamNamesType
} from "~community/people/types/TeamTypes";

interface Props {
  onReassign: (transferableMembersMap: Map<number, TeamNamesType[]>) => void;
}

const DeleteConfirmModal: FC<Props> = ({ onReassign }) => {
  const translateText = useTranslator("peopleModule", "teams");
  const {
    setTeamModalType,
    setIsTeamModalOpen,
    setCurrentDeletingTeam,
    currentDeletingTeam
  } = usePeopleStore((state) => state);

  const { setToastMessage } = useToast();

  const deletingTeamId = Number(currentDeletingTeam?.teamId);

  const { data: employeeTransferableTeams, isLoading: transferableTeamsLoading } =
    useGetEmployeeTransferableTeams(deletingTeamId);

  const transferableMembersMap = useMemo<Map<number, TeamNamesType[]>>(() => {
    if (!employeeTransferableTeams) return new Map();

    return new Map(
      employeeTransferableTeams.map((employeeWithTeams) => [
        employeeWithTeams.employeeId,
        employeeWithTeams.transferableTeams
      ])
    );
  }, [employeeTransferableTeams]);

  const hasTransferableMembers = transferableMembersMap.size > 0;
  const isLoadingMemberData = transferableTeamsLoading;
  const showReassignOption = isLoadingMemberData || hasTransferableMembers;

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
      <Typography>
        {translateText([
          showReassignOption
            ? "confirmDeleteModalDes"
            : "confirmDeleteModalDesNoReassign"
        ])}
      </Typography>
      <Box>
        <div className="flex flex-row gap-3 mt-4 justify-end">
          {showReassignOption && (
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
