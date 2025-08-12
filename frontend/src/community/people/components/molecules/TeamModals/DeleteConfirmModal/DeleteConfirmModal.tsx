import { Box, Typography } from "@mui/material";

import Button from "~community/common/components/atoms/Button/Button";
import Icon from "~community/common/components/atoms/Icon/Icon";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { useTransferTeamMembers } from "~community/people/api/TeamApi";
import { usePeopleStore } from "~community/people/store/store";
import { TeamModelTypes } from "~community/people/types/TeamTypes";

const DeleteConfirmModal = () => {
  const translateText = useTranslator("peopleModule", "teams");
  const {
    setTeamModalType,
    setIsTeamModalOpen,
    setCurrentDeletingTeam,
    currentDeletingTeam
  } = usePeopleStore((state) => state);

  const { setToastMessage } = useToast();

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
    setTeamModalType(TeamModelTypes.REASSIGN_MEMBERS);
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
      <Typography sx={{ mt: "1rem" }}>
        {translateText(["confirmDeleteModalDes"])}
      </Typography>
      <Box>
        <Button
          label={translateText(["reassignBtnText"])}
          styles={{
            mt: "1rem"
          }}
          buttonStyle={ButtonStyle.PRIMARY}
          endIcon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
          onClick={handleReassignClick}
          accessibility={{
            ariaHidden: true
          }}
        />
        <Button
          label={translateText(["teamDeleteConfirmBtnText"])}
          styles={{
            mt: "1rem"
          }}
          buttonStyle={ButtonStyle.ERROR}
          endIcon={<Icon name={IconName.DELETE_BUTTON_ICON} />}
          onClick={handleDeleteClick}
          accessibility={{
            ariaHidden: true
          }}
        />
      </Box>
    </Box>
  );
};

export default DeleteConfirmModal;
