import { Box, Stack, Typography } from "@mui/material";
import { useState } from "react";

import Button from "~community/common/components/atoms/Button/Button";
import Icon from "~community/common/components/atoms/Icon/Icon";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { useTransferTeamMembers } from "~community/people/api/TeamApi";
import ReassignMemberRow from "~community/people/components/molecules/ReassignMemberRow/ReassignMemberRow";
import { usePeopleStore } from "~community/people/store/store";
import { TeamModelTypes } from "~community/people/types/TeamTypes";

const ReassignMembersModal = () => {
  const translateText = useTranslator("peopleModule", "teams");
  const {
    currentDeletingTeam,
    setTeamModalType,
    setIsTeamModalOpen,
    setCurrentDeletingTeam
  } = usePeopleStore((state) => state);

  const { mutate } = useTransferTeamMembers();
  const { setToastMessage } = useToast();

  const [memberTeamAssignments, setMemberTeamAssignments] = useState<
    Record<number, number>
  >({});

  const setTeamId = (employeeId: number, teamId: number) => {
    setMemberTeamAssignments((prevAssignments) => ({
      ...prevAssignments,
      [employeeId]: teamId
    }));
  };

  const reassignAndDeleteClick = async () => {
    const transferMembers = [
      ...(currentDeletingTeam?.supervisors || []),
      ...(currentDeletingTeam?.teamMembers || [])
    ].map((member) => ({
      employeeId: +member.employeeId,
      teamId: memberTeamAssignments[+member.employeeId] || null
    }));

    const data = {
      teamId: currentDeletingTeam?.teamId,
      transferMembers
    };

    try {
      await mutate(data);
      setToastMessage({
        open: true,
        toastType: "success",
        title: translateText(["teamDeleteSuccessTitle"]),
        description: translateText(["teamDeleteSuccessDes"]),
        isIcon: true
      });
      setIsTeamModalOpen(false);
      setCurrentDeletingTeam(undefined);
    } catch (error) {
      setToastMessage({
        open: true,
        toastType: "error",
        title: translateText(["teamDeleteFailTitle"]),
        description: translateText(["teamDeleteFailDes"]),
        isIcon: true
      });
    }
  };

  const cancelClick = () => {
    setIsTeamModalOpen(false);
    setTeamModalType(TeamModelTypes.REASSIGN_MEMBERS);
    setCurrentDeletingTeam(undefined);
  };

  return (
    <Box>
      <Typography sx={{ my: "1rem" }}>
        {translateText(["reassignModalDes"])}
      </Typography>
      <Stack gap={"0.5rem"} sx={{ maxHeight: "14.5rem", overflow: "auto" }}>
        {currentDeletingTeam?.supervisors?.map((supervisor) => (
          <ReassignMemberRow
            key={supervisor.employeeId}
            teamMember={supervisor}
            setTeamId={(teamId) =>
              setTeamId(Number(supervisor.employeeId), teamId)
            }
          />
        ))}
        {currentDeletingTeam?.teamMembers?.map((teamMember) => (
          <ReassignMemberRow
            key={teamMember.employeeId}
            teamMember={teamMember}
            setTeamId={(teamId) =>
              setTeamId(Number(teamMember.employeeId), teamId)
            }
          />
        ))}
      </Stack>
      <Box>
        <Button
          label={translateText(["reassignAndDeleteBtnText"])}
          styles={{
            mt: "1rem"
          }}
          buttonStyle={ButtonStyle.ERROR}
          endIcon={<Icon name={IconName.DELETE_BUTTON_ICON} />}
          onClick={reassignAndDeleteClick}
          accessibility={{
            ariaHidden: true
          }}
        />
        <Button
          label={translateText(["cancelBtnText"])}
          styles={{
            mt: "1rem"
          }}
          buttonStyle={ButtonStyle.TERTIARY}
          endIcon={<Icon name={IconName.CLOSE_ICON} />}
          onClick={cancelClick}
          accessibility={{
            ariaHidden: true
          }}
        />
      </Box>
    </Box>
  );
};

export default ReassignMembersModal;
