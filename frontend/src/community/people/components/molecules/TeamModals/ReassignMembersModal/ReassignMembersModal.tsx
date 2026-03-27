import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
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
    <div>
      <p className="my-4">{translateText(["reassignModalDes"])}</p>
      <div className="flex flex-col gap-2 max-h-56 overflow-auto">
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
      </div>
      <div className="flex flex-row justify-end gap-3 mt-4">
        <ButtonV2
          variant={"tertiary"}
          onClick={cancelClick}
          icon={<Icon name={IconName.CLOSE_ICON} />}
          iconPosition="end"
        >
          {translateText(["cancelBtnText"])}
        </ButtonV2>
        <ButtonV2
          variant={"error"}
          onClick={reassignAndDeleteClick}
          icon={
            <Icon
              name={IconName.DELETE_BUTTON_ICON}
              fill="var(--color-semantic-red-text)"
            />
          }
          iconPosition="end"
        >
          {translateText(["reassignAndDeleteBtnText"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default ReassignMembersModal;
