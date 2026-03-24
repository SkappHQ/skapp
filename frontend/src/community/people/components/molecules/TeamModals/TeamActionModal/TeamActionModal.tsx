import { SmallModal } from "@rootcodelabs/skapp-ui";
import React from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { useTransferTeamMembers } from "~community/people/api/TeamApi";
import { usePeopleStore } from "~community/people/store/store";
import { TeamModelTypes } from "~community/people/types/TeamTypes";

interface Props {
  onClose: () => void;
  teamId?: number | string;
}

const TeamActionModal: React.FC<Props> = ({ onClose, teamId }) => {
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

  const handleAddNewTeam = () => {
    onClose();
    setCurrentEditingTeam(undefined);
    setTeamModalType(TeamModelTypes.ADD_TEAM);
    setIsTeamModalOpen(true);
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
    <SmallModal
      isOpen={isOpen}
      onClose={onClose}
      modalHeader={translateText(["teamActionModalTitle"])}
      content={
        <p>{translateText(["teamActionModalDes"])}</p>
      }
      buttons={{
        buttonLeft: {
          variant: "primary",
          children: translateText(["teamActionModalBtnText"]),
          onClick: handleAddNewTeam,
          icon: <Icon name={IconName.RIGHT_ARROW_ICON} />,
          iconPosition: "end"
        },
        buttonRight: {
          variant: "error",
          children: translateText(["teamDeleteConfirmBtnText"]),
          onClick: handleDeleteTeam,
          icon: <Icon name={IconName.DELETE_BUTTON_ICON} fill="var(--color-semantic-red-text)"/>,
          iconPosition: "end"
        }
      }}
    />
  );
};

export default TeamActionModal;
