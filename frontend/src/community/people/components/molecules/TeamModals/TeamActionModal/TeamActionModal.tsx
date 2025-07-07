import { Box, Stack, Typography } from "@mui/material";
import React from "react";

import Button from "~community/common/components/atoms/Button/Button";
import Icon from "~community/common/components/atoms/Icon/Icon";
import Modal from "~community/common/components/organisms/Modal/Modal";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { useTransferTeamMembers } from "~community/people/api/TeamApi";
import { usePeopleStore } from "~community/people/store/store";
import { TeamModelTypes } from "~community/people/types/TeamTypes";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  teamId?: number;
  teamName?: string;
}

const TeamActionModal: React.FC<Props> = ({ isOpen, onClose, teamId }) => {
  const translateText = useTranslator("peopleModule", "teams");
  const { setToastMessage } = useToast();
  const {
    setTeamModalType,
    setIsTeamModalOpen,
    setCurrentDeletingTeam,
    setCurrentEditingTeam
  } = usePeopleStore();

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

  const handleClose = () => {
    onClose();
    setCurrentEditingTeam(undefined);
    setTeamModalType(TeamModelTypes.ADD_TEAM);
    setIsTeamModalOpen(true);
  };

  const handleAddNewTeam = () => {
    handleClose();
  };

  const handleDeleteTeam = async () => {
    if (teamId) {
      const transferMembers: never[] = [];
      const data = {
        teamId: teamId.toString(),
        transferMembers
      };

      await mutate(data);
      onClose();
      setCurrentDeletingTeam(undefined);
      setTeamModalType(TeamModelTypes.NONE);
      setIsTeamModalOpen(false);
    }
  };

  return (
    <Modal
      isModalOpen={isOpen}
      onCloseModal={onClose}
      title={translateText(["teamActionModalTitle"])}
    >
      <Box>
        <Typography>{translateText(["teamActionModalDes"])}</Typography>
        <Stack spacing={2} mt={4}>
          <Button
            label={translateText(["teamActionModalBtnText"])}
            buttonStyle={ButtonStyle.PRIMARY}
            endIcon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
            onClick={handleAddNewTeam}
            accessibility={{
              ariaHidden: true
            }}
          />

          <Button
            label={translateText(["teamDeleteConfirmBtnText"])}
            buttonStyle={ButtonStyle.ERROR}
            endIcon={<Icon name={IconName.DELETE_BUTTON_ICON} />}
            onClick={handleDeleteTeam}
            accessibility={{
              ariaHidden: true
            }}
          />
        </Stack>
      </Box>
    </Modal>
  );
};

export default TeamActionModal;
